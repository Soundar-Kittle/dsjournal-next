import Image from "next/image";
import PageHeader from "@/components/Home/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { generateDynamicMeta } from "@/lib/seo/generateDynamicMeta";
import { getSettings } from "@/utils/getSettings";
import Link from "next/link";

export async function generateMetadata() {
  return await generateDynamicMeta("contact-us");
}

export default async function Page() {
  const settings = await getSettings();
  // const number = settings?.phone_number?.[0]?.number;
  // const is_whatsapp = settings?.phone_number?.[0]?.is_whatsapp;

  return (
    <main className="bg-white">
      <PageHeader title="Contact Us" />
      <Breadcrumbs
        parents={[{ menu_label: "Contact Us", menu_link: "/contact-us" }]}
      />

      {/* Contact Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="md:flex items-start space-x-4">
          <Image
            src="/images/email.png"
            alt="Email Icon"
            width={110}
            height={100}
            className="w-24 h-24"
            priority
          />
          <div>
            <h2 className="text-xl font-semibold mb-2">Emails Us</h2>
            <p className="text-gray-700">
              General inquiries <br />
              <Link
                href={`mailto:${settings?.email || "queries@dsjournals.com"}`}
                aria-label="conatct email"
                className="text-light-blue  hover:text-blue"
              >
                {settings?.email || "queries@dsjournals.com"}
              </Link>
            </p>
            {/* <p className="mt-2 text-gray-700">
              Mobile <br />
              <Link
                href={`tel:${number}`}
                className="text-light-blue  hover:text-blue"
              >
                +91-{number} ({is_whatsapp && "whatsapp & "}call)
              </Link>
            </p> */}
            <ul>
              {settings?.phone_number?.map((p, i) => {
                const clean = String(p.number).trim();
                const is_whatsapp = p.is_whatsapp;
                return (
                  <li key={i} className="flex items-center space-x-2 mt-2">
                    <Link
                      href={`tel:${clean}`}
                      className="text-light-blue  hover:text-blue"
                    >
                      +91-{clean.slice(0, 5)} {clean.slice(5)} (
                      {is_whatsapp && "whatsapp & "}call)
                      <br />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-gray-700">
              Landline <br />
              <Link
                href={`tel:${
                  settings?.landline?.replace(/[^\d+]/g, "") || "+914352403869"
                }`}
                className="text-light-blue  hover:text-blue"
              >
                {settings?.landlines || "+91 (435) - 2403869"}
              </Link>
            </p>
          </div>
        </div>

        <div className="md:flex items-start space-x-4">
          <Image
            src="/images/email-box.png"
            alt="Office Address Icon"
            width={100}
            height={100}
            className="w-24 h-24"
            priority
          />
          <div>
            <h2 className="text-xl font-semibold mb-2">Office Address</h2>
            <h3 className="font-semibold">Dream Science</h3>
            <p>
              {settings?.address[0]?.line1}
              <br />
              {settings?.address[0]?.line2?.split("|")[0]?.trim()}
              <br />
              {settings?.address[0]?.line2?.split("|")[1]?.trim()}
              <br />
              {settings?.address[0]?.city} - {settings?.address[0]?.pincode},{" "}
              <br />
              {settings?.address[0]?.state} {settings?.address[0]?.country}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
