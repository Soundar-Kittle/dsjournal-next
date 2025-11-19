import { useApiMutation, useApiQuery } from "@/hooks";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";

export const settings = {
  add: {
    url: "/settings",
    method: "POST",
    key: ["settings", "add"],
  },
  get: {
    url: "/settings",
    method: "GET",
    key: ["settings", "all"],
  },
};

export const useSettingsMutation = () => {
  const config = settings.add;

  return useApiMutation({
    endpoint: config.url,
    method: config.method,

    onSuccess(res) {
      queryClient.invalidateQueries(settings.get.key);
      toast.success(res?.message || `Settings updated`);
    },

    onError(err) {
      toast.error(err?.message || "Something went wrong");
    },
  });
};

export const useSettings = () =>
  useApiQuery({
    key: settings.get.key,
    endpoint: settings.get.url,
    method: settings.get.method,
  });
