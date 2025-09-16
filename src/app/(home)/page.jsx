import HeroBanner from "@/components/Hero/HeroBanner";
import { generateDynamicMeta } from "@/lib/seo/generateDynamicMeta";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col shadow-md">
      <HeroBanner />
      {/* Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-semibold mb-6">Home Page</h2>
        <p className="leading-7 text-slate-600">
          Welcome to Dream Science. Explore journals, author guidelines, and
          reviewer resources.
        </p>
      </main>

      {/* Footer */}
      {/* <footer className="mt-auto bg-slate-900 text-slate-200 py-8 text-center">
        <p className="text-sm">© {new Date().getFullYear()} Dream Science. All rights reserved.</p>
      </footer> */}
    </div>
  );
}
export const generateMetadata = async () => {
  return await generateDynamicMeta("/");
};
