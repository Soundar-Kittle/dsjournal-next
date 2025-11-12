import path from "path";
import { generateRoutes } from "./generateRoutes";
import { getJournals } from "./journals";

export async function getStaticRoutes() {
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
