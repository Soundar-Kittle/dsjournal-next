import autherGuideline from "@/@data/authors/authorGuildline";
import ContentAccordian from "@/components/ui/ContentAccordian";

const page = () => {
  return (
    <section className="space-y-3">
      <h2 className="font-roboto text-4xl font-medium">
        Step by step guideline for authors
      </h2>
      <p>
        Original research publications, reviews, and brief communications are
        all published by Dream Science. Short communications need to tackle a
        topic of great interest and come to a firm conclusion.
      </p>

      <ContentAccordian data={autherGuideline} />
    </section>
  );
};

export default page;
