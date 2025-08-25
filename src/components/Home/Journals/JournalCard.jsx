"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function JournalCard({ j }) {
  const [failed, setFailed] = useState(false);
  const cover = j.cover_url;

  return (
    <Link
      href={`/journals/${j.slug}`}
      className="group block overflow-hidden rounded-lg bg-white shadow hover:shadow-lg transition"
    >
      {/* Cover image */}
      <div className="relative aspect-[3/4] w-full bg-white">
        {!failed && cover ? (
          <Image
            src={cover}
            alt={j.name}
            fill
            sizes="(max-width:768px) 50vw, (max-width:1200px) 25vw, 20vw"
            className="object-contain p-2"
            onError={() => setFailed(true)}
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            No Cover
          </div>
        )}

      </div>

      {/* Journal title */}
      <div className="p-3 text-center">
        <h3 className="line-clamp-2 text-sm font-semibold text-sky-700 group-hover:text-sky-900">
          {j.name}
        </h3>
      </div>
    </Link>
  );
}
