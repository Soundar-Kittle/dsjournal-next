import PageHeader from "@/components/Home/PageHeader";
import SideMenu from "@/components/Home/SideMenu";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

const menu = [
  {
    menu_label: "Publishing On Journals",
    menu_link: "/abstract-and-indexing#publishing-on-journals",
  },
  {
    menu_label: "Search Engines",
    menu_link: "/abstract-and-indexing#search-engines",
  },
  {
    menu_label: "A & I Databases",
    menu_link: "/abstract-and-indexing#a-i-databases",
  },
];

export default function Layout({ children }) {
  return (
    <main className="bg-white">
      <PageHeader items={menu} title="Indexing" />
      <Breadcrumbs
        parents={[
          {
            menu_label: "Abstracting and Indexing",
            menu_link: "/abstract-and-indexing",
          },
        ]}
      />

      <section className="mx-auto max-w-6xl  px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="md:col-span-4 lg:col-span-3">
            <SideMenu
              title="Menu"
              items={menu}
              initiallyOpen={true}
              storageKey="editors-sidemenu"
            />
          </aside>
          <article className="md:col-span-8 lg:col-span-9 text-justify max-w-none pt-2 leading-relaxed">
            {children}
          </article>
        </div>
      </section>
    </main>
  );
}
