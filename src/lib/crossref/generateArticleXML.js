import { escape } from "lodash";

const xml = (v) => escape(String(v ?? ""));

export function generateCrossrefArticleXML({
  article,
  authors,
  journal,
  articleUrl,
  pdfUrl,
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch
  xmlns="http://www.crossref.org/schema/5.3.1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.crossref.org/schema/5.3.1
  http://www.crossref.org/schema/deposit/crossref5.3.1.xsd"
  version="5.3.1">

  <head>
    <doi_batch_id>${article.article_id}</doi_batch_id>
    <timestamp>${Date.now()}</timestamp>
    <depositor>
      <name>${xml(journal.publisher)}</name>
      <email_address>admin@dsjournals.com</email_address>
    </depositor>
    <registrant>${xml(journal.publisher)}</registrant>
  </head>

  <body>
    <journal>
      <journal_metadata>
        <full_title>${xml(journal.journal_name)}</full_title>
        <issn media_type="electronic">${xml(journal.issn_online)}</issn>
      </journal_metadata>

      <journal_issue>
        <publication_date media_type="online">
          <year>${article.year}</year>
        </publication_date>
        <journal_volume>
          <volume>${article.volume_number}</volume>
        </journal_volume>
        <issue>${article.issue_number}</issue>
      </journal_issue>

      <journal_article publication_type="full_text">
        <titles>
          <title>${xml(article.article_title)}</title>
        </titles>

        <contributors>
          ${authors
            .map(
              (name, i) => `
          <person_name contributor_role="author" sequence="${
            i === 0 ? "first" : "additional"
          }">
            <given_name>${xml(name.split(" ").slice(0, -1).join(" "))}</given_name>
            <surname>${xml(name.split(" ").slice(-1))}</surname>
          </person_name>`
            )
            .join("")}
        </contributors>

        <publication_date media_type="online">
          <year>${article.year}</year>
        </publication_date>

        <pages>
          <first_page>${article.page_from}</first_page>
          <last_page>${article.page_to}</last_page>
        </pages>

        <doi_data>
          <doi>${article.doi}</doi>
          <resource>${articleUrl}</resource>
          ${
            pdfUrl
              ? `<collection property="text-mining">
                   <item>
                     <resource>${pdfUrl}</resource>
                   </item>
                 </collection>`
              : ""
          }
        </doi_data>

      </journal_article>
    </journal>
  </body>
</doi_batch>`;
}
