"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const DEFAULT_COLUMNS = [
  {
    title: "",
    links: [
      { label: "Home", href: "/" },
      { label: "Journals", href: "/journals" },
      { label: "About Us", href: "/about" },
    ],
  },
  {
    title: "",
    links: [
      { label: "Authors Guidelines", href: "/authors" },
      { label: "Editor Guidelines", href: "/editors" },
      { label: "Reviewer Guidelines", href: "/reviewers" },
    ],
  },
  {
    title: "",
    links: [
      { label: "Open Access", href: "/authors#open-access" },
      { label: "Publication Ethics", href: "/authors#publication-ethics" },
      { label: "Copyright Infringement", href: "/authors#copyright" },
    ],
  },
  {
    title: "",
    links: [
      { label: "Licensing Policy", href: "/authors#licensing" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

const DEFAULT_SOCIAL = [
  { name: "Twitter", href: "https://twitter.com/", Icon: Twitter },
  { name: "Facebook", href: "https://facebook.com/", Icon: Facebook },
  { name: "Instagram", href: "https://instagram.com/", Icon: Instagram },
  { name: "LinkedIn", href: "https://linkedin.com/", Icon: Linkedin },
];

export default function Footer({
  columns = DEFAULT_COLUMNS,
  social = DEFAULT_SOCIAL,
  brand = "Dream Science",
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-teal-900 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
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
                      <span className="text-lime-400 group-hover:translate-x-0.5 transition-transform">
                        ›
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
            <div className="flex items-center gap-3">
              {social.map(({ name, href, Icon }) => (
                <Link
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="grid h-9 w-9 place-items-center rounded-full bg-lime-500 text-teal-900 hover:brightness-110 transition"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 border-t border-white/10" />

        {/* Bottom bar */}
        <div className="py-4 text-center text-sm">
          © Copyright <span className="font-semibold">{brand}</span>. All Rights Reserved {year}
        </div>
      </div>
    </footer>
  );
}
