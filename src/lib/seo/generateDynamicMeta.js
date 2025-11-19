import { getSettings } from "@/utils/getSettings";
import { getMetaSlug } from "./getMetaSlug";

const normalizeSlug = (slug) => (Array.isArray(slug) ? slug.join("/") : slug);

export const generateDynamicMeta = async (slug) => {
  try {
    slug = normalizeSlug(slug);
    const seoRes = await getMetaSlug(slug);
    const settings = await getSettings();

    // 🔹 Fallbacks
    const fallbackTitle = "Dream Science | Engineering and Technology Journals";
    const fallbackDesc = `Explore ${fallbackTitle}`;
    const fallbackImage = "";

    if (!seoRes?.ok || !seoRes.meta) {
      console.log(seoRes?.message || "SEO data not found");
      return {
        title: fallbackTitle,
        description: fallbackDesc,
      };
    }

    const { meta } = seoRes;

    // 🔹 Base metadata
    const metadata = {
      title: undefined,
      description: undefined,
      keywords: undefined,
      openGraph: {
        title: undefined,
        description: undefined,
        type: undefined,
        images: [],
      },
      twitter: {
        title: undefined,
        description: undefined,
        card: undefined,
        image: undefined,
      },
    };

    // 🔹 Apply DB values
    if (meta?.metas?.length) {
      meta.metas.forEach((m) => {
        const key = m.attribute_key?.trim().toLowerCase();
        const value = m.is_content ? m.content : m.image;
        if (!value) return;

        if (m.attribute_scope === "general") {
          metadata[key] = value;
        }

        if (m.attribute_scope === "og") {
          if (key === "image") {
            metadata.openGraph.images = [{ url: value }];
          }
          if (key === "site_name") {
            metadata.openGraph.siteName = value;
          } else {
            metadata.openGraph[key] = value;
          }
        }

        if (m.attribute_scope === "twitter") {
          if (key === "image") {
            metadata.twitter.image = value;
          } else {
            metadata.twitter[key] = value;
          }
        }
      });
    }

    metadata.title ??= fallbackTitle;
    metadata.description ??= fallbackDesc;

    metadata.openGraph.title ??= metadata.title;
    metadata.openGraph.description ??= metadata.description;
    metadata.openGraph.type ??= "website";
    if (!metadata.openGraph.images?.length && fallbackImage) {
      metadata.openGraph.images = [{ url: fallbackImage }];
    }

    metadata.twitter.title ??= metadata.title;
    metadata.twitter.description ??= metadata.description;
    metadata.twitter.card ??= "summary_large_image";
    metadata.twitter.image ??= fallbackImage || undefined;

    metadata.metadataBase = new URL("http://dsjournals.com");
    return metadata;
  } catch (error) {
    console.error("❌ Error generating metadata:", error);

    // 🔹 Hard fallback when DB call fails
    return {
      title: "Dream Science | Engineering and Technology Journals",
      description:
        "DS Journals publishes high-quality academic research papers in various fields. Submit your manuscript for peer review and get published early!",
    };
  }
};
