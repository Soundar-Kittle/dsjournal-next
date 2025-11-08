// import PageHeader from "@/components/Home/PageHeader";
// import Breadcrumbs from "@/components/ui/Breadcrumbs";
// import SideMenu from "@/components/Home/SideMenu";
// import { getJournalBySlug } from "@/utils/jounals";

// export default async function JournalDetailLayout({ params, children }) {
//   const param = await params;
//   let slug = param.slug;
//   const journal = await getJournalBySlug(slug);

//   const menu = [
//     {
//       menu_label: "Aim & Scope",
//       menu_link: `/${slug}`,
//     },
//     {
//       menu_label: "Editorial Board",
//       menu_link: `/${slug}/editorial-board`,
//     },
//     {
//       menu_label: "Papper Submission",
//       menu_link: `/${slug}/paper-submission`,
//     },
//     {
//       menu_label: "Current Issue",
//       menu_link: `/${slug}/current-issue`,
//     },
//     { menu_label: "Archives", menu_link: `/${slug}/archives` },
//     {
//       menu_label: "Topics",
//       menu_link: `/${slug}/topics`,
//     },
//     {
//       menu_label: "Publication Ethics",
//       menu_link: "/for-authors/publication-ethics",
//     },
//     {
//       menu_label: "Guidelines for Authors",
//       menu_link: "/for-authors/author-guideline",
//     },
//     {
//       menu_label: "Guidelines for Editors",
//       menu_link: "/for-editors",
//     },
//     {
//       menu_label: "Guidelines for Reviewers",
//       menu_link: "/for-reviewers",
//     },

//     { menu_label: "APC", menu_link: `/${slug}/apc` },
//     {
//       menu_label: "Paper Template",
//       menu_link: `/${journal?.paper_template || ""}`,
//       name: `${journal?.short_name} Paper Template`,
//     },
//     {
//       menu_label: "Copyright Form",
//       menu_link: `/${journal?.copyright_form || ""}`,
//       name: `${journal?.short_name} Copyright Form`,
//     },
//     {
//       menu_label: "Call for Paper",
//       menu_link: `/${slug}/call-for-paper`,
//     },
//   ];

//   return (
//     <main>
//       <header>
//         <PageHeader
//           size="md:text-[25px] sm:text-base text-xs"
//           title={`${journal?.journal_name} (${journal?.short_name})`}
//           image={journal?.banner_image}
//         />
//         <Breadcrumbs
//           parents={[{ menu_label: "Journals", menu_link: "/journals" }]}
//           menuItems={menu}
//         />
//       </header>
//       {journal ? (
//         // <section className="mx-auto sm:max-w-xl md:max-w-3xl xl:max-w-6xl xxl:max-w-full px-4 sm:px-6 lg:px-8 py-10">
//         <section className="container mx-auto px-4 sm:px-6 lg:px-16 xxl:px-12 py-10">
//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//             <aside className="lg:col-span-3">
//               <SideMenu
//                 title={`${journal.short_name} Menu`}
//                 items={menu}
//                 initiallyOpen={true}
//                 storageKey="journals-sidemenu"
//               />
//             </aside>

//             <article className="lg:col-span-9 text-justify max-w-none leading-relaxed">
//               {children}
//             </article>
//           </div>
//         </section>
//       ) : (
//         <p className="p-10 text-center text-slate-600">Journal not found.</p>
//       )}
//     </main>
//   );
// }

import PageHeader from "@/components/Home/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SideMenu from "@/components/Home/SideMenu";
import { getJournalBySlug } from "@/utils/jounals";

export default async function JournalDetailLayout({ params, children }) {
  const param = await params;
  let slug = param.slug;
  const journal = await getJournalBySlug(slug);

  // Safety check
  if (!journal) {
    return (
      <main className="p-10 text-center text-gray-600">
        Journal not found.
      </main>
    );
  }

  // 🧩 Normalize short names
  const shortNameFull = journal.short_name?.toUpperCase() || "";
  const shortNameCompact = shortNameFull.replace(/^DS[-\s]?/i, ""); // “DS-DST” → “DST”

  // 🧭 Breadcrumb label uses full short name (DS-DST)
  const breadcrumbsParents = [
    { menu_label: "Journals", menu_link: "/journals" },
    { menu_label: shortNameFull, menu_link: `/${slug}` },
  ];

  // 🧩 Left-side menu
  const menu = [
    { menu_label: "Aim & Scope", menu_link: `/${slug}` },
    { menu_label: "Editorial Board", menu_link: `/${slug}/editorial-board` },
    { menu_label: "Paper Submission", menu_link: `/${slug}/paper-submission` },
    { menu_label: "Current Issue", menu_link: `/${slug}/current-issue` },
    { menu_label: "Archives", menu_link: `/${slug}/archives` },
    { menu_label: "Topics", menu_link: `/${slug}/topics` },
    {
      menu_label: "Publication Ethics",
      menu_link: "/for-authors/publication-ethics",
    },
    {
      menu_label: "Guidelines for Authors",
      menu_link: "/for-authors/author-guideline",
    },
    { menu_label: "Guidelines for Editors", menu_link: "/for-editors" },
    { menu_label: "Guidelines for Reviewers", menu_link: "/for-reviewers" },
    { menu_label: "APC", menu_link: `/${slug}/apc` },
    {
      menu_label: "Paper Template",
      menu_link: `/${journal?.paper_template || ""}`,
      name: `${shortNameFull} Paper Template`,
    },
    {
      menu_label: "Copyright Form",
      menu_link: `/${journal?.copyright_form || ""}`,
      name: `${shortNameFull} Copyright Form`,
    },
    { menu_label: "Call for Paper", menu_link: `/${slug}/call-for-paper` },
  ];

  return (
    <main>
      <header>
         <PageHeader
    size="md:text-[25px] sm:text-base text-xs"
    title={`${journal?.journal_name} (${shortNameFull})`}
    image={journal?.banner_image}
  />

  {/* ✅ Show only Home / Journals / DS-DST */}
<Breadcrumbs
  parents={[
    { menu_label: "Journals", menu_link: "/journals" },
    {
      // ✅ show "DS-DST" if prefix exists, else "DSM" etc
      menu_label: journal.short_name?.startsWith("DS-")
        ? journal.short_name
        : journal.short_name?.toUpperCase(),
      menu_link: `/${slug}`,
    },
  ]}
/>

      </header>

      <section className="container mx-auto px-4 sm:px-6 lg:px-16 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ✅ Sidebar with compact name */}
          <aside className="lg:col-span-3">
            <SideMenu
               title={`${journal.short_name?.replace(/^DS-/, "")?.toUpperCase()} Menu`}
              items={menu}
              initiallyOpen={true}
              storageKey={`journal-sidemenu-${slug}`}
            />
          </aside>

          {/* ✅ Content */}
          <article className="lg:col-span-9 text-justify leading-relaxed">
            {children}
          </article>
        </div>
      </section>
    </main>
  );
}
