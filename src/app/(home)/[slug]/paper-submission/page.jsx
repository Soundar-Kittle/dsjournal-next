import Image from "next/image";

export default async function Page() {
  return (
    <div>
      <h2 className="text-2xl font-medium">Papper Submission</h2>

      <div className="my-4 p-4 md:p-6 bg-white rounded shadow-md flex flex-col md:flex-row items-center md:items-start gap-4 border border-[#ddd]">
        <div className="w-full md:w-1/3 flex justify-center">
          <Image
            src="/images/submission-support-img.png"
            alt="Paper Submission"
            width={200}
            height={150}
            className="object-contain w-full h-full"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="w-full md:w-2/3 text-center space-y-2">
          <p className="text-base md:text-lg font-medium">
            Please send your paper as attached file to mail id:
          </p>
          <a
            href="mailto:robotics@dsjournals.com"
            className="text-blue font-semibold hover:underline inline-block"
          >
            robotics@dsjournals.com
          </a>
          <p className="text-sm text-gray-600">
            Note: Kindly add our email address{" "}
            <a
              href="mailto:robotics@dsjournals.com"
              className="text-blue hover:underline"
            >
              robotics@dsjournals.com
            </a>{" "}
            to your Address Book or Contacts to continue receiving our emails in
            your inbox!
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h6>Preparation Guidelines for Paper Submission:</h6>

        <p className="indent-10">
          Submissions by anyone other than one of the authors will not be
          accepted. The submitting author takes responsibility for the paper
          during submission and peer review.
        </p>

        <ul className="list-disc ml-8">
          <li>
            Manuscripts submitted to this journal will be deemed as they have
            not been published and are not under consideration for publication
            elsewhere.
          </li>
          <li>
            Submit your paper in the form of Microsoft word format ( .doc or
            .docx ) , if you were used latex software for article preparation
            then send your paper in PDF format.
          </li>
          <li>
            Submitting the paper in multiple journals are offence, don't waste
            our valuable time.
          </li>
          <li>
            Once the paper is accepted, it can't be withdrawn at any cost.
          </li>
          <li>Please follow publication ethics and regulation.</li>
          <li>Avoid plagiarism and copied material.</li>
          <li>Strictly follow DS Journals Paper Template.</li>
        </ul>

        <h6>Terms of Submission:</h6>
        <p className="indent-10">
          Papers must be submitted on the understanding that they have not been
          published elsewhere and are not currently under consideration by
          another journal published by DS Journals or any other publisher. The
          submitting author is responsible for ensuring that the article's
          publication has been approved by all the other coauthors. It is also
          the authors' responsibility to ensure that the articles emanating from
          a particular institution are submitted with the approval of the
          necessary institution.
        </p>
        <h6>Peer Review:</h6>
        <p className="indent-10">
          All manuscripts are subject to peer review and are expected to meet
          standards of academic excellence. If approved by the editor,
          submissions will be considered by peer-reviewers, whose identities
          will remain anonymous to the authors.
        </p>
        <h6>Units of Measurement:</h6>
        <p className="indent-10">
          Units of measurement should be presented simply and concisely using
          System International (SI) units.
        </p>
        <h6>Title and Authorship Information:</h6>
        <p>The following information should be included:</p>
        <ul className="list-disc ml-8">
          <li>Paper title</li>
          <li>Full author names</li>
          <li>Full institutional mailing addresses</li>
          <li>Email addresses</li>
          <li>Abstract</li>
        </ul>
        <p className="indent-10">
          The manuscript should contain an abstract. The abstract should be
          self-contained and citation-free and should not exceed 200 words.
        </p>
        <h6>Introduction:</h6>
        <p className="indent-10">
          This section should be succinct, with no subheadings.
        </p>
        <h6>Materials and Methods:</h6>
        <p className="indent-10">
          This part should contain sufficient detail so that all procedures can
          be repeated. It can be divided into subsections if several methods are
          described.
        </p>
        <h6>Preparation of Tables:</h6>
        <p className="indent-10">
          Tables should be cited consecutively in the text. Every table must
          have a descriptive title and if numerical measurements are given, the
          units should be included in the column heading.
        </p>
        <h6>Results and Discussion:</h6>
        <p className="indent-10">
          This section may each be divided by subheadings or may be combined.
        </p>
        <h6>Conclusions:</h6>
        <p className="indent-10">
          This should clearly explain the main conclusions of the work
          highlighting its importance and relevance.
        </p>
        <h6>Acknowledgments:</h6>
        <p className="indent-10">
          All acknowledgments (if any) should be included at the very end of the
          paper before the references and may include supporting grants,
          presentations, and so forth.
        </p>
        <h6>References:</h6>
        <p className="indent-10">
          Authors are responsible for ensuring that the information in each
          reference is complete and accurate. All references should be cited
          within the text; otherwise, these references will be automatically
          removed.
        </p>
      </div>
    </div>
  );
}
