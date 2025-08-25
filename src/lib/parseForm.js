// import { Readable } from "stream"
// import { formidable } from "formidable"

// export async function parseForm(req) {
//   const form = formidable({
//     multiples: false,
//     uploadDir: "./public/uploads",
//     keepExtensions: true,
//   })

//   // Patch to emulate Node.js IncomingMessage
//   const headers = Object.fromEntries(req.headers)
//   const nodeRequest = Object.assign(Readable.fromWeb(req.body), {
//     headers,
//     method: req.method,
//     url: "", // Optional: may help compatibility
//   })

//   return new Promise((resolve, reject) => {
//     form.parse(nodeRequest, (err, fields, files) => {
//       if (err) reject(err)
//       else resolve({ fields, files })
//     })
//   })
// }


// import { Readable } from "stream";
// import { formidable } from "formidable";
// import path from "path";
// import fs from "fs/promises";
// import { createDbConnection } from "./db";


// export async function parseForm(req) {
//   const form = formidable({
//     multiples: false,
//     keepExtensions: true,
//   });

//   const headers = Object.fromEntries(req.headers);
//   const nodeRequest = Object.assign(Readable.fromWeb(req.body), {
//     headers,
//     method: req.method,
//     url: "",
//   });

//   return new Promise((resolve, reject) => {
//     form.parse(nodeRequest, async (err, fields, files) => {
//       if (err) return reject(err);

//       try {
//         const {
//           volume_id,
//           issue_id,
//         } = fields;

//     const article_id = (fields.article_id?.[0] || fields.article_id)?.trim();


//         const file = files.pdf?.[0] || files.pdf;
        
//   // console.log("📦 Received Fields:", fields);
//   console.log("📄 Received File:", file);
//   console.log("🔖 article_id:", article_id);
//   console.log("📘 volume_id:", volume_id);
//   console.log("📗 issue_id:", issue_id);
//         if (!file || !article_id || !volume_id || !issue_id) {
//           return reject(new Error("Missing required fields or file"));
//         }

//         const conn = await createDbConnection();

//         // Get volume/issue number from DB
//         const [[volumeRow]] = await conn.query(`SELECT volume_number FROM volumes WHERE id = ?`, [volume_id]);
//         const [[issueRow]] = await conn.query(`SELECT issue_number FROM issues WHERE id = ?`, [issue_id]);

//         if (!volumeRow || !issueRow) {
//           await conn.end();
//           return reject(new Error("Invalid volume or issue ID"));
//         }

//         const volume_number = volumeRow.volume_number;
//         const issue_number = issueRow.issue_number;

//         const prefix = article_id.split("-")[0];
//         const newDir = path.join("public", "uploads", prefix, `volume-${volume_number}`, `issue-${issue_number}`);

//         // Create folder if doesn't exist
//         await fs.mkdir(newDir, { recursive: true });

//         // Move file to new folder
//         const destPath = path.join(newDir, file.originalFilename);
//         // await fs.rename(file.filepath, destPath);

//         // ⛔ fs.rename() fails across different drives
// await fs.copyFile(file.filepath, destPath);
// await fs.unlink(file.filepath); // remove temp file

//         await conn.end();

//         resolve({
//           fields,
//           file: {
//             ...file,
//             newFilename: file.originalFilename,
//             filepath: destPath,
//             relativePath: destPath.replace("public/", ""),
//           },
//         });
//       } catch (error) {
//         reject(error);
//       }
//     });
//   });
// }

// import { Readable } from "stream";
// import { formidable } from "formidable";
// import path from "path";
// import fs from "fs/promises";
// import { createDbConnection } from "./db";

// function first(v) {
//   return Array.isArray(v) ? v[0] : v;
// }

// export async function parseForm(req) {
//   const form = formidable({
//     multiples: false,
//     keepExtensions: true,
//   });

//   const headers = Object.fromEntries(req.headers);
//   const nodeRequest = Object.assign(Readable.fromWeb(req.body), {
//     headers,
//     method: req.method,
//     url: "",
//   });

//   return new Promise((resolve, reject) => {
//     form.parse(nodeRequest, async (err, rawFields, rawFiles) => {
//       if (err) return reject(err);

//       try {
//         // ── normalize fields to scalars ───────────────────────────────
//         const fields = Object.fromEntries(
//           Object.entries(rawFields).map(([k, v]) => [k, first(v)?.toString() ?? ""])
//         );

//         // normalize file reference
//         const incomingPdf = Array.isArray(rawFiles?.pdf) ? rawFiles.pdf[0] : rawFiles?.pdf || null;

