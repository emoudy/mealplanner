import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  console.log("Auth state:", { user, isLoading, isAuthenticated: !!user }); // Debug log

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
