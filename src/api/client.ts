export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "";

let tokenGetter: (() => string | undefined) | undefined;
export function setTokenGetter(fn: () => string | undefined) {
  tokenGetter = fn;
}

type RequestOptions = RequestInit & { skipJson?: boolean; token?: string };
type ApiError = Error & { status?: number; body?: unknown };

async function request<T = unknown>(
  input: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = input.startsWith("http")
    ? input
    : `${API_BASE.replace(/\/$/, "")}/${input.replace(/^\//, "")}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  const token = options.token ?? tokenGetter?.();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const text = await res.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    const err: ApiError = new Error(res.statusText || "Request failed");
    err.status = res.status;
    err.body = body;
    throw err;
  }

  if (options.skipJson || res.status === 204) return undefined as unknown as T;

  return (await res.json()) as T;
}

export default { request };
