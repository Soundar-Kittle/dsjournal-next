import Image from "next/image";
import Link from "next/link";

export default function JournalCard({ j }) {
  const imageSrc = j?.cover_image?.startsWith("/")
    ? j.cover_image.slice(1)
    : j?.cover_image;
  return (
    <Link
      href={`/${j.slug}`}
      className="group block overflow-hidden rounded shadow-[0_0_10px_rgba(0,0,0,0.2)] border border-[#ccc] p-2"
    >
      {/* Cover image */}
      <div className="relative h-[320px] w-full overflow-hidden p-3 shadow-[0_0_10px_rgba(0,0,0,0.4)] rounded">
        <Image
          src={imageSrc ? `/${imageSrc}` : "/logo.png"}
          alt={j.name}
          fill
          className="object-fit p-0.5 bg-white rounded"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>

      {/* Journal title */}
      <div className="text-center p-3 pb-5">
        <h3 className="line-clamp-2 text-sm font-semibold text-blue">
          {j.name}
        </h3>
      </div>
    </Link>
  );
}
