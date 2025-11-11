import { createDbConnection } from "@/lib/db";
import dayjs from "dayjs";

export async function GET() {
  const nextDate = dayjs().add(1, "month").date(20).format("DD MMMM YYYY");
  const conn = await createDbConnection();
  await conn.query(
    `UPDATE journal_dynamic_values
     SET var_value = ?
     WHERE var_key = 'last_date'`,
    [nextDate]
  );
  conn.release();
  return Response.json({ success: true, newDate: nextDate });
}
