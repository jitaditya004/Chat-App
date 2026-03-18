import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiFetch("/conversations")
  });
};