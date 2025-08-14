import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  let body: string | FormData | undefined;
  // Resolve API base URL when running behind Cloudflare Pages or separate domains
  const apiBase = (import.meta as any)?.env?.VITE_API_BASE as string | undefined;
  const base = apiBase ? apiBase.replace(/\/$/, "") : "";
  const fullUrl = url.startsWith("http") ? url : `${base}${url}`;

  // Handle different data types
  if (data instanceof FormData) {
    // For FormData, don't set Content-Type (browser will set it with boundary)
    body = data;
  } else if (data) {
    // For JSON data, set Content-Type and stringify
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(data);
  }

  // Add authentication token if available
  const userToken = localStorage.getItem('user_token');
  if (userToken && (url.includes('/api/customer/') || url.includes('/api/auth/') || url.includes('/api/affiliate/'))) {
    headers.Authorization = `Bearer ${userToken}`;
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const apiBase = (import.meta as any)?.env?.VITE_API_BASE as string | undefined;
    const base = apiBase ? apiBase.replace(/\/$/, "") : "";
    const fullUrl = url.startsWith("http") ? url : `${base}${url}`;
    const headers: Record<string, string> = {};

    // Add authentication token if available
    const userToken = localStorage.getItem('user_token');
    if (userToken && (url.includes('/api/customer/') || url.includes('/api/auth/') || url.includes('/api/affiliate/'))) {
      headers.Authorization = `Bearer ${userToken}`;
    }

    const res = await fetch(fullUrl, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
