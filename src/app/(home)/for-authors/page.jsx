import authors from "@/@data/authors/publicationEthics";
import ContentAccordian from "@/components/ui/ContentAccordian";

export default function AuthorsPage() {
  return (
    <section id="publication-ethics" className="space-y-3">
      <h1 className="font-roboto text-4xl font-medium mb-2">Authors</h1>
      <h2 className="font-roboto text-2xl font-medium">Publication Ethics</h2>
      <p>
        In order to ensure high-quality scientific publications, public
        confidence in scientific findings, and that people have been given
        credit for their contributions, there are ethical standards for
        publication. Dream Science aspires to follow the COPE's Code of Conduct
        and Best Practice Guidelines for Publication Ethics.
      </p>

      <ContentAccordian data={authors} />
    </section>
  );
}
