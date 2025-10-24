import PageHeader from "@/components/Home/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Link from "next/link";

export default function page() {
  return (
    <main className="bg-white">
      <PageHeader title="Call for Paper" />
      <Breadcrumbs />

      <div className="max-w-6xl mx-auto space-y-3 px-4 sm:px-6 lg:px-8 py-10">
        {/* Title Section */}
        <div className=" mb-6 flex items-center justify-center">
          <img
            src="/images/call-for-paper.png"
            alt="Call for Paper"
            className="h-48"
          />
          <h1 className="text-3xl font-semibold text-primary mt-2">
            Call for Paper
          </h1>
        </div>

        {/* Intro Text */}
        <p className="text-justify leading-relaxed">
          <strong>Dream Science</strong>'s welcomes global Scholars, Engineers,
          Academics, industrial professionals, and Researchers from different
          domains in its realm of Open Access Publication. All submissions will
          be evaluated based on originality, technicality, and relevance to
          journal contributions. Dream Science highly welcomes theoretical,
          technical, research, and empirical papers from all areas of research
          in the area of technology innovation and emerging trends. The accepted
          papers will be published in the respective journal’s upcoming issue
          with the Online ISSN number.
        </p>

        {/* Important Dates */}
        <h2 className="text-xl font-semibold text-priamry mt-8 mb-2">
          Important Dates :
        </h2>
        <div className="space-y-1">
          <p>
            <strong>Last Date for Paper Submission:</strong>{" "}
            <span className="text-red-600 font-semibold">25 October 2025</span>
          </p>
          <p>
            <strong>Acceptance/Rejection Notification:</strong> As early as
            possible, based on the reviewer’s reply.
          </p>
        </div>

        {/* Submission Instructions */}
        <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
          Submission Guidelines :
        </h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Submit your paper in MS Word format (<code>.doc</code> or{" "}
            <code>.docx</code>); if you used latex software for manuscript
            preparation, send your paper in PDF format.
          </li>
          <li>Send papers through the respective journal mail id.</li>
          <li>
            <Link
              href="#"
              className="text-blue underline hover:text-light-blue font-medium"
            >
              Click here for Paper Submission Note
            </Link>
          </li>
        </ul>

        {/* Note Section */}
        <h2 className="text-xl font-semibold text-primary mt-8 mb-2">Note:</h2>
        <p className="text-justify leading-relaxed">
          Manuscripts must be submitted on the understanding that they have not
          been published elsewhere and are only being considered by this
          journal. The submitting author is responsible for ensuring that all
          the other authors have approved the article’s publication. It is also
          the submitting author’s responsibility to ensure that the article has
          all the necessary ethical clearances and institutional approvals. Only
          an acknowledgement from the editorial office officially establishes
          the date of receipt. Further correspondence and proofs will be sent to
          the author(s) before publication unless otherwise indicated. The
          editorial team shall have the right to edit the manuscript for
          readability. All submissions are bound by Dream Science terms of
          service.
        </p>
      </div>
    </main>
  );
}
