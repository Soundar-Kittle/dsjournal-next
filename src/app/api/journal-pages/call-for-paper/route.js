import { NextResponse } from "next/server";
import { getRenderedJournalPage } from "@/lib/journalPageDynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const jid = searchParams.get("jid");
  if (!jid) return NextResponse.json({ error: "Missing journal_id" }, { status: 400 });

  const data = await getRenderedJournalPage(jid, "call_for_paper");
  if (!data)
    return NextResponse.json({ error: "Page not found" }, { status: 404 });

  return NextResponse.json({ success: true, data });
}
