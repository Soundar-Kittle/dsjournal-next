import { generateDynamicMeta } from "@/lib/seo/generateDynamicMeta";

export async function generateMetadata() {
  return await generateDynamicMeta("abstract-and-indexing");
}

const page = () => {
  return (
    <section className="space-y-3">
      <h1 className="text-4xl font-medium">Abstracting and Indexing</h1>
      <p className="italic indent-5">
       The importance of discoverability: discovery layers, ‘abstracting and indexing,’ and open repositories.
      </p>
      <p className="intent-5">
       Dream Science’s publications appear in a wide range of abstracting and indexing databases. Different journals are listed in different databases. For a detailed breakdown of journals per repository, see our dedicated abstracting and indexing page of respective journal.
      </p>
      <p className="intent-5">
       Post-publication distribution of your research is one of the most important things we do at Dream Science. If your research is not discoverable, it cannot advance science, medicine, or society. A lack of discoverability has a negative impact on readership and future citations.
      </p>
      <p className="intent-5">
       There are many ways in which we disseminate your research out to potential readers:
      </p>
      <h6>Publishing on dsjournals</h6>
       <p className="intent-5">
       All articles published in our journals are made available on dsjournal.com. They can be read, downloaded, and shared by any visitor to the site.
      </p>
       <p className="intent-5">
       Visitors may discover articles by browsing the contents of a journal directly, from the results of a search engine, or from a shared link.
      </p>
      <h6>Search Engines</h6>
       <p className="intent-5">
      Dream Science’s article pages are optimized to perform well in search results. This makes your research available to readers from a wider range of backgrounds. Despite the existence of specialized research tools, readers still rely primarily on search engines like Google to discover relevant articles.
      </p>
      <p className="intent-5">
      As our journals are Open Access publications, any visitor arriving at dsjournal.com can immediately access and read your work.
      </p>
      <h6>Abstracting and Indexing Databases</h6>
      <p className="intent-5">
      Many researchers use abstract databases as curated discovery tools. These could be general multi-discipline databases such as Google scholar, Scopus or Web of Science, where coverage is broad but a selection process is employed based on journal quality (the main index of Web of Science contains only about 9,000 of the approximately 28,000 active scholarly peer-reviewed English-language journals). There are also subject-specific databases such as Embase (biomedical research), INSPEC (physics and engineering) or MEDLINE (medicine). These databases select journals based on quality and compatibility with their respective scopes.
      </p>
      <p className="intent-5">
        Dream Science trying to works with many abstracting and indexing databases to ensure that our journals are included in both the general indices and the relevant subject-specific databases.</p>
    </section>
  );
};

export default page;
