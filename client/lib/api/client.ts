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
    if (typeof window !== "undefined" && !window.location.href.endsWith("/login")) {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  let data: unknown;

  try {
    data = await res.json();
  } catch {
    throw new Error(`Invalid response from server (${res.status})`);
  }

  if (!res.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Request failed with status ${res.status}`;

    throw new Error(message);
  }

  return data as T;
}