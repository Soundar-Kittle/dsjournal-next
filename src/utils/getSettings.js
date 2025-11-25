import { createDbConnection } from "@/lib/db";
import { unstable_cache } from "next/cache";

async function fetchSettingsFromDB() {
  const connection = await createDbConnection();
  try {
    const [rows] = await connection.query(`
      SELECT settings_name, settings_value
      FROM settings_admin
    `);

    const settings = {};

    for (const row of rows) {
      let value = row.settings_value;
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === "object") value = parsed;
      } catch {}
      settings[row.settings_name] = value;
    }

    return { ...settings };
  } catch (error) {
    console.error("❌ fetchSettingsFromDB Error:", error);
    throw new Error("Failed to load settings");
  } finally {
    connection.end();
  }
}

export const getSettings = unstable_cache(
  async () => fetchSettingsFromDB(),
  ["site-settings"],
  {
    tags: ["settings"],
  }
);
