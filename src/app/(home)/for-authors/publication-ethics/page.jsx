import authors from "@/@data/authors/publicationEthics";
import ContentAccordian from "@/components/ui/ContentAccordian";
import { generateDynamicMeta } from "@/lib/seo/generateDynamicMeta";

export async function generateMetadata() {
  return await generateDynamicMeta("for-authors/publication-ethics");
}

const page = () => {
  return (
    <section className="space-y-3">
      <h2 className="text-4xl font-medium">Publication Ethics</h2>
      <p>
        In order to ensure high-quality scientific publications, public
        confidence in scientific findings, and that people have been given
        credit for their contributions, there are ethical standards for
        publication. Dream Science aspires to follow the COPE’s Code of Conduct
        and Best Practice Guidelines for Publication Ethics.
      </p>

      <ContentAccordian data={authors} />
    </section>
  );
};

export default page;
