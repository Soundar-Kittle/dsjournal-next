export async function getJournalSlug(connection, journal_id) {
  const [[jr]] = await connection.query(
    "SELECT short_name FROM journals WHERE id = ? LIMIT 1",
    [journal_id]
  );

  if (!jr) {
    return { error: true, message: "Invalid journal_id." };
  }

  let prefix = (jr.short_name || "").trim().toUpperCase();
  if (prefix.startsWith("DS-")) {
    prefix = prefix.replace(/^DS-/, "");
  }
  const journalSlug = prefix.toLowerCase();
  return { error: false, slug: journalSlug, raw: prefix };
}
