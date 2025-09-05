import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  method: string = 'GET',
  data?: unknown | undefined,
  options: { headers?: Record<string, string> } = {}
): Promise<any> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add admin token for admin routes and team management
  if (url.includes('/api/admin/') || url.includes('/api/team')) {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      headers["Authorization"] = `Bearer ${adminToken}`;
    }
  }
  
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
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
      staleTime: 0, // Always consider data stale
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchOnMount: true, // Refetch when component mounts
      refetchOnReconnect: true, // Refetch when network reconnects
      retry: 1, // Retry failed requests once
      retryDelay: 1000, // Wait 1 second before retry
    },
    mutations: {
      retry: 1, // Retry failed mutations once
      retryDelay: 1000,
    },
  },
});
