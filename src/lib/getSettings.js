import { createDbConnection } from "./db";

export async function getSettings() {
  const connection = await createDbConnection();
  try {
    const [rows] = await connection.query("SELECT * FROM settings");
    return rows;
  } catch (err) {
    console.error("❌ getSettings error:", err);
    throw err;
  } finally {
    await connection.end();
  }
}
