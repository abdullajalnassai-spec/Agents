const TOKEN_KEY = "meridian.ownerToken";
const USER_KEY = "meridian.ownerUser";

export function getOwnerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getOwnerUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setOwnerSession(token: string, user: { name: string; email: string; role: string; plan: string }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearOwnerSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function ownerRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getOwnerToken();
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${response.status})`);
  }
  return data as T;
}

export async function ownerLogin(email: string, password: string) {
  const result = await ownerRequest<{
    token: string;
    user: { name: string; email: string; role: string; plan: string };
  }>("/api/owner/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setOwnerSession(result.token, result.user);
  return result.user;
}

export async function ownerLogout() {
  try {
    await ownerRequest("/api/owner/logout", { method: "POST", body: "{}" });
  } catch {
    // ignore
  }
  clearOwnerSession();
}

export async function fetchMe() {
  return ownerRequest<{ user: { name: string; email: string; role: string; plan: string } }>("/api/owner/me");
}

export async function runForge(input: { topic: string; audience: string; productType: string }) {
  return ownerRequest<Record<string, unknown>>("/api/forge/run", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listProducts() {
  return ownerRequest<
    Array<{ id: string; title: string; niche: string; status: string; stage: string; updated_at: string }>
  >("/api/products");
}

export async function getProduct(id: string) {
  return ownerRequest<Record<string, unknown>>(`/api/products/${id}`);
}

export async function setProductStatus(id: string, status: string) {
  return ownerRequest(`/api/products/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getAdminSummary() {
  return ownerRequest<{
    counts: Record<string, number>;
    recentWaitlist: Array<Record<string, unknown>>;
    recentOrders: Array<Record<string, unknown>>;
    recentProducts: Array<Record<string, unknown>>;
  }>("/api/admin/summary");
}
