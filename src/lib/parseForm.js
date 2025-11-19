import { Readable } from "stream";
import { formidable } from "formidable";
import path from "path";
import fs from "fs/promises";
import { createDbConnection } from "./db";

const first = (v) => (Array.isArray(v) ? v[0] : v);

export async function parseForm(req) {
  const form = formidable({ multiples: false, keepExtensions: true });

  const headers = Object.fromEntries(req.headers);
  const nodeRequest = Object.assign(Readable.fromWeb(req.body), {
    headers,
    method: req.method,
    url: "",
  });

  return new Promise((resolve, reject) => {
    form.parse(nodeRequest, async (err, rawFields, rawFiles) => {
      if (err) return reject(err);
      try {
        // normalize fields to scalars
        const fields = Object.fromEntries(
          Object.entries(rawFields).map(([k, v]) => [
            k,
            first(v)?.toString() ?? "",
          ])
        );

        const pdfIn = Array.isArray(rawFiles?.pdf)
          ? rawFiles.pdf[0]
          : rawFiles?.pdf || null;

        if (!pdfIn) {
          return resolve({ fields, files: {} });
        }

        // Need these to place the file correctly
        const article_id = (fields.article_id || "").trim();
        const volume_id = (fields.volume_id || "").trim();
        const issue_id = (fields.issue_id || "").trim();
        if (!article_id || !volume_id || !issue_id) {
          return reject(
            new Error(
              "Missing article_id/volume_id/issue_id for file placement"
            )
          );
        }

        // Fetch numbers for folder path
        const conn = await createDbConnection();
        const [[vol]] = await conn.query(
          `SELECT volume_number FROM volumes WHERE id = ?`,
          [volume_id]
        );
        const [[iss]] = await conn.query(
          `SELECT issue_number  FROM issues  WHERE id = ?`,
          [issue_id]
        );
        await conn.end();

        if (!vol || !iss)
          return reject(new Error("Invalid volume_id or issue_id"));

        const volume_number = vol.volume_number;
        const issue_number = iss.issue_number;

        const prefix = article_id.split("-")[0] || "article";
        const destDir = path.join(
          process.cwd(),
          "public",
          "uploads",
          prefix,
          `volume-${volume_number}`,
          `issue-${issue_number}`
        );
        await fs.mkdir(destDir, { recursive: true });

        // Canonical filename: use article_id (or use original if you prefer)
        const destName = `${article_id}.pdf`;
        const destPath = path.join(destDir, destName);

        // copy + unlink temp
        await fs.copyFile(pdfIn.filepath, destPath);
        await fs.unlink(pdfIn.filepath);

        // return relative web path (no leading slash)
        const relativePath = path.posix.join(
          "uploads",
          prefix,
          `volume-${volume_number}`,
          `issue-${issue_number}`,
          destName
        );
        resolve({ fields, files: { pdf: [{ ...pdfIn, relativePath }] } });
      } catch (e) {
        reject(e);
      }
    });
  });
}
