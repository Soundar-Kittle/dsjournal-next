"use client";

import Link from "next/link";
import SideMenu from "@/components/Home/SideMenu";

const authorMenu = [
  { menu_label: "Publication Ethics",                menu_link: "/for-authors/publication-ethics" },
  { menu_label: "Step by Step Guidelines for Authors", menu_link: "/for-authors#author-guidelines" },
  { menu_label: "Submitting a Manuscript",          menu_link: "/for-authors#submitting" },
  { menu_label: "What is Open Access ?",            menu_link: "/for-authors#open-access" },
  { menu_label: "Review Process",                    menu_link: "/for-authors#review-process" },
  { menu_label: "Conflicts of Interest",             menu_link: "/for-authors#conflicts" },
  { menu_label: "Licensing Policy",                  menu_link: "/for-authors#licensing" },
  { menu_label: "Copyright Infringement",            menu_link: "/for-authors#copyright" },
  { menu_label: "Correction Policy",                 menu_link: "/for-authors#corrections" },
  { menu_label: "What is APC ?",                     menu_link: "/for-authors#apc" },
];

export default function AuthorsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="w-full bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <nav className="text-sm text-slate-300 mb-2">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <span>Authors</span>
          </nav>
          <h1 className="text-4xl font-bold">Authors</h1>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Side Menu */}
          <aside className="md:col-span-4 lg:col-span-3">
            <SideMenu
              title="Menu"
              items={authorMenu}
              initiallyOpen={true}
              storageKey="authors-sidemenu"
            />
          </aside>

          {/* Right: Content */}
<article className="md:col-span-8 lg:col-span-9 prose prose-slate max-w-none">

<h1 className="font-roboto text-2xl font-semibold text-gray-800">
  Authors
</h1>




    <section id="publication-ethics" className="scroll-mt-28">

      
<h2 className="font-roboto text-[20px] font-semibold text-gray-800">Publication Ethics</h2>
   <p className="text-sm text-gray-600 leading-relaxed">
      In order to ensure high-quality scientific publications, public confidence 
      in scientific findings, and that people have been given credit for their 
      contributions, there are ethical standards for publication. 
      <strong> Dream Science aspires to follow the COPE’s Code of Conduct and 
      Best Practice Guidelines for Publication Ethics.</strong>
    </p>

    <div className="not-prose divide-y rounded-md border">
      {[
        { t: "Article Evaluation", c: "Peer review is required for all manuscripts, and they must meet high academic standards. Submissions are evaluated for novelty, clarity, and ethical compliance. Conflicts of interest must be declared." },
        { t: "Plagiarism", c: "All content must be original. Plagiarized or overlapping text is not allowed. Tools are used to detect similarity and violations may lead to rejection or retraction." },
        { t: "Repetition of Submission", c: "Simultaneous submission to multiple journals is prohibited. Authors must withdraw manuscripts before resubmitting elsewhere." },
        { t: "Manipulation of Citations", c: "Unethical citation padding or coercion is prohibited. References must be accurate, genuine, and relevant." },
        { t: "Falsification and Fabrication of Data", c: "Submitting fabricated or falsified data, images, or results constitutes misconduct." },
        { t: "Incorrect Author Attribution or Contribution", c: "All contributors must be properly acknowledged. Ghost or honorary authorship is unethical." },
        { t: "Duplicate Publications", c: "Splitting one study into multiple redundant publications (‘salami slicing’) is unacceptable." },
        { t: "Competing Interests", c: "Authors must disclose financial, institutional, or personal relationships that may influence the work." },
        { t: "Conflicts Compromise", c: "Financial, advisory, personal, or ideological conflicts must be declared to maintain transparency." },
        { t: "Authors", c: "All potential interests must be disclosed by authors, including funding, consultancies, employment, stock ownership, honoraria, or patents." },
        { t: "Reviewers and Editors", c: "Reviewers must decline review if they have conflicts of interest. They must evaluate fairly, maintain confidentiality, and disclose relationships with authors." },
        { t: "Sanctions", c: "Violations of publication ethics may result in rejection, retraction, prohibition from future submissions, or other disciplinary measures." },
        { t: "Research Recording", c: "Authors must retain accurate research records supporting their publications. Data should be available for verification." },
        { t: "Publication Techniques", c: "Research results must be reported transparently. Comparative analysis and correct referencing are required." },
        { t: "Authorship Techniques", c: "Authorship must be based on substantial contributions to conception, design, data acquisition, or interpretation. All authors must approve the final version." },
        { t: "Responsibilities of Editorial", c: "Editors must ensure unbiased evaluation, maintain confidentiality, disclose conflicts of interest, and act independently of external influence." },
      ].map((x) => (
        <details key={x.t} className="group p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
            <span>{x.t}</span>
            <span className="transition-transform group-open:rotate-45">＋</span>
          </summary>
          <p className="mt-2 text-sm text-slate-600">{x.c}</p>
        </details>
      ))}
    </div>
  </section>
</article>




        </div>
      </section>
    </main>
  );
}
