"use client";
import AboutUs from "@/components/Home/AboutUs";
import PageHeader from "@/components/Home/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { motion } from "framer-motion";

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
        <AboutUs />
      </div>
    </main>
  );
}