//         // If there's NO file (e.g., EDIT without new upload), just return fields.
//         if (!incomingPdf) {
//           return resolve({
//             fields,
//             files: {} // keep shape consistent with formidable
//           });
//         }

//         // ── we DO have a file: we need article_id, volume_id, issue_id to place it ──
//         const article_id = (fields.article_id || "").trim();
//         const volume_id  = (fields.volume_id  || "").trim();
//         const issue_id   = (fields.issue_id   || "").trim();

//         if (!article_id || !volume_id || !issue_id) {
//           // caller posted a file but not enough info to place it
//           return reject(new Error("Missing article_id / volume_id / issue_id for file placement"));
//         }

//         // get volume/issue numbers to build folder path
//         const conn = await createDbConnection();
//         const [[volumeRow]] = await conn.query(
//           `SELECT volume_number FROM volumes WHERE id = ?`,
//           [volume_id]
//         );
//         const [[issueRow]] = await conn.query(
//           `SELECT issue_number FROM issues WHERE id = ?`,
//           [issue_id]
//         );
//         await conn.end();

//         if (!volumeRow || !issueRow) {
//           return reject(new Error("Invalid volume_id or issue_id for file placement"));
//         }

//         const volume_number = volumeRow.volume_number;
//         const issue_number  = issueRow.issue_number;

//         // destination: public/uploads/<PREFIX>/volume-<n>/issue-<n>/
//         const prefix = article_id.split("-")[0] || "article";
//         const destDir = path.join("public", "uploads", prefix, `volume-${volume_number}`, `issue-${issue_number}`);
//         await fs.mkdir(destDir, { recursive: true });

//         // keep original name (or you can rename to `${article_id}.pdf`)
//         const destPath = path.join(destDir, incomingPdf.originalFilename);

//         // some environments can't rename across devices → copy + unlink temp
//         await fs.copyFile(incomingPdf.filepath, destPath);
//         await fs.unlink(incomingPdf.filepath);

//         // shape compatible with your route's expectation: files?.pdf?.[0]
//         const savedPdf = {
//           ...incomingPdf,
//           newFilename: incomingPdf.originalFilename,
//           filepath: destPath, // where it was placed
//           relativePath: destPath.replace(/^public[\\/]/, ""), // remove leading "public/"
//         };

//         return resolve({
//           fields,
//           files: { pdf: [savedPdf] },
//         });
//       } catch (e) {
//         return reject(e);
//       }
//     });
//   });
// }

// src/lib/parseForm.js
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
          Object.entries(rawFields).map(([k, v]) => [k, first(v)?.toString() ?? ""])
        );

        const pdfIn = Array.isArray(rawFiles?.pdf) ? rawFiles.pdf[0] : rawFiles?.pdf || null;

        // If no file (edit without new upload) -> just return fields
        if (!pdfIn) {
          return resolve({ fields, files: {} });
        }

        // Need these to place the file correctly
        const article_id = (fields.article_id || "").trim();
        const volume_id  = (fields.volume_id  || "").trim();
        const issue_id   = (fields.issue_id   || "").trim();
        if (!article_id || !volume_id || !issue_id) {
          return reject(new Error("Missing article_id/volume_id/issue_id for file placement"));
        }

        // Fetch numbers for folder path
        const conn = await createDbConnection();
        const [[vol]] = await conn.query(`SELECT volume_number FROM volumes WHERE id = ?`, [volume_id]);
        const [[iss]] = await conn.query(`SELECT issue_number  FROM issues  WHERE id = ?`, [issue_id]);
        await conn.end();

        if (!vol || !iss) return reject(new Error("Invalid volume_id or issue_id"));

        const volume_number = vol.volume_number;
        const issue_number  = iss.issue_number;

       const prefix = (article_id.split("-")[0] || "article");
const destDir = path.join(process.cwd(), "public", "upload", prefix, `volume-${volume_number}`, `issue-${issue_number}`);
await fs.mkdir(destDir, { recursive: true });

       // Canonical filename: use article_id (or use original if you prefer)
const destName = `${article_id}.pdf`;
const destPath = path.join(destDir, destName);

  // copy + unlink temp
await fs.copyFile(pdfIn.filepath, destPath);
await fs.unlink(pdfIn.filepath);

// return relative web path (no leading slash)
const relativePath = path.posix.join("upload", prefix, `volume-${volume_number}`, `issue-${issue_number}`, destName);
 resolve({ fields, files: { pdf: [{ ...pdfIn, relativePath }] } });
      } catch (e) {
        reject(e);
      }
    });
  });
}
