import { getEditorialBoardBySlug } from "@/utils/editorialBoard";
import { getJournalBySlug } from "@/utils/journals";
import { getJournalPageByTitle } from "@/utils/journalPage";

/* ---------------- SEO METADATA ---------------- */
export async function generateMetadata({ params }) {
  const param = await params;
  const slug = param.slug?.toLowerCase();
  const baseUrl = process.env.BASE_URL;
  const journal = await getJournalBySlug(slug);

  if (!journal) {
    return {
      title: "Journal Not Found",
      description: "The requested journal could not be found.",
    };
  }

  return {
    title: journal.journal_name,
    description: `${journal.short_name} (${journal.issn_online}) is a peer-reviewed journal in ${journal.subject}, published by ${journal.publisher}. Started in ${journal.year_started}, it publishes ${journal.publication_frequency}.`,
    keywords: [
      journal.short_name,
      journal.journal_name,
      journal.subject,
      journal.publisher,
      `ISSN ${journal.issn_online}`,
      "Research Journal",
    ],
    authors: [{ name: journal.publisher }],
    publisher: journal.publisher,
    openGraph: {
      title: journal.journal_name,
      description: `${journal.short_name} is an international journal in ${journal.subject}.`,
      url: `${baseUrl}/journals/${slug}`,
      siteName: "Dream Science Journals",
      type: "website",
      images: [
        {
          url: `${baseUrl}/${journal.cover_image}`,
          alt: `${journal.journal_name} Cover`,
        },
        {
          url: `${baseUrl}/${journal.banner_image}`,
          alt: `${journal.journal_name} Banner`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: journal.journal_name,
      description: `${journal.short_name} is a peer-reviewed journal in ${journal.subject}.`,
      images: [`${baseUrl}/${journal.cover_image}`],
    },
    alternates: { canonical: `${baseUrl}/journals/${slug}` },
    other: {
      issn_online: journal.issn_online,
      issn_print:
        journal.issn_print && journal.issn_print.toLowerCase() !== "null"
          ? journal.issn_print
          : undefined,
      doi_prefix: journal.doi_prefix,
      format: journal.format,
      language: journal.language,
      publication_fee: journal.publication_fee,
    },
  };
}

/* ---------------- PAGE COMPONENT ---------------- */
export default async function Page({ params }) {
  const param = await params;
  const slug = param.slug?.toLowerCase();
  const journal = await getJournalBySlug(slug);

  if (!journal) {
    return (
      <div className="text-center py-10 text-gray-700">
        <h2 className="text-2xl font-semibold mb-2">Journal not found.</h2>
        <p>
          Please check the URL or return to the{" "}
          <a href="/journals" className="text-blue-600 underline">
            Journals list
          </a>
          .
        </p>
      </div>
    );
  }

  const [editorialBoard, content] = await Promise.all([
    getEditorialBoardBySlug(slug),
    getJournalPageByTitle(journal.id, "aim_and_scope"),
  ]);

  const editorInChiefGroup = editorialBoard?.find(
    (item) =>
      item.title?.toLowerCase().includes("editor in chief") ||
      item.title?.toLowerCase().includes("chief editor")
  );
  const editor = editorInChiefGroup?.members?.[0];

  const addressHTML = editor?.has_address
    ? editor.address.replace(/<\/?strong>/g, "")
    : `<p>${[
        editor?.department,
        editor?.university,
        editor?.state,
        editor?.country,
      ]
        .filter(Boolean)
        .join(", ")}.</p>`;

  return (
    <div>
      {/* ----------- Aim and Scope ----------- */}
      {/* ----------- Journal Info ----------- */}
      <div className="sm:px-5 mb-12">
        <div className="rounded border shadow-lg bg-white p-3 sm:p-6 md:p-8 flex flex-col md:flex-row gap-6">
          {/* ✅ Cover Image */}
          <div className="relative md:w-48 md:h-64 w-full h-full overflow-hidden md:my-auto">
            {journal.cover_image && (
              <img
                src={`/${journal.cover_image}`}
                alt={journal.journal_name}
                className="object-contain w-full h-full"
              />
            )}
          </div>

          {/* ✅ Journal Details Table */}
          <div className="flex-1 overflow-x-auto text-xs sm:text-sm md:text-base">
            <table className="min-w-full leading-relaxed border-separate border-spacing-y-1 max-sm:text-start">
              <tbody>
                {/* Editor in Chief */}
                {editor && (
                  <tr className="align-top">
                    <td className="font-semibold pr-4 whitespace-nowrap text-[#222]">
                      Editor in Chief
                    </td>
                    <td>
                      {/* {editor ? ( 
                        <div dangerouslySetInnerHTML={{ __html: addressHTML }} />
                      ) : (
                        <span className="text-gray-500">&nbsp;</span> // empty placeholder
                      )} */}
                      {editor ? (
                        <>
                          <span>{editor.name}</span>
                          <div
                            dangerouslySetInnerHTML={{ __html: addressHTML }}
                          />
                        </>
                      ) : (
                        <span className="text-gray-500">&nbsp;</span> // empty placeholder
                      )}
                    </td>
                  </tr>
                )}

                {/* ISSN fields (show only when valid) */}
                {journal.issn_online &&
                  journal.issn_online.toLowerCase() !== "null" && (
                    <tr>
                      <td className="font-semibold pr-4 text-[#222]">
                        ISSN (Online)
                      </td>
                      <td>{journal.issn_online}</td>
                    </tr>
                  )}
                {journal.issn_print &&
                  journal.issn_print.toLowerCase() !== "null" && (
                    <tr>
                      <td className="font-semibold pr-4 text-[#222]">
                        ISSN (Print)
                      </td>
                      <td>{journal.issn_print}</td>
                    </tr>
                  )}

                {journal.subject && (
                  <tr>
                    <td className="font-semibold pr-4 text-[#222]">Subject</td>
                    <td>{journal.subject}</td>
                  </tr>
                )}
                {journal.year_started && (
                  <tr>
                    <td className="font-semibold pr-4 text-[#222]">
                      Year of Starting
                    </td>
                    <td>{journal.year_started}</td>
                  </tr>
                )}
                {journal.publication_frequency && (
                  <tr>
                    <td className="font-semibold pr-4 text-[#222]">
                      Publication Frequency
                    </td>
                    <td>{journal.publication_frequency}</td>
                  </tr>
                )}
                {journal.language && (
                  <tr>
                    <td className="font-semibold pr-4 text-[#222]">Language</td>
                    <td>{journal.language}</td>
                  </tr>
                )}
                {journal.paper_submission_id && (
                  <tr>
                    <td className="font-semibold pr-4 text-[#222]">
                      Paper Submission ID
                    </td>
                    <td className="break-all">{journal.paper_submission_id}</td>
                  </tr>
                )}
                {journal.format && (
                  <tr>
                    <td className="font-semibold pr-4 text-[#222]">
                      Format of Publication
                    </td>
                    <td>{journal.format}</td>
                  </tr>
                )}
                {journal.publication_fee && (
                  <tr>
                    <td className="font-semibold pr-4 text-[#222]">
                      Publication Fee
                    </td>
                    <td>{journal.publication_fee}</td>
                  </tr>
                )}
                {journal.publisher && (
                  <tr>
                    <td className="font-semibold pr-4 text-[#222]">
                      Publisher
                    </td>
                    <td>{journal.publisher}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ----------- Aim and Scope ----------- */}
      {content?.content && content?.is_active === 1 && (
        <div
          className="
            [&_li]:relative
            [&_li]:pl-5
            [&_li::before]:content-['']
            [&_li::before]:absolute
            [&_li::before]:left-0
            [&_li::before]:top-[0.3em]
            [&_li::before]:w-[1em]
            [&_li::before]:h-[1em]
            [&_li::before]:bg-[url('data:image/svg+xml,%3Csvg%20stroke=%22currentColor%22%20fill=%22currentColor%22%20stroke-width=%220%22%20viewBox=%220%200%2016%2016%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath%20fill-rule=%22evenodd%22%20d=%22M3.646%201.646a.5.5%200%200%201%20.708%200l6%206a.5.5%200%200%201%200%20.708l-6%206a.5.5%200%200%201-.708-.708L9.293%208%203.646%202.354a.5.5%200%200%201%200-.708%22%3E%3C/path%3E%3Cpath%20fill-rule=%22evenodd%22%20d=%22M7.646%201.646a.5.5%200%200%201%20.708%200l6%206a.5.5%200%200%201%200%20.708l-6%206a.5.5%200%200%201-.708-.708L13.293%208%207.646%202.354a.5.5%200%200%201%200-.708%22%3E%3C/path%3E%3C/svg%3E')]"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
      )}
    </div>
  );
}
