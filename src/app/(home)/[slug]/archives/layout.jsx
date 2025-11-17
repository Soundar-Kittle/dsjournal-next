import { generateDynamicMeta } from "@/lib/seo/generateDynamicMeta";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return await generateDynamicMeta(`${slug}/archives`);
}

const Layout = ({ children }) => {
  return <div>{children}</div>;
};

export default Layout;
