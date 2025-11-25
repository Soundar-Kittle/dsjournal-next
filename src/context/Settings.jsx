import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: () =>
      axios
        .get(`/api/settings`)
        .then((r) => {
          const flat = {};
          r.data.rows.forEach(({ settings_name, settings_value }) => {
            try {
              flat[settings_name] =
                typeof settings_value === "string" &&
                (settings_value.startsWith("[") ||
                  settings_value.startsWith("{"))
                  ? JSON.parse(settings_value)
                  : settings_value;
            } catch {
              flat[settings_name] = settings_value;
            }
          });
          return flat;
        }),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img
          src="/logo/logo.png"
          alt="Loading..."
          className="w-36 animate-pulse"
        />
      </div>
    );
  }
  if (error) {
    return <div className="text-red-600">Failed to load settings</div>;
  }

  return (
    <SettingsContext.Provider value={data}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (ctx === null) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
