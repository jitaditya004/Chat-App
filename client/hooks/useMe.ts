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

  useEffect(() => {
    apiFetch<Me>("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}