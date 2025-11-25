import Image from "next/image";
import { getJournalBySlug } from "@/utils/journals"; // your DB helper
import { getJournalPageByTitle } from "@/utils/journalPage";

import { generateDynamicMeta } from "@/lib/seo/generateDynamicMeta";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return await generateDynamicMeta(`${slug}/paper-submission`);
}

export default async function PaperSubmissionPage({ params }) {
  const { slug } = params;
  const journal = await getJournalBySlug(slug);
  if (!journal) {
    return (
      <div className="p-10 text-center text-gray-500">
        <h2 className="text-xl font-semibold mb-2">Journal Not Found</h2>
        <p>Please check the URL or contact the administrator.</p>
      </div>
    );
  }

  // 🧠 Fetch from DB (journal_pages)
  const pageData = await getJournalPageByTitle(journal?.id, "paper_submission");
  const submissionEmail = journal.paper_submission_id || "No E-mail Id found";

  return (
    <div className="py-6">
      <h2 className="text-2xl font-semibold mb-6">Paper Submission</h2>

      {/* --- Submission Mail Section --- */}
      <div className="flex flex-col md:flex-row items-center md:items-center gap-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm md:min-h-[180px]">
        {/* Image */}
        <div className="flex justify-center md:justify-start w-full md:w-[220px] shrink-0">
          <Image
            src="/images/submission-support-img.png"
            alt="Paper Submission"
            width={200}
            height={150}
            className="object-contain"
          />
        </div>

        {/* Mail Info */}
        <div className="flex flex-col justify-center items-center text-center md:!items-center space-y-3 w-full">
          {/* Line 1 */}
          <p className="text-base md:text-lg font-medium text-gray-800 text-center">
            Please send your paper as attached file to mail id:
          </p>

          {/* Line 2 - Email */}
          <a
            href={`mailto:${submissionEmail}`}
            className="text-blue-600 font-semibold hover:underline text-lg"
          >
            {submissionEmail}
          </a>

          {/* Line 3 - Note */}
          <p className="text-sm text-gray-600 leading-relaxed text-center max-w-2xl">
            <span className="font-medium">Note:</span> Kindly add our email
            address{" "}
            <a
              href={`mailto:${submissionEmail}`}
              className="text-blue-600 hover:underline"
            >
              {submissionEmail}
            </a>{" "}
            to your Address Book or Contacts to continue receiving our emails in
            your inbox!
          </p>
        </div>
      </div>

      {/* --- Guidelines Section --- */}
      <div className="space-y-5 leading-relaxed mt-8">
        {/* --- Conditional content or fallback --- */}
        {pageData?.content && pageData.is_active === 1 ? (
          <div
            className="prose max-w-none mt-8"
            dangerouslySetInnerHTML={{ __html: pageData.content }}
          />
        ) : (
          <p className="text-gray-500 mt-8 text-center">No Data Found</p>
        )}
      </div>
    </div>
  );
}

/* --- Utility Components --- */
function SectionTitle({ children }) {
  return (
    <h6 className="font-semibold text-lg mt-5 text-gray-800">{children}</h6>
  );
}

function Paragraph({ children }) {
  return <p className="indent-10 text-gray-700">{children}</p>;
}
