import conflictOfInterest from "@/@data/authors/conflictsOfInterest";
import ContentAccordian from "@/components/ui/ContentAccordian";

const page = () => {
  return (
    <section className="space-y-3">
      <h2 className="text-4xl font-medium">
        Conflicts of Interest
      </h2>
      <p>
        Conflicts of interest (also known as "competing interests") arise when
        external factors obstruct or appear to obstruct the impartiality or
        objectivity of research. This can take place at any point in the
        research cycle, including when conducting experiments, writing a
        manuscript, or turning a manuscript into a published article.
      </p>
      <p>
        Conflicts of interest do not usually preclude publication of a work or
        participation in the review process. They must be disclosed, though.
        Others are better able to judge the work and the review process by
        having a clear disclosure of any potential conflicts, regardless of
        whether they had an impact or not.
      </p>
      <ContentAccordian data={conflictOfInterest} />
    </section>
  );
};

export default page;
