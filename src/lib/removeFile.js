import fs from "fs";
import path from "path";

export const removeFile = function (fileUrl) {
  try {
    if (!fileUrl || typeof fileUrl !== "string") return;
    const fullPath = path.join(process.cwd(), fileUrl);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log("🗑️ Deleted file:", fullPath);
    }
  } catch (err) {
    console.warn("⚠️ Failed to delete file:", fileUrl, err);
  }
};
