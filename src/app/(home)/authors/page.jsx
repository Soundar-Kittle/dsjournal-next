"use client";

import Link from "next/link";
import SideMenu from "@/components/Home/SideMenu";

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
            {/* Publication Ethics */}
            <section id="publication-ethics" className="scroll-mt-28">
              <h2>Publication Ethics</h2>
              <p>
                We adhere to COPE’s Code of Conduct and Best Practice
                Guidelines to ensure integrity, transparency, and proper credit
                throughout the publication process.
              </p>

              {/* simple accordion-style details */}
              <div className="not-prose divide-y rounded-md border">
                {[
                  { t: "Article Evaluation", c: "Submissions are evaluated for novelty, rigor, clarity, and contribution to the field. Plagiarism and overlap checks are conducted." },
                  { t: "Plagiarism", c: "We use industry-standard tools. Significant overlap may result in rejection or a request for clarification." },
                  { t: "Repetition of Submission", c: "Simultaneous submission to multiple journals is not permitted. Withdraw before submitting elsewhere." },
                  { t: "Manipulation of Citations", c: "Citation padding or coercive citation is not acceptable. References must be relevant and accurate." },
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

            {/* Author Guidelines */}
            <section id="author-guidelines" className="scroll-mt-28 mt-12">
              <h2>Step by Step Guidelines for Authors</h2>
              <ol>
                <li>Prepare your manuscript per the journal’s formatting rules.</li>
                <li>Create an account and complete author information.</li>
                <li>Upload files (main text, figures, tables, supplements).</li>
                <li>Select keywords and subject areas; suggest reviewers as required.</li>
                <li>Preview and submit the final version for editorial screening.</li>
              </ol>
            </section>

            {/* Submitting a Manuscript */}
            <section id="submitting" className="scroll-mt-28 mt-12">
              <h2>Submitting a Manuscript</h2>
              <p>
                Use the online submission portal. Ensure all authors approve the
                final version and agree to the submission.
              </p>
            </section>

            {/* Open Access */}
            <section id="open-access" className="scroll-mt-28 mt-12">
              <h2>What is Open Access?</h2>
              <p>
                Open Access provides free availability of articles, enabling
                reading and reuse with proper attribution under clear licenses.
              </p>
            </section>

            {/* Review Process */}
            <section id="review-process" className="scroll-mt-28 mt-12">
              <h2>Review Process</h2>
              <p>
                After editorial checks, manuscripts undergo peer review
                (single-blind, double-blind, or open) according to journal
                policy. Decisions consider reviewer feedback and editorial scope.
              </p>
            </section>

            {/* Conflicts of Interest */}
            <section id="conflicts" className="scroll-mt-28 mt-12">
              <h2>Conflicts of Interest</h2>
              <p>
                Disclose any financial or personal relationships that could
                influence interpretation of the work.
              </p>
            </section>

            {/* Licensing Policy */}
            <section id="licensing" className="scroll-mt-28 mt-12">
              <h2>Licensing Policy</h2>
              <p>
                Articles are published under recognized licenses (e.g., Creative
                Commons). Authors may retain copyright where applicable.
              </p>
            </section>

            {/* Copyright Infringement */}
            <section id="copyright" className="scroll-mt-28 mt-12">
              <h2>Copyright Infringement</h2>
              <p>
                Report suspected infringement with supporting details to the
                editorial office for investigation.
              </p>
            </section>

            {/* Correction Policy */}
            <section id="corrections" className="scroll-mt-28 mt-12">
              <h2>Correction Policy</h2>
              <p>
                Post-publication updates (corrections, expressions of concern,
                retractions) follow COPE best practices and journal policy.
              </p>
            </section>

            {/* APC */}
            <section id="apc" className="scroll-mt-28 mt-12">
              <h2>What is APC?</h2>
              <p>
                Article Processing Charges support editorial handling,
                production, and hosting for Open Access articles.
              </p>
            </section>
          </article>
        </div>
      </section>
    </main>
  );
}
