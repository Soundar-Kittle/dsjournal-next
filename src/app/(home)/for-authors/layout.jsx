import PageHeader from "@/components/Home/PageHeader";
import SideMenu from "@/components/Home/SideMenu";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

const authorMenu = [
  {
    menu_label: "Publication Ethics",
    menu_link: "/for-authors/publication-ethics",
  },
  {
    menu_label: "Step by Step Guidelines for Authors",
    menu_link: "/for-authors/author-guideline",
  },
  {
    menu_label: "Submitting a Manuscript",
    menu_link: "/for-authors/submitting-a-manuscript",
  },
  {
    menu_label: "What is Open Access ?",
    menu_link: "/for-authors/open-access-author",
  },
  { menu_label: "Review Process", menu_link: "/for-authors/review-process" },
  { menu_label: "Conflicts of Interest", menu_link: "/for-authors/conflicts-of-interest" },
  { menu_label: "Licensing Policy", menu_link: "/for-authors/licensing-policy" },
  { menu_label: "Copyright Infringement", menu_link: "/for-authors/copyright-infringement" },
  { menu_label: "Correction Policy", menu_link: "/for-authors/correction-policy" },
  { menu_label: "What is APC ?", menu_link: "/for-authors/what-is-apc" },
];

export default function AuthorLayout({ children }) {
  return (
    <main className="bg-white">
      <PageHeader items={authorMenu} title="Authors" />
      <Breadcrumbs
        base={{
          menu_label: "Authors",
          menu_link: "/for-authors",
        }}
        menuItems={authorMenu}
      />
      <section className="mx-auto max-w-7xl  px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="md:col-span-4 lg:col-span-3">
            <SideMenu
              title="Menu"
              items={authorMenu}
              initiallyOpen={true}
              storageKey="authors-sidemenu"
            />
          </aside>
          {children}
        </div>
      </section>
    </main>
  );
}
