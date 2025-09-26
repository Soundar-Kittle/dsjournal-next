import faqs from "@/@data/faq";
import PageHeader from "@/components/Home/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ContentAccordian from "@/components/ui/ContentAccordian";

export default function page() {
  return (
    <main className="bg-white">
      <PageHeader title="FAQs" />
      <Breadcrumbs
        base={{
          menu_label: "FAQs",
          menu_link: "/faq",
        }}
      />

      <div className="max-w-6xl mx-auto py-5 px-4">
        <ContentAccordian data={faqs} />
      </div>
    </main>
  );
}
