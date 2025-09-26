import faqs from "@/@data/faq";
import PageHeader from "@/components/Home/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ContentAccordian from "@/components/ui/ContentAccordian";

export default function page() {
  return (
    <main className="bg-white">
      <PageHeader title="FAQs" />
      <Breadcrumbs />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ContentAccordian data={faqs} />
      </div>
    </main>
  );
}
