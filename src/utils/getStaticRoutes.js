import path from "path";
import { generateRoutes } from "./generateRoutes";
import { getJournals } from "./journals";
import { unstable_cache } from "next/cache";

export async function _getStaticRoutes() {
  const APP_DIR = path.join(process.cwd(), "src", "app", "(home)");

  return generateRoutes({
    appDir: APP_DIR,
    includeFolders: [
      {
        folderName: "[slug]",
        fetcher: getJournals,
        slugMapper: (j) => j?.slug || "",
      },
    ],
  });
}

export const getStaticRoutes = unstable_cache(
  async () => _getStaticRoutes(),
  [`static_routes-list`],
  {
    tags: ["static_routes"],
  }
);
