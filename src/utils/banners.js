import { createDbConnection } from "@/lib/db";
import { unstable_cache } from "next/cache";

export async function _getBanners() {
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

export const getBanners = unstable_cache(
  async () => _getBanners(),
  ["banners-list"],
  {
    tags: ["banners"],
  }
);
