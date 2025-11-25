import { generateDynamicMeta } from "@/lib/seo/generateDynamicMeta";

export async function generateMetadata() {
  return await generateDynamicMeta("open-access");
}

const page = () => {
  return (
    <section className="space-y-3">
      <h1 className="text-4xl font-medium">Open Access</h1>
      <p className="italic indent-5">
        By 'open access' to this literature, we mean its free availability on
        the public internet, permitting any users to read, download, copy,
        distribute, print, search, or link to the full texts of these articles,
        crawl them for indexing, pass them as data to software, or use them for
        any other lawful purpose, without financial, legal, or technical
        barriers other than those inseparable from gaining access to the
        internet itself.
      </p>
      <p className="text-right italic">– The Budapest Open Access Initiative</p>
      <p className="intent-5">
        DREAM SCIENCE publishes all of our journals using a Gold Open Access
        model. All articles published in DREAM SCIENCE journals are available to
        readers completely free of charge. Access is made possible by a fee for
        publication that is paid at the time of article acceptance, usually by
        an author’s institution or funder. Articles become available immediately
        upon publication and a visitor to dsjournal.com can immediately access,
        download, print, and read any published article in its entirety.
        Author(s) retain copyright of their work, but readers are free to reuse
        the material (providing proper citations are given), as all DREAM
        SCIENCE articles are published under the Creative Commons Attribution
        License (CC-BY).
      </p>
      <p className="intent-5">
        Open Access ensures that articles are free at the point of consumption.
        Rather than charge for access, Open Access publishers apply an initial
        fee at the time an article is accepted for publication. This fee, known
        as an Article Processing Charge (APC), covers the costs of the
        production process. Often this charge will be covered by the authors’
        affiliated institution(s), or by the funding body responsible for
        commissioning the research. See ‘Article Processing Charges’ for more
        details.
      </p>
      <p className="intent-5">
        {" "}
        By using a liberal copyright license, Open Access removes barriers and
        allows researchers to make use of articles in new ways. This includes
        practices like meta-analysis and text mining, which help reveal trends
        in science that would not be obvious at the level of individual
        articles.
      </p>
    </section>
  );
};

export default page;
