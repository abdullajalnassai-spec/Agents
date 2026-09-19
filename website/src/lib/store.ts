const WAITLIST_KEY = "meridian.waitlist";
const CONTACT_KEY = "meridian.contacts";
const SESSION_KEY = "meridian.session";
const PRODUCTS_KEY = "meridian.products";

export type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  goal: string;
  createdAt: string;
};

export type ContactEntry = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  createdAt: string;
};

export type SessionUser = {
  name: string;
  email: string;
  plan: string;
};

export type MemberProduct = {
  id: string;
  title: string;
  niche: string;
  status: "Draft" | "Launching" | "Live";
  createdAt: string;
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getWaitlist(): WaitlistEntry[] {
  return read<WaitlistEntry[]>(WAITLIST_KEY, []);
}

export function addWaitlistEntry(input: Omit<WaitlistEntry, "id" | "createdAt">) {
  const entry: WaitlistEntry = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...getWaitlist()];
  write(WAITLIST_KEY, next);
  return entry;
}

export function getContacts(): ContactEntry[] {
  return read<ContactEntry[]>(CONTACT_KEY, []);
}

export function addContactEntry(input: Omit<ContactEntry, "id" | "createdAt">) {
  const entry: ContactEntry = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...getContacts()];
  write(CONTACT_KEY, next);
  return entry;
}

export function getSession(): SessionUser | null {
  return read<SessionUser | null>(SESSION_KEY, null);
}

export function setSession(user: SessionUser) {
  write(SESSION_KEY, user);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getProducts(): MemberProduct[] {
  return read<MemberProduct[]>(PRODUCTS_KEY, [
    {
      id: "demo-1",
      title: "Remote Freelancer Starter Kit",
      niche: "Career / freelancing",
      status: "Live",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    },
  ]);
}

export function addProduct(input: Omit<MemberProduct, "id" | "createdAt" | "status">) {
  const product: MemberProduct = {
    ...input,
    id: crypto.randomUUID(),
    status: "Draft",
    createdAt: new Date().toISOString(),
  };
  const next = [product, ...getProducts()];
  write(PRODUCTS_KEY, next);
  return product;
}
