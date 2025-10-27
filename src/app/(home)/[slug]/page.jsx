import { getEditorialBoardBySlug } from "@/utils/editorialBoard";
import { getJournalBySlug } from "@/utils/jounals";
import { getJournalPageByTitle } from "@/utils/journalPage";

export async function generateMetadata({ params }) {
  const param = await params;
  let slug = param.slug;
  const journal = await getJournalBySlug(slug);
  const baseUrl = process.env.BASE_URL;

  return {
    title: journal.journal_name,
    description: `${journal.short_name} (${journal.issn_online}) is a peer-reviewed journal in ${journal.subject}, published by ${journal.publisher}. Started in ${journal.year_started}, it publishes ${journal.publication_frequency}.`,
    keywords: [
      journal.short_name,
      journal.journal_name,
      journal.subject,
      journal.publisher,
      "ISSN " + journal.issn_online,
      "Research Journal",
    ],
    authors: [{ name: journal.publisher }],
    publisher: journal.publisher,
    openGraph: {
      title: journal.journal_name,
      description: `${journal.short_name} is an international journal in ${journal.subject}.`,
      url: `${baseUrl}/${slug}`,
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
    alternates: {
      canonical: `${baseUrl}/${slug}`,
    },
    other: {
      issn_online: journal.issn_online,
      issn_print:
        journal.issn_print !== "null" ? journal.issn_print : undefined,
      doi_prefix: journal.doi_prefix,
      format: journal.format,
      language: journal.language,
      publication_fee: journal.publication_fee,
    },
  };
}

export default async function Page({ params }) {
  const param = await params;
  const slug = param.slug;
  const journal = await getJournalBySlug(slug);
  const editorialBoard = await getEditorialBoardBySlug(slug);
  const content = await getJournalPageByTitle(journal?.id, "aim_and_scope");

  // ✅ Extract Editor in Chief details
  const editorInChiefGroup = editorialBoard?.find(
    (item) =>
      item.title?.toLowerCase().includes("editor in chief") ||
      item.title?.toLowerCase().includes("chief editor")
  );
  const editor = editorInChiefGroup?.members?.[0];

  // ✅ Build address text (remove strong tags)
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
      {/* ----------- Journal Info Card ----------- */}
      <div className="sm:px-5 mb-12">
        <div className="rounded border shadow-lg bg-white p-3 sm:p-6 md:p-8 flex flex-col md:flex-row gap-6">
          {/* ✅ Cover Image */}
          <div className="relative md:w-48 md:h-64 w-full h-full overflow-hidden  md:my-auto">
            {journal?.cover_image && (
              <img
                src={
                  journal?.cover_image ? `/${journal.cover_image}` : "/logo.png"
                }
                alt={journal?.journal_name}
                // fill
                // priority
                className="object-contain w-full h-full"
                // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </div>

          {/* ✅ Table Layout for Details */}
          <div className="flex-1 overflow-x-auto text-xs sm:text-sm md:text-base">
            <table className="min-w-full leading-relaxed border-separate border-spacing-y-1 max-sm:text-start">
              <tbody>
                {/* Editor in Chief */}
                {editor && (
                  <tr className="align-top">
                    <td className="font-semibold pr-4 whitespace-nowrap">
                      <span className="text-[#222] font-bold">Editor in Chief</span>
                    </td>
                    <td>
                      <p>{editor.name},</p>
                      <div dangerouslySetInnerHTML={{ __html: addressHTML }} />
                    </td>
                  </tr>
                )}

                {/* ISSN Online */}
                {journal?.issn_online && (
                  <tr>
                    <td className="font-semibold pr-4 whitespace-nowrap">
                       <span className="text-[#222] font-bold">ISSN (Online)</span>
                    </td>
                    <td>{journal.issn_online}</td>
                  </tr>
                )}

                {/* ISSN Print */}
                {journal?.issn_print && (
                  <tr>
                    <td className="font-semibold pr-4 whitespace-nowrap">
                       <span className="text-[#222] font-bold">ISSN (Print)</span>
                    </td>
                    <td>{journal.issn_print}</td>
                  </tr>
                )}

                {/* Subject */}
                {journal?.subject && (
                  <tr>
                    <td className="font-semibold pr-4 whitespace-nowrap">
                       <span className="text-[#222] font-bold">Subject</span>
                    </td>
                    <td>{journal.subject}</td>
                  </tr>
                )}

                {/* Year of Starting */}
                {journal?.year_started && (
                  <tr>
                    <td className="font-semibold pr-4 whitespace-nowrap">
                       <span className="text-[#222] font-bold">Year of Starting</span>
                    </td>
                    <td>{journal.year_started}</td>
                  </tr>
                )}

                {/* Publication Frequency */}
                {journal?.publication_frequency && (
                  <tr>
                    <td className="font-semibold pr-4 whitespace-nowrap">
                       <span className="text-[#222] font-bold">Publication Frequency</span>
                    </td>
                    <td>{journal.publication_frequency}</td>
                  </tr>
                )}

                {/* Language */}
                {journal?.language && (
                  <tr>
                    <td className="font-semibold pr-4 whitespace-nowrap">
                       <span className="text-[#222] font-bold">Language</span>
                    </td>
                    <td>{journal.language}</td>
                  </tr>
                )}

                {/* Paper Submission */}
                {journal?.paper_submission_id && (
                  <tr>
                    <td className="font-semibold pr-4 whitespace-nowrap">
                       <span className="text-[#222] font-bold">Paper Submission id</span>
                    </td>
                    <td className=" break-all">
                      {journal.paper_submission_id}
                    </td>
                  </tr>
                )}

                {/* Format of Publication*/}
                {journal?.format && (
                  <tr>
                    <td className="font-semibold pr-4 whitespace-nowrap">
                       <span className="text-[#222] font-bold">Format of Publication</span>
                    </td>
                    <td>{journal.format}</td>
                  </tr>
                )}

                {/* Publication Fee */}
                {journal?.publication_fee && (
                  <tr>
                    <td className="font-semibold pr-4 whitespace-nowrap">
                       <span className="text-[#222] font-bold">Publication Fee</span>
                    </td>
                    <td>{journal.publication_fee}</td>
                  </tr>
                )}

                {/* Publisher */}
                {journal?.publisher && (
                  <tr>
                    <td className="font-semibold pr-4 whitespace-nowrap">
                       <span className="text-[#222] font-bold">Publisher</span>
                    </td>
                    <td>{journal.publisher}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ----------- Aim and Scope Section ----------- */}
      {/* {content?.content && content?.is_active === 1 && (
        <div
          className="[&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-1 [&_li]::marker: [&_li]::marker:font-semibold"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
      )} */}

      {/* ----------- Aim and Scope Section ----------- */}
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
            [&_li::before]:bg-[url('data:image/svg+xml,%3Csvg%20stroke=%22currentColor%22%20fill=%22currentColor%22%20stroke-width=%220%22%20viewBox=%220%200%2016%2016%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath%20fill-rule=%22evenodd%22%20d=%22M3.646%201.646a.5.5%200%200%201%20.708%200l6%206a.5.5%200%200%201%200%20.708l-6%206a.5.5%200%200%201-.708-.708L9.293%208%203.646%202.354a.5.5%200%200%201%200-.708%22%3E%3C/path%3E%3Cpath%20fill-rule=%22evenodd%22%20d=%22M7.646%201.646a.5.5%200%200%201%20.708%200l6%206a.5.5%200%200%201%200%20.708l-6%206a.5.5%200%200%201-.708-.708L13.293%208%207.646%202.354a.5.5%200%200%201%200-.708%22%3E%3C/path%3E%3C/svg%3E')]
          "
          dangerouslySetInnerHTML={{
            __html: content.content,
          }}
        />
      )}
    </div>
  );
}
