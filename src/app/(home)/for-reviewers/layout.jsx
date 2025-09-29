import PageHeader from "@/components/Home/PageHeader";
import SideMenu from "@/components/Home/SideMenu";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

const menu = [
  {
    menu_label: "Step by Step Guidelines to Reviewers",
    menu_link: "/for-reviewers#guide-to-reviewers",
  },
  {
    menu_label: "How to Review Revised Manuscripts",
    menu_link: "/for-reviewers#revised-manuscripts",
  },
  {
    menu_label: "For Reviewing a Clinical Manuscript",
    menu_link: "/for-reviewers#clinical-manuscript",
  },
  {
    menu_label: "For Reviewing a Registerd Report",
    menu_link: "/for-reviewers#registerd-report",
  },
];

export default function ReviewerLayout({ children }) {
  return (
    <main className="bg-white">
      <header>
        <PageHeader items={menu} title="Reviewers" />
        <Breadcrumbs menuItems={menu} />
      </header>
      <section className="mx-auto max-w-6xl  px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <nav className="lg:col-span-3">
            <SideMenu
              title="Menu"
              items={menu}
              initiallyOpen={true}
              storageKey="reviewers-sidemenu"
            />
          </nav>
          <article className="lg:col-span-9 text-justify max-w-none pt-2 leading-relaxed">
            {children}
          </article>
        </div>
      </section>
    </main>
  );
}
