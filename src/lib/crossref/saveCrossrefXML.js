import fs from "fs/promises";
import path from "path";

export async function saveCrossrefXML({ articleId, xml }) {
  const dir = path.join(
    process.cwd(),
    "public/uploads/crossref/articles"
  );

  // ✅ Ensure directory exists
  await fs.mkdir(dir, { recursive: true });

  const filePath = path.join(dir, `${articleId}.xml`);

  await fs.writeFile(filePath, xml, "utf8");

  return `/uploads/crossref/articles/${articleId}.xml`;
}
