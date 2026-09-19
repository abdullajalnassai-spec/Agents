import { ownerAuth } from "../data/content";
import { runFullForge, type ForgeResult } from "./forge";

const TOKEN_KEY = "emonphenom.ownerToken";
const USER_KEY = "emonphenom.ownerUser";
const PRODUCTS_KEY = "emonphenom.products";

export type OwnerUser = {
  name: string;
  email: string;
  role: "owner";
  plan: "Owner";
};

export type StoredProduct = {
  id: string;
  title: string;
  niche: string;
  status: "Draft" | "Launching" | "Live";
  stage: string;
  created_at: string;
  updated_at: string;
  payload: ForgeResult;
};

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function deriveHash(password: string, saltHex: string, iterations: number) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(saltHex),
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  return bytesToHex(bits);
}

export function getOwnerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getOwnerUser(): OwnerUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as OwnerUser) : null;
  } catch {
    return null;
  }
}

export function setOwnerSession(token: string, user: OwnerUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearOwnerSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function ownerLogin(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (normalized !== ownerAuth.email) {
    throw new Error("This HQ is private. Only the owner can sign in.");
  }
  const hash = await deriveHash(password, ownerAuth.saltHex, ownerAuth.iterations);
  if (hash !== ownerAuth.hashHex) {
    throw new Error("Invalid email or password.");
  }
  const token = crypto.randomUUID();
  const user: OwnerUser = {
    name: ownerAuth.name,
    email: ownerAuth.email,
    role: "owner",
    plan: "Owner",
  };
  setOwnerSession(token, user);
  return user;
}

export async function ownerLogout() {
  clearOwnerSession();
}

export async function fetchMe() {
  const user = getOwnerUser();
  const token = getOwnerToken();
  if (!user || !token) throw new Error("Not signed in");
  return { user };
}

function readProducts(): StoredProduct[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    return raw ? (JSON.parse(raw) as StoredProduct[]) : [];
  } catch {
    return [];
  }
}

function writeProducts(products: StoredProduct[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export async function runForge(input: { topic: string; audience: string; productType: string }) {
  if (!getOwnerToken()) throw new Error("Owner login required");
  const pack = runFullForge(input);
  const now = new Date().toISOString();
  const product: StoredProduct = {
    id: crypto.randomUUID(),
    title: pack.product.title,
    niche: pack.research.niche,
    status: "Draft",
    stage: "launch",
    created_at: now,
    updated_at: now,
    payload: pack,
  };
  writeProducts([product, ...readProducts()]);
  return { id: product.id, ...pack };
}

export async function listProducts() {
  if (!getOwnerToken()) throw new Error("Owner login required");
  return readProducts().map(({ payload: _payload, ...rest }) => rest);
}

export async function getProduct(id: string) {
  if (!getOwnerToken()) throw new Error("Owner login required");
  const found = readProducts().find((p) => p.id === id);
  if (!found) throw new Error("Product not found");
  return found;
}

export async function setProductStatus(id: string, status: StoredProduct["status"]) {
  const products = readProducts();
  const next = products.map((p) =>
    p.id === id ? { ...p, status, updated_at: new Date().toISOString() } : p,
  );
  writeProducts(next);
  return { ok: true, status };
}

export async function getAdminSummary() {
  if (!getOwnerToken()) throw new Error("Owner login required");
  const products = readProducts();
  return {
    counts: {
      waitlist: 0,
      contacts: 0,
      orders: 0,
      members: 1,
      products: products.length,
    },
    recentWaitlist: [] as Array<Record<string, unknown>>,
    recentOrders: [] as Array<Record<string, unknown>>,
    recentProducts: products.slice(0, 10).map((p) => ({
      id: p.id,
      title: p.title,
      niche: p.niche,
      status: p.status,
      updated_at: p.updated_at,
    })),
  };
}
