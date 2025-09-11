import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/fetcher";
export function useApiQuery({
  key,
  endpoint,
  method = "GET",
  queryParams = {},
  enabled = true,
  options = {},
}) {
  return useQuery({
    queryKey: [key, queryParams],
    queryFn: () => api(endpoint, { method, queryParams }),
    enabled,
    ...options,
  });
}
