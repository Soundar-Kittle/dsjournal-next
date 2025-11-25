import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { getJournalSlug } from "@/utils/getJouralSlug";

/* ---------------------- POST: Activate/Deactivate Journal ---------------------- */
export async function POST(req) {
  const connection = await createDbConnection();
  try {
    const body = await req.json();
    const { journal_id, is_active } = body;

    // Validate input
    if (typeof journal_id === "undefined" || typeof is_active === "undefined") {
      return NextResponse.json(
        { success: false, message: "Missing journal_id or is_active" },
        { status: 400 }
      );
    }

    // Update active status
    await connection.query(`UPDATE journals SET is_active = ? WHERE id = ?`, [
      is_active ? 1 : 0,
      journal_id,
    ]);

    let slug = null;
    if (journal_id) {
      const slugRes = await getJournalSlug(connection, journal_id);
      slug = slugRes.slug;
    }
    revalidateTag("journals");
    revalidateTag("journal_slug");
    revalidatePath("/journals");
    revalidatePath(`/${slug}`, "layout");
    return NextResponse.json({
      success: true,
      message: is_active ? "Journal activated" : "Journal deactivated",
    });
  } catch (error) {
    console.error("Journal activation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update journal status" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
