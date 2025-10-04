import { getEditorialBoardBySlug } from "@/utils/editorialBoard";
import Link from "next/link";

export default async function Page({ params }) {
  const { slug } = await params;

  const sortedEditorial = await getEditorialBoardBySlug(slug);

  const editorial = sortedEditorial.sort(
    (a, b) => a.title_order - b.title_order
  );

  return (
    <main>
      <h2 className="text-2xl font-medium mb-2">Editorial Board</h2>

      {editorial.map((section, idx) => (
        <div key={idx} className="mb-4">
          <h3 className="inline-block bg-primary text-white font-medium px-2 py-1 text-xl">
            {section.title}
          </h3>

          <div className="mt-4 space-y-4">
            {section.members.map((m) => (
              <div key={m.id} className="font-medium">
                <p className="font-bold">{m.name},</p>

                {m.has_address ? (
                  <div className="text-xs whitespace-pre-line">
                    {m.address
                      ?.replace(/<\/?strong>/gi, "")
                      ?.replace(/<\/?b>/gi, "")
                      ?.replace(/<br\s*\/?>/gi, "\n")
                      ?.replace(/<\/?p>/gi, "\n")
                      ?.replace(/<\/?[^>]+(>|$)/g, "")
                      .trim()}
                  </div>
                ) : (
                  <>
                    <p className="text-xs">
                      {m.department && `${m.department},`}
                    </p>
                    <p className="text-xs">
                      {m.university && `${m.university},`}
                    </p>
                    <p className="text-xs">
                      {m.city && `${m.city}, `}
                      {m.state && `${m.state}, `}
                      {m.country && `${m.country},`}
                    </p>
                  </>
                )}

                {m.email && (
                  <p className="text-xs">
                    <Link href={`mailto:${m.email}`}>{m.email}</Link>
                  </p>
                )}
                {m.profile_link && (
                  <Link
                    href={m.profile_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue hover:text-light-blue font-bold text-xs"
                  >
                    Profile Link
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
