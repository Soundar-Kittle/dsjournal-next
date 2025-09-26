import Image from "next/image";
import PageHeader from "@/components/Home/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function Page() {
  return (
    <main className="bg-white">
      <PageHeader title="Contact Us" />
      <Breadcrumbs />

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
              <a
                href="mailto:queries@dsjournals.com"
                className="text-light-blue  hover:text-blue"
              >
                queries@dsjournals.com
              </a>
            </p>
            <p className="mt-2 text-gray-700">
              Mobile <br />
              <a
                href="tel:+919578957897"
                className="text-light-blue  hover:text-blue"
              >
                +91-9578957897 (whatsapp &amp; call)
              </a>
            </p>
            <p className="mt-2 text-gray-700">
              Landline <br />
              <a
                href="tel:+914352403869"
                className="text-light-blue  hover:text-blue"
              >
                +91 (435) - 2403869
              </a>
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
            <p >
              1272, Thirumetraligai East Street, <br />
              Patteeswaram P.O., <br />
              Kumbakonam T.K., <br /> 
              Thanjavur District - 612 703, <br />
              TamilNadu, India.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
