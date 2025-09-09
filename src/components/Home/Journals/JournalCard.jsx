import Image from "next/image";
import Link from "next/link";

export default function JournalCard({ j }) {
  return (
    <Link
      href={`/journals/${j.slug}`}
      className="group block rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-2xl bg-slate-100">
        {j.cover_url ? (
          <Image
            src={j.cover_url}
            alt={j.name}
            fill
            sizes="(max-width:768px) 50vw, (max-width:1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={() => setFailed(true)}
            unoptimized // 👈 if your covers are local (/uploads/...), this avoids optimizer quirks
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            No Cover
          </div>
        )}
        {(j.issn_online || j.issn_print) && (
          <span className="absolute left-2 top-2 rounded bg-white/90 px-2 py-0.5 text-[11px] font-medium text-slate-700">
            {j.issn_online || j.issn_print}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-center text-sm font-semibold text-slate-800 group-hover:text-emerald-700">
          {j.name}
        </h3>
      </div>
    </Link>
  );
}
