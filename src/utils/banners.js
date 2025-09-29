import { createDbConnection } from "@/lib/db";

export async function getBanners() {
  const connection = await createDbConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM banners WHERE status = 1`
    );

    return {
      success: true,
      rows,
    };
  } finally {
    await connection.end();
  }
}
