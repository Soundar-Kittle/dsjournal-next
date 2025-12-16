export function generateArticleSchema({
  article,
  authors,
  articleUrl,
  pdfUrl,
  journal,
}) {
  const DEFAULT_PUBLISHER =
    process.env.NEXT_PUBLIC_PUBLISHER_NAME ||
    "Dream Science Journals"; // final safety fallback

  const publisherName =
    journal?.publisher?.trim() || DEFAULT_PUBLISHER;

  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",

    headline: article.article_title,

    author: authors.map((name) => ({
      "@type": "Person",
      name,
    })),

    datePublished: article.published || undefined,
    dateAccepted: article.accepted || undefined,
    dateReceived: article.received || undefined,

    identifier: article.doi
      ? {
          "@type": "PropertyValue",
          propertyID: "DOI",
          value: article.doi,
        }
      : undefined,

    isPartOf: {
      "@type": "PublicationIssue",
      issueNumber: article.issue_number,
      isPartOf: {
        "@type": "PublicationVolume",
        volumeNumber: article.volume_number,
        isPartOf: {
          "@type": "Periodical",
          name: journal.journal_name,
          issn: journal.issn_online || journal.issn_print,
          publisher: {
            "@type": "Organization",
            name: publisherName, // ✅ ENV-BASED
          },
        },
      },
    },

    publisher: {
      "@type": "Organization",
      name: publisherName, // ✅ ENV-BASED
    },

    url: articleUrl,

    sameAs: article.doi
      ? `https://doi.org/${article.doi}`
      : articleUrl,

    encoding: pdfUrl
      ? {
          "@type": "MediaObject",
          contentUrl: pdfUrl,
          encodingFormat: "application/pdf",
        }
      : undefined,

    inLanguage: article.language || "en",
  };
}
