type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${path}`,
    {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: options.body
        ? JSON.stringify(options.body)
        : undefined
    }
  );

  if (res.status === 401) {
    if (typeof window !== "undefined" && !window.location.href.endsWith("/login") ) {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}