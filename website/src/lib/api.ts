export type ApiHealth = {
  ok: boolean;
  stripe: boolean;
  mode: "stripe" | "demo";
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${response.status})`);
  }
  return data as T;
}

export async function getHealth(): Promise<ApiHealth | null> {
  try {
    return await request<ApiHealth>("/api/health");
  } catch {
    return null;
  }
}

export async function submitWaitlist(input: { name: string; email: string; goal: string }) {
  return request("/api/waitlist", { method: "POST", body: JSON.stringify(input) });
}

export async function submitContact(input: {
  name: string;
  email: string;
  topic: string;
  message: string;
}) {
  return request("/api/contact", { method: "POST", body: JSON.stringify(input) });
}

export async function startCheckout(input: { name: string; email: string; plan: string }) {
  return request<{ mode: "stripe" | "demo"; url: string; orderId: string }>("/api/checkout", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function confirmOrder(orderId: string) {
  return request<{ ok: boolean; order: Record<string, unknown> }>(`/api/orders/${orderId}/confirm`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function loginMember(input: { name: string; email: string }) {
  return request<{ name: string; email: string; plan: string; member: boolean }>("/api/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getAdminSummary() {
  return request<{
    counts: { waitlist: number; contacts: number; orders: number; members: number };
    recentWaitlist: Array<Record<string, unknown>>;
    recentOrders: Array<Record<string, unknown>>;
  }>("/api/admin/summary");
}
