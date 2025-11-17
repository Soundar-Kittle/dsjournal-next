import PageHeader from "@/components/Home/PageHeader";
import SideMenu from "@/components/Home/SideMenu";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

const menu = [
  {
    menu_label: "Advantages",
    menu_link: "/for-editors#advantages",
  },
  {
    menu_label: "Duties and Responsibilities",
    menu_link: "/for-editors#duties-and-responsibilities",
  },
  {
    menu_label: "Consensus",
    menu_link: "/for-editors#consensus",
  },
];

export default function EditorLayout({ children }) {
  return (
    <main className="bg-white">
      <PageHeader items={menu} title="Editors" />
      <Breadcrumbs
        parents={[{ menu_label: "Editors", menu_link: "/for-editors" }]}
      />
     <section className="container mx-auto px-4 sm:px-6 lg:px-16 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
<aside className="lg:col-span-3 lg:min-w-[260px]">
            <SideMenu
              title="Menu"
              items={menu}
              initiallyOpen={true}
              storageKey="editors-sidemenu"
            />
          </aside>
          <article className="lg:col-span-9 text-justify max-w-none pt-2 leading-relaxed">
            {children}
          </article>
        </div>
      </section>
    </main>
  );
}
