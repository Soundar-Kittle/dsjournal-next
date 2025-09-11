import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/fetcher";

export function useApiMutation({
  endpoint,
  method = "POST",
  onSuccess,
  onError,
  headers = {},
  options = {},
}) {
  return useMutation({
    mutationFn: (body) => api(endpoint, { method, body, headers }),
    onSuccess,
    onError,
    ...options,
  });
}
