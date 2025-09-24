import authors from "@/@data/authors/publicationEthics";
import ContentAccordian from "@/components/ui/ContentAccordian";
import React from "react";

const page = () => {
  return (
    <article className="md:col-span-8 lg:col-span-9 prose prose-slate max-w-none">
      <h1 className="font-roboto text-4xl font-medium mb-3">
        Publication Ethics
      </h1>
      <p>
        In order to ensure high-quality scientific publications, public
        confidence in scientific findings, and that people have been given
        credit for their contributions, there are ethical standards for
        publication. Dream Science aspires to follow the COPE’s Code of Conduct
        and Best Practice Guidelines for Publication Ethics.
      </p>

      <ContentAccordian data={authors} />
    </article>
  );
};

export default page;
