"use client";

import { useMe } from "@/hooks/useMe";
import { redirect } from "next/navigation";

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useMe();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    redirect("/login");
  }

  return <div>{children}</div>;
}