type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${path}`,
      {
        method: options.method ?? "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: options.body
          ? JSON.stringify(options.body)
          : undefined,
      }
    );

    let data: unknown;

    try {
      data = await res.json();
    } catch {
      throw new Error(
        `Server returned an invalid response (${res.status})`
      );
    }

    if (!res.ok) {
      let message = `Request failed with status ${res.status}`;

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof (data as { message: unknown }).message === "string"
      ) {
        message = (data as { message: string }).message;
      }

      throw new Error(message);
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Something went wrong. Please try again.");
  }
}