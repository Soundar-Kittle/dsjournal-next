import React from 'react'
import SideMenu from '@/components/Home/SideMenu';
import Link from 'next/link';


const authorMenu = [
  { menu_label: "Publication Ethics",                menu_link: "/authors#publication-ethics" },
  { menu_label: "Step by Step Guidelines for Authors", menu_link: "/authors#author-guidelines" },
  { menu_label: "Submitting a Manuscript",          menu_link: "/authors#submitting" },
  { menu_label: "What is Open Access ?",            menu_link: "/authors#open-access" },
  { menu_label: "Review Process",                    menu_link: "/authors#review-process" },
  { menu_label: "Conflicts of Interest",             menu_link: "/authors#conflicts" },
  { menu_label: "Licensing Policy",                  menu_link: "/authors#licensing" },
  { menu_label: "Copyright Infringement",            menu_link: "/authors#copyright" },
  { menu_label: "Correction Policy",                 menu_link: "/authors#corrections" },
  { menu_label: "What is APC ?",                     menu_link: "/authors#apc" },
];



const page = () => {
    const ethicsSections = [
  {
    t: "Article Evaluation",
    c: `Peer review is required for all manuscripts, and they must adhere to high academic standards.
        Submissions will be evaluated by peer reviewers whose identities will not be disclosed to the authors.
        If the editor deems necessary, submissions having significant ethical, security, biosecurity, or
        societal implications (for example, dual research integrity issues or content on weapon systems)
        will be submitted for additional review. Review tasks include selecting reviewers with particular
        expertise, having additional editors evaluate the contribution, and declining to take the submission further.`,
  },
  {
    t: "Plagiarism",
    c: `All of the publications that Dream Science publishes are dedicated to solely publishing original content,
        which cannot have been published or isn’t currently being reviewed anywhere else. The software is used by
        Dream Science to identify instances of duplication and overlapping text in submitted publications.
        Sanctions for plagiarism will be applied to any manuscripts that are discovered to have been lifted
        verbatim from another author’s work, whether it was published or not.`,
  },
  {
    t: "Repetition of Submission",
    c: `Sanctions for duplicate submissions and publications will be applied to manuscripts that are discovered
        to have been published or are currently being reviewed elsewhere. Authors who have used their own previously
        published work that is presently being revised as the foundation for a submitted manuscript must cite
        the earlier work and explain how their new work goes above and beyond what was previously done.`,
  },
  {
    t: "Manipulation of Citations",
    c: `Citation manipulation sanctions will be applied to submitted manuscripts that are discovered to contain
        citations that are primarily intended to boost the number of citations to a certain author’s work
        or to publications published in a specific journal.`,
  },
  {
    t: "Falsification and Fabrication of Data",
    c: `Sanctions for data fabrication and falsification will be applied to submitted articles that contain
        either manufactured or falsified experimental results, including the modification of pictures.`,
  },
  {
    t: "Incorrect Author Attribution or Contribution",
    c: `All mentioned authors must have contributed significantly to the research in the manuscript and
        given their consent to all of its assertions. It’s crucial to acknowledge everyone who contributed
        significantly to science, including students, researchers, project assistants, and lab technicians.`,
  },
  {
    t: "Duplicate Publications",
    c: `In redundant publications, research findings are improperly split up into many articles.`,
  },
  {
    t: "Competing Interests",
    c: `Conflicts of interest (COIs) arise when circumstances unrelated to the research could logically
        be interpreted as influencing the objectivity or integrity of a manuscript’s evaluation.
        Authors, editors, and reviewers must disclose conflicts transparently.`,
  },
  {
    t: "Conflicts Compromise",
    c: `Financial money, payments, goods, and services received or anticipated by the writers in connection
        with the work; being hired by, serving on the advisory board for, or belonging to an entity with
        a stake in the project’s result; intellectual property like patents and trademarks; personal
        relationships; or ideology — all must be declared.`,
  },
  {
    t: "Authors",
    c: `All potential interests must be disclosed by authors. Any involvement in the conception,
        planning, design, conduct, or analysis of the work; the preparation or editing of the manuscript;
        or the decision to publish or where must be disclosed.`,
  },
  {
    t: "Reviewers and Editors",
    c: `Editors and reviewers ought to decline to work on a submission if it poses a conflict of interest.
        They must disclose prior relationships with authors and ensure impartiality in the review process.`,
  },
  {
    t: "Sanctions",
    c: `Regardless of whether the infractions took place in a journal published by Dream Science,
        sanctions will be implemented if any of the aforementioned policies are violated.
        These include rejection, immediate rejection of other manuscripts, prohibition against
        authors in editorial boards, and more.`,
  },
  {
    t: "Research Recording",
    c: `It is crucial that authors document the findings of their research in a way that allows
        for analysis and evaluation both prior to publication and for a reasonable amount of time following publication.`,
  },
  {
    t: "Publication Techniques",
    c: `For each publication, the author must submit their research papers in the exact format required by the journal.
        Proper citations and references must be provided.`,
  },
  {
    t: "Authorship Techniques",
    c: `Authorship credit should be given based on significant contributions to the idea, design,
        collection, analysis, and interpretation of data. Ghost authorship and honorary authorship are prohibited.`,
  },
  {
    t: "Responsibilities of Editorial",
    c: `The decision to approve or reject a work submitted to a journal rests entirely with the editor,
        who is unaffected by management or owners in any way. Editors must avoid bias, ensure integrity,
        and disclose potential conflicts.`,
  },
];
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
  Publication Ethics
</h1>
          <p>
            In order to ensure high-quality scientific publications, public confidence in scientific findings,
            and that people have been given credit for their contributions, there are ethical standards for publication.
            Dream Science aspires to follow the COPE’s Code of Conduct and Best Practice Guidelines for Publication Ethics.
          </p>

          {/* Accordion */}
          <div className="not-prose divide-y rounded-md border mt-6">
            {ethicsSections.map((x) => (
              <details key={x.t} className="group p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  <span>{x.t}</span>
                  <span className="transition-transform group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-2 text-sm text-slate-600">{x.c}</p>
              </details>
            ))}
          </div>
        </article>

        </div>
      </section>
    </main>
  )
}

export default page