"use client";
// import AboutUs from "@/components/Home/AboutUs";
import PageHeader from "@/components/Home/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { motion } from "framer-motion";
import Image from "next/image";

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function AboutUsPage() {
  return (
    <main className="bg-white">
      <PageHeader title="About Us" />
      <Breadcrumbs
        parents={[{ menu_label: "About Us", menu_link: "/about-us" }]}
      />

      <div className="max-w-7xl mx-auto space-y-3 px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mt-10">
          <motion.h2 className="text-2xl mb-3" variants={cardVariants}>
            Who We Are
          </motion.h2>
          <motion.div
            className="relative mt-2 w-28 mx-auto"
            variants={cardVariants}
          >
            <div className="absolute inset-0 h-[1px] bg-gray-300"></div>
            <div className="absolute left-0 right-0 -bottom-[2px] flex justify-center">
              <div className="w-12 h-[3px] bg-primary"></div>
            </div>
          </motion.div>
        </div>
        <p className="text-center mt-10 px-5">
          Dream Science is a service based nonprofit research organization
          founded in India, furnishing supports and services to education
          professionals and researchers around the globe without any cost or
          financial expectation. Our mission has always focused on helping our
          researchers succeed, wherever they are in their education and
          professional careers
        </p>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: Image */}
                <div className="relative w-full h-[320px] md:h-[420px] overflow-hidden">
                  <Image
                    src="/images/about.jpg"
                    alt="About Dream Science"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
        
                {/* Right: Text */}
                <div className="space-y-5 leading-relaxed text-justify">
                 <p>
  We are bridging the higher education gap by delivering content solutions in new and innovative ways to enrich the learning experience. We are a proven leader in strategic higher education consulting and partnering with educators and institutions globally to achieve success, and our print and digital solutions enable students and instructors worldwide.We encourage learning to be a continuous, lifelong experience an integral, essential part of every stage of building a career.
</p>
<p>We are closing the talent deficit by supporting employers, helping them find and retain top talent, assess their employees’ skill sets, and implement training in order to transform company cultures.For decades we’ve helped people learn; today we’re showing them new ways to achieve, get certified and advance their careers.</p>

<p>We are strengthening the research community by partnering with learned societies and supporting researchers to communicate discoveries that make a difference. We collaborate with authors, societies, libraries, and other members of the research community to generate, communicate, and enable access to the scientific and scholarly insights that are helping to solve some of the world’s biggest challenges.</p>

<p>Our commitment to partnership helps us advance innovation and connect researchers, learners, and professionals with the content, platforms, and tools they need to be successful.</p>      

                </div>
              </div>

      </div>
    </main>
  );
}
