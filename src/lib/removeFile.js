import fs from "fs";
import path from "path";

export const removeFile = function (fileUrl) {
  try {
    if (!fileUrl || typeof fileUrl !== "string") return;
    const fullPath = path.join(process.cwd(), "public", fileUrl);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log("🗑️ Deleted file:", fullPath);
    }
  } catch (err) {
    console.warn("⚠️ Failed to delete file:", fileUrl, err);
  }
};

export const resolveUploadedFiles = (
  uploadedFiles,
  cleanedData,
  existing,
  fileKeys = []
) => {
  const finalPaths = {};

  for (const key of fileKeys) {
    const uploaded = uploadedFiles[key];
    const raw = cleanedData[key];
    const current = existing?.[key];

    if (uploaded) {
      if (current && uploaded !== current) removeFile(current);
      finalPaths[key] = uploaded;
      continue;
    }
    const removed =
      raw === "" ||
      raw === "null" ||
      raw === null ||
      typeof raw === "undefined";

    if (removed) {
      if (current) removeFile(current);
      finalPaths[key] = null;
      continue;
    }

    finalPaths[key] = current;
  }

  return finalPaths;
};
