import AddJournalPage from "@/components/Dashboard/Journals/JournalPage/AddJournalPage";
import { getJournalPageByTitle } from "@/utils/journalPage";

const page = async ({ searchParams }) => {
  const params = await searchParams;
  const jid = String(params?.jid ?? "").trim();
  const page = "topics";
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

export default page;
