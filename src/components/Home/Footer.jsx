"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FaInstagram, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { motion } from "framer-motion";
import ScrollToTop from "./ScrollToTop";

const containerVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const DEFAULT_COLUMNS = [
  {
    title: "",
    links: [
      { label: "Home", href: "/" },
      { label: "Journals", href: "/journals" },
      { label: "About Us", href: "/about-us" },
    ],
  },
  {
    title: "",
    links: [
      { label: "Authors Guidelines", href: "/for-authors" },
      { label: "Editor Guidelines", href: "/for-editors" },
      { label: "Reviewer Guidelines", href: "/for-reviewers" },
    ],
  },
  {
    title: "",
    links: [
      { label: "Open Access", href: "/open-access" },
      { label: "Publication Ethics", href: "/for-authors/publication-ethics" },
      {
        label: "Copyright Infringement",
        href: "/for-authors/copyright-infringement",
      },
    ],
  },
  {
    title: "",
    links: [
      { label: "Licensing Policy", href: "/for-authors/licensing-policy" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact Us", href: "/contact-us" },
    ],
  },
];

const DEFAULT_SOCIAL = [
  { name: "Twitter", href: "https://x.com/DreamScience4", Icon: FaXTwitter },
  {
    name: "Facebook",
    href: "https://www.facebook.com/Dream-Science-Journals-102737959201943",
    Icon: FaFacebookF,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/dreamsciencejournals/",
    Icon: FaInstagram,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/dream-science-journals-a7a688246/",
    Icon: FaLinkedinIn,
  },
];

export default function Footer({
  columns = DEFAULT_COLUMNS,
  social = DEFAULT_SOCIAL,
  brand = "Dream Science",
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-start">
          {/* 4 columns of links */}
          {columns.slice(0, 4).map((col, idx) => (
            <div key={idx} className="space-y-3">
              {col.title ? (
                <h4 className="font-semibold">{col.title}</h4>
              ) : null}
              <ul className="space-y-3">
                {col.links.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      className="group inline-flex items-center gap-2 text-slate-100/90 hover:text-white"
                    >
                      <span className="text-primary group-hover:translate-x-0.5 transition-transform">
                        <ChevronRight size={16} />
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social column */}
          <div className="space-y-4">
            <h4 className="font-semibold">Follow Us</h4>
            <div className="flex items-center gap-1">
              {social.map(({ name, href, Icon }) => (
                <Link
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white hover:text-secondary transition"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      <div className="pb-16 pt-10 text-center text-sm border-t border-white">
        © Copyright <span className="font-semibold">{brand}</span>. All Rights
        Reserved {year}
      </div>
      <ScrollToTop />
    </footer>
  );
}
