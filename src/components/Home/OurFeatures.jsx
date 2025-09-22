"use client";

import { BsJournalMedical } from "react-icons/bs";
import { BiSolidBookContent, BiSolidLockOpenAlt } from "react-icons/bi";

const features = [
  {
    icon: <BiSolidBookContent className="text-pink-500 text-3xl" />,
    title: "Abstracting and Indexing",
    description:
      "World Wide indexed international journals in various disciplines from Dream Science for research community...",
    color: "bg-pink-100",
    hoverBorder: "hover:border-pink-500",
  },
  {
    icon: <BiSolidLockOpenAlt className="text-cyan-500 text-3xl" />,
    title: "Open Access",
    description:
      "In accordance with major definitions of open access in scientific literature (namely the Budapest, Berlin, and Bethesda declarations)...",
    color: "bg-cyan-100",
    hoverBorder: "hover:border-cyan-500",
  },
  {
    icon: <BsJournalMedical className="text-green-500 text-3xl" />,
    title: "License Policy",
    description:
      "Dream Science International Journals publishes open access articles under a Attribution-NonCommercial-No Derivatives 4.0...",
    color: "bg-green-100",
    hoverBorder: "hover:border-green-500",
  },
];

export default function OurFeatures() {
  return (
    <section className="py-16">
      <div className="mx-auto sm:max-w-xl md:max-w-3xl lg:max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-gray-800">Our Features</h2>
          <div className="relative mt-2 w-32 mx-auto">
            {/* Full gray line */}
            <div className="absolute inset-0 h-[1px] bg-gray-300"></div>
            {/* Centered colored part */}
            <div className="absolute left-0 right-0 -bottom-[2px]  flex justify-center">
              <div className="w-14 h-[3px] bg-primary"></div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`bg-white shadow-[0_0_20px_3px_rgba(0,0,0,0.07)] p-8 text-center hover:shadow-lg border border-transparent transition duration-300 ${feature.hoverBorder}`}
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 mx-auto flex items-center justify-center rounded-full ${feature.color} mb-4`}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
