import fs from "fs";
import path from "path";

function getAllRoutes(dirPath, basePath = "") {
  if (!fs.existsSync(dirPath)) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const routes = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const routePath = path.posix.join(basePath, entry.name); // POSIX-safe for URLs

    if (entry.isDirectory()) {
      routes.push(...getAllRoutes(fullPath, routePath));
    } else if (/^page\.(jsx?|tsx?)$/.test(entry.name)) {
      // ✅ remove trailing /page.js(x|ts|tsx)
      const cleaned =
        "/" + basePath.replace(/\\/g, "/").replace(/\/page$/i, "");
      routes.push(cleaned);
    }
  }

  return routes;
}

/** Utility helpers */
const toTitleCase = (str) =>
  str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const isJournalSlug = (slug) => /^[a-z]{2,3}$/.test(slug);

export async function generateRoutes({
  appDir = path.join(process.cwd(), "src", "app", "(home)"),
  includeFolders = [],
} = {}) {
  // 1️⃣ Collect base routes
  const baseRoutes = getAllRoutes(appDir)
    .filter((url) => url && !url.includes("["))
    .map((url) => url.replace(/^\/\((.*?)\)/, "")) // strip out (home)
    .filter((url) => !/^\/_/.test(url)); // ignore internal folders

  const allRoutes = new Set(baseRoutes);

  // 2️⃣ Add slug-based routes (journals, etc.)
  for (const { folderName, fetcher, slugMapper } of includeFolders) {
    if (!folderName || typeof fetcher !== "function") continue;

    const slugDir = path.join(appDir, folderName);
    if (!fs.existsSync(slugDir)) continue;

    const slugRoutes = getAllRoutes(slugDir)
      .map((url) => url.replace(new RegExp(`^/${folderName}`), ""))
      .filter((url) => !url.includes("[") && url.trim().length);

    let entities = [];
    try {
      entities = await fetcher();
    } catch (err) {
      console.error(`❌ Failed to fetch ${folderName}:`, err.message);
      continue;
    }

    for (const entity of entities || []) {
      const slug = slugMapper?.(entity);
      if (!slug) continue;
      for (const sub of slugRoutes) {
        allRoutes.add(`/${slug}${sub}`);
      }
    }
  }

  // 3️⃣ Clean and format
  const rows = Array.from(allRoutes)
    .map((url) => {
      const cleaned = url.replace(/^\/|\/$/g, "");
      if (!cleaned) return { url: "/", label: "Home" };

      const parts = cleaned.split("/");
      const first = parts[0];
      const journal = isJournalSlug(first);

      if (journal && parts.length === 1) {
        // ✅ Journal root
        return { url: first.toLowerCase(), label: first.toUpperCase() };
      }

      if (journal && parts.length > 1) {
        // ✅ Journal subpages
        return {
          url: cleaned,
          label: `${first.toUpperCase()} → ${toTitleCase(
            parts.slice(1).join("/")
          )}`,
        };
      }

      // ✅ Normal pages
      return {
        url: cleaned,
        label: toTitleCase(cleaned.replace(/\//g, " → ")),
      };
    })
    // remove duplicates
    .filter((r, i, arr) => i === arr.findIndex((x) => x.url === r.url));

  return rows;
}
