import { headers } from "next/headers";
import { notFound } from "next/navigation";
import BoardClient from "@/components/Dashboard/EditorialBoard/Dnd/BoardClient";

/* helper to build absolute fetch url */
function buildUrl(path) {
  const host = headers().get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}${path}`;
}

export default async function EditorialBoardPage({ params, searchParams }) {
  const short = await params;
  const journalId = await searchParams?.jid;

  /* Fetch journal only when we don't have the id */
  let journal;
  if (journalId) {
    // quick stub; use ID immediately
    journal = { id: Number(journalId), short_name: short };
  } else {
    const host = headers().get("host");
    const protocol = host?.startsWith("localhost") ? "http" : "https";
    const jRes = await fetch(
      `${protocol}://${host}/api/journals?short=${short}`,
      {
        cache: "no-store",
      }
    );
    if (!jRes.ok) notFound();
    const jPayload = await jRes.json();
    journal = Array.isArray(jPayload.journals)
      ? jPayload.journals[0]
      : jPayload.journals ?? jPayload.journal;
    if (!journal) notFound();
  }

  /* 2️⃣ fetch titles (active only) */
  const tRes = await fetch(buildUrl("/api/editorial-titles"), {
    cache: "no-store",
  });
  const titles = (await tRes.json()).titles.filter((t) => t.status === 1);

  /* 3️⃣ fetch roles for this journal */
  const rRes = await fetch(
    buildUrl(`/api/journal-editorial-roles?journalId=${journal.id}`),
    { cache: "no-store" }
  );
  const roles = (await rRes.json()).roles;

  /* 4️⃣ fetch members (map by id for fast lookup) */
  const mRes = await fetch(
    buildUrl("/api/editorial-members?page=1&limit=1000"),
    {
      cache: "no-store",
    }
  );
  const membersArr = (await mRes.json()).members;
  const members = Object.fromEntries(membersArr.map((m) => [m.id, m]));

  /* 5️⃣ build grouped structure {title => [members]} */
  const board = titles
    .map((title) => {
      const people = roles
        .filter((r) => r.title_id === title.id)
        .map((r) => members[r.member_id])
        .filter(Boolean);

      return { title, people };
    })
    .filter((group) => group.people.length > 0);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Editorial Board</h1>
      <BoardClient journalId={journal.id} board={board} />
    </main>
  );
}
