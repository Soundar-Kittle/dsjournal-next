"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function WeFocusOn() {
  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-5 gap-5 px-4 sm:px-6 lg:px-8 py-12"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Left side - Image */}
      <div className="relative w-full h-80 col-span-2">
        <Image
          src="/images/service-details-1.jpg"
          alt="We Focus On"
          fill
          className="object-cover shadow-md"
          priority
          sizes="100vw"
        />
      </div>

      {/* Right side - Text */}
      <div className="text-justify leading-relaxed col-span-3">
        <h3 className="text-xl font-semibold  mb-4">We Focus On....</h3>
        <p className="mb-4">
          The main goal of Dream Science is to utilize the untapped potential of
          the scientific community to strengthen the connections between science
          and society by bridging the science–society, science–science, and
          society–science gaps by supporting the community to recognize their
          issues and making appropriate scientific and technical solutions.
          Science and society have a mutually beneficial relationship, and we
          will discuss both the social implications for science and the impact
          of science on society. In order to foster an environment of knowledge
          and resource exchange, Dream Science will further connect top
          scientific institutions with all relevant parties. It will make it
          possible for the scientific community to change its perspective,
          improve the organisations' social standing, and motivate students to
          pursue careers in science.
        </p>
        <p>
          The processes can either help or hinder the achievement of the goal of
          assisting humanity. Dream Science will also take into account the
          processes through which scientific knowledge and technology are
          directed, disseminated, and applied, as well as the effects of such
          processes on the selection of what research is done and on the
          outcomes achieved.
        </p>
      </div>
    </motion.div>
  );
}
