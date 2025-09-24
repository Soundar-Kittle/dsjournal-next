import autherGuideline from "@/@data/authors/authorGuildline";
import ContentAccordian from "@/components/ui/ContentAccordian";

const page = () => {
  return (
    <article className="md:col-span-8 lg:col-span-9 prose prose-slate max-w-none pt-5">
      <section id="author-guideline">
        <h2 className="font-roboto text-4xl font-medium mb-3">
          Step by step guideline for authors
        </h2>
        <p className="text-md leading-relaxed">
          Original research publications, reviews, and brief communications are
          all published by Dream Science. Short communications need to tackle a
          topic of great interest and come to a firm conclusion.
        </p>

        <ContentAccordian data={autherGuideline} />
      </section>
    </article>
  );
};

export default page;
