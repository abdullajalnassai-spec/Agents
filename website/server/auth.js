import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../data");
const credPath = path.join(dataDir, "owner-credentials.json");

export const OWNER_EMAIL = (
  process.env.OWNER_EMAIL || "abdulla.j.alnassai@gmail.com"
).toLowerCase();
export const OWNER_NAME = process.env.OWNER_NAME || "Abdulla Alnassai";

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const next = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(next, "hex"), Buffer.from(hash, "hex"));
}

export function ensureOwner() {
  fs.mkdirSync(dataDir, { recursive: true });
  let creds;
  if (fs.existsSync(credPath)) {
    creds = JSON.parse(fs.readFileSync(credPath, "utf8"));
  } else {
    const password =
      process.env.OWNER_PASSWORD || crypto.randomBytes(9).toString("base64url");
    const { salt, hash } = hashPassword(password);
    creds = {
      email: OWNER_EMAIL,
      name: OWNER_NAME,
      salt,
      hash,
      passwordOnce: password,
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(credPath, JSON.stringify(creds, null, 2));
    console.log("\n========================================");
    console.log("MERIDIAN OWNER ACCESS (save this)");
    console.log(`Email:    ${creds.email}`);
    console.log(`Password: ${password}`);
    console.log("========================================\n");
  }

  if (process.env.OWNER_PASSWORD) {
    const { salt, hash } = hashPassword(process.env.OWNER_PASSWORD);
    creds = {
      ...creds,
      email: OWNER_EMAIL,
      name: OWNER_NAME,
      salt,
      hash,
      passwordOnce: undefined,
    };
    fs.writeFileSync(credPath, JSON.stringify({ ...creds, passwordOnce: undefined }, null, 2));
  }

  const existing = db.prepare("SELECT id FROM owners WHERE email = ?").get(OWNER_EMAIL);
  if (!existing) {
    db.prepare(
      "INSERT INTO owners (id, name, email, salt, hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(crypto.randomUUID(), OWNER_NAME, OWNER_EMAIL, creds.salt, creds.hash, new Date().toISOString());
  } else {
    db.prepare("UPDATE owners SET salt = ?, hash = ?, name = ? WHERE email = ?").run(
      creds.salt,
      creds.hash,
      OWNER_NAME,
      OWNER_EMAIL,
    );
  }

  return {
    email: OWNER_EMAIL,
    name: OWNER_NAME,
    passwordHint: creds.passwordOnce || "(set via OWNER_PASSWORD or see data/owner-credentials.json)",
  };
}

export function loginOwner(email, password) {
  const normalized = String(email || "").trim().toLowerCase();
  if (normalized !== OWNER_EMAIL) {
    return { error: "This company is private. Only the owner can sign in." };
  }
  const owner = db.prepare("SELECT * FROM owners WHERE email = ?").get(OWNER_EMAIL);
  if (!owner || !verifyPassword(password, owner.salt, owner.hash)) {
    return { error: "Invalid email or password." };
  }
  const token = crypto.randomBytes(32).toString("hex");
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  db.prepare(
    "INSERT INTO sessions (token, email, created_at, expires_at) VALUES (?, ?, ?, ?)",
  ).run(token, OWNER_EMAIL, createdAt, expiresAt);
  return {
    token,
    user: { name: owner.name, email: owner.email, role: "owner", plan: "Owner" },
  };
}

export function logoutOwner(token) {
  if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function getSessionUser(token) {
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT s.token, s.expires_at, o.name, o.email
       FROM sessions s JOIN owners o ON o.email = s.email
       WHERE s.token = ?`,
    )
    .get(token);
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }
  return { name: row.name, email: row.email, role: "owner", plan: "Owner" };
}

export function requireOwner(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : req.headers["x-meridian-token"];
  const user = getSessionUser(token);
  if (!user) {
    res.status(401).json({ error: "Owner login required" });
    return;
  }
  req.owner = user;
  next();
}
