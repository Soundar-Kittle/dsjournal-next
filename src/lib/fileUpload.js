import fs from "fs";
import path from "path";
import sharp from "sharp";
import crypto from "crypto";

export async function handleFileUploads(formData) {
  try {
    const folder = formData.get("folder") || "default";
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadedFiles = {};

    for (const key of new Set(formData.keys())) {
      if (key === "folder") continue;

      const files = formData.getAll(key);

      for (const file of files) {
        if (file && typeof file.arrayBuffer === "function") {
          const buffer = Buffer.from(await file.arrayBuffer());
          const mimeType = file.type;
          const isImage = /^image\/(jpeg|jpg|png|webp)$/i.test(mimeType);

          const randomName = crypto.randomBytes(2).toString("hex");
          const ext = isImage ? ".webp" : path.extname(file.name).toLowerCase();
          const fileName = `${Date.now()}_${randomName}${ext}`;
          const filePath = path.join(uploadDir, fileName);

          if (isImage) {
            await sharp(buffer).webp().toFile(filePath);
          } else {
            fs.writeFileSync(filePath, buffer);
          }

          if (!uploadedFiles[key]) {
            uploadedFiles[key] = [];
          }

          uploadedFiles[key].push(`/uploads/${folder}/${fileName}`);
        }
      }
    }

    return uploadedFiles;
  } catch (error) {
    console.error("❌ File Upload Error:", error);
    return { error: "File upload failed" };
  }
}
