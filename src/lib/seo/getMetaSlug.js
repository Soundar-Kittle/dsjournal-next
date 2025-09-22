import { createDbConnection } from "@/lib/db";

export async function getMetaSlug(slug) {
  if (!slug) {
    return { ok: false, message: "Slug is required" };
  }

  const connection = await createDbConnection();
  try {
    // 🟢 Fetch Meta row
    const [metasRows] = await connection.query(
      `SELECT m.id, m.reference_type, m.reference_id, m.meta_attribute_ids,
              DATE_FORMAT(m.created_at, '%Y-%m-%d') as created_at,
              DATE_FORMAT(m.updated_at, '%Y-%m-%d') as updated_at
       FROM metas m
       WHERE m.reference_id = ? 
       LIMIT 1`,
      [slug]
    );

    let meta = null;
    if (metasRows.length) {
      const row = metasRows[0];

      // Parse attribute IDs safely
      let attributeIds = [];
      try {
        attributeIds = JSON.parse(row.meta_attribute_ids);
        if (!Array.isArray(attributeIds)) attributeIds = [attributeIds];
      } catch {
        attributeIds = row.meta_attribute_ids ? [row.meta_attribute_ids] : [];
      }

      let attributes = [];
      if (attributeIds.length > 0) {
        const placeholders = attributeIds.map(() => "?").join(",");
        const [attrs] = await connection.query(
          `SELECT id, attribute_scope, attribute_type, attribute_key, content
           FROM meta_attributes
           WHERE id IN (${placeholders})`,
          attributeIds
        );

        attributes = attrs.map((attr) => {
          const isImage =
            !attr.content.includes("{") &&
            !attr.content.includes("<") &&
            (attr.content.toLowerCase().endsWith(".jpg") ||
              attr.content.toLowerCase().endsWith(".png") ||
              attr.content.toLowerCase().endsWith(".webp") ||
              attr.content.toLowerCase().endsWith(".jpeg"));

          return {
            id: attr.id,
            attribute_scope: attr.attribute_scope,
            attribute_type: attr.attribute_type,
            attribute_key: attr.attribute_key,
            content: attr.content,
            is_content: !isImage,
            image: isImage ? attr.content : null,
          };
        });
      }

      meta = {
        id: row.id,
        reference_type: row.reference_type,
        reference_id: row.reference_id,
        metas: attributes,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    }

    return { ok: true, slug, meta };
  } catch (error) {
    console.error("❌ SEO utility error:", error);
    return { ok: false, message: "Failed to fetch SEO data" };
  } finally {
    await connection.end();
  }
}
