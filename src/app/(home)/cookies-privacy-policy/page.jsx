import React from "react";
import PageHeader from "@/components/Home/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CookiesPrivacyPolicy from "@/components/Home/CookiesPrivacyPolicy";
import { generateDynamicMeta } from "@/lib/seo/generateDynamicMeta";

export async function generateMetadata() {
  return await generateDynamicMeta("cookies-privacy-policy");
}
const page = () => {
  return (
    <section className="bg-white">
      <PageHeader title="Cookies & Privacy Policy" />
      <Breadcrumbs
        parents={[
          {
            menu_label: "Cookies & Privacy Policy",
            menu_link: "/cookies-privacy-policy",
          },
        ]}
      />
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-20 pb-16">
        <CookiesPrivacyPolicy />
      </div>
    </section>
  );
};

export default page;
