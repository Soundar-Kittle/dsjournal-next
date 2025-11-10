// import AddJournalPage from "@/components/Dashboard/Journals/JournalPage/AddJournalPage";
// import { getJournalPageByTitle } from "@/utils/journalPage";

// const Page = async ({ searchParams }) => {
//   const params = await searchParams;
//   const jid = String(params?.jid ?? "").trim();

//   // Page title in DB
//   const page = "call_for_paper";

//   // Fetch existing page data (if already created)
//   const data = await getJournalPageByTitle(jid, page);

//   return (
//     <AddJournalPage
//       journal_id={jid}
//       page_title={page}
//       data={data}
//       page_id={data?.id || null}
//     />
//   );
// };

// export default Page;

import AddJournalPage from "@/components/Dashboard/Journals/JournalPage/AddJournalPage";
import { getJournalPageByTitle } from "@/utils/journalPage";

const Page = async ({ searchParams }) => {
  const params = await searchParams;
  const jid = String(params?.jid ?? "").trim();

  const page = "call_for_paper";
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

