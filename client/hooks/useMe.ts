
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";

export type Me = {
  _id: string;
  username: string;
};

export function useMe() {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setError(null);

        const data = await apiFetch<Me>("/auth/me");

        setUser(data);
      } catch (err) {
        console.error("Failed to fetch current user:", err);

        setUser(null);
        setError("Failed to load user");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return {
    user,
    loading,
    error,
  };
}

