import AddJournalPage from "@/components/Dashboard/Journals/JournalPage/AddJournalPage";
import { getJournalPageByTitle } from "@/utils/journalPage";

const Page = async ({ searchParams }) => {
  const params = await searchParams;
  const jid = String(params?.jid ?? "").trim();
  const page = "mode_of_payment";
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
