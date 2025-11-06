import AddJournalPage from "@/components/Dashboard/Journals/JournalPage/AddJournalPage";
import { getJournalPageByTitle } from "@/utils/journalPage";

const Page = async ({ searchParams }) => {
  const params = await searchParams;
  const jid = String(params?.jid ?? "").trim();

  // page_title in DB (based on your schema)
  const page = "paper_submission";

  // Fetch from DB using utils
  const data = await getJournalPageByTitle(jid, page);

  return (
    <AddJournalPage
      journal_id={jid}
      page_title={page}
      data={data}
      page_id={data?.id || null}
    />
  );
};

export default Page;
