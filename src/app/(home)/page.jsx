"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search as SearchIcon,
  BookOpen,
  LockOpen,
  ShieldCheck,
} from "lucide-react";

export default function Page() {

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">


      {/* Hero */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero-circuit.jpg"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-slate-900/60" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Invent to Broadcast Scientific Communal
          </h1>
          <p className="mt-4 text-slate-200">
            Alignment with the vision of exploring transparency through scientific modernity.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-semibold mb-6">Home Page</h2>
        <p className="leading-7 text-slate-600">
          Welcome to Dream Science. Explore journals, author guidelines, and reviewer resources.
        </p>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-200 py-8 text-center">
        <p className="text-sm">© {new Date().getFullYear()} Dream Science. All rights reserved.</p>
      </footer>
    </div>
  );
}
