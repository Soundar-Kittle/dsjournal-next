import { getEditorialBoardBySlug } from "@/utils/editorialBoard";

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

          <div className="mt-6 space-y-6">
            {section.members.map((m) => (
              <div
                key={m.id}
                className="font-sans text-gray-700 leading-relaxed border-b border-gray-100 pb-3 last:border-none"
              >
                {/* ---- Name ---- */}
                <p className="font-bold text-[17px] md:text-[18px] text-[#212529]-900 mb-1 font-[Poppins,sans-serif]">
                  {m.name},
                </p>

                {/* ---- Address Lines or Constructed Info ---- */}
                {m.has_address && m.address_lines ? (
                  <div
                    className="font-bold text-[12px] text-[#6c757d]-600 whitespace-pre-line font-[sans-serif]"
                    dangerouslySetInnerHTML={{
                      __html: m.address_lines
                        .replace(/<\/?strong>/gi, "")
                        .replace(/<\/?b>/gi, "")
                        .replace(/<\/?p>/gi, "<br>")
                        .replace(/<br\s*\/?>/gi, "<br>")
                        .trim(),
                    }}
                  />
                ) : (
                  <>
                    {m.department && (
                      <p className="font-bold text-[12px] text-[#6c757d]-600">
                        {m.department},
                      </p>
                    )}
                    {m.university && (
                      <p className="font-bold text-[13px] text-[#6c757d]-600">
                        {m.university},
                      </p>
                    )}
                    <p className="font-bold text-[13px] text-[#6c757d]-600">
                      {[m.city, m.state, m.country].filter(Boolean).join(", ")}.
                    </p>
                  </>
                )}

                {/* ---- Email ---- */}
                {m.email && (
                  <p className="font-bold text-[13px] text-[#6c757d]-700 mt-1">
                    <a
                      href={`mailto:${m.email}`}
                      className="hover:text-blue-700 transition-colors duration-150"
                    >
                      {m.email}
                    </a>
                  </p>
                )}

                {/* ---- Profile Link ---- */}
                {m.profile_link && (
                  <a
                    href={m.profile_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-blue-600 hover:text-blue-500 font-bold mt-1 inline-block"
                  >
                    Profile Link
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
