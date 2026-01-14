"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const JOURNAL_COLORS = {
  ms: "#000",
};

const PageHeader = ({
  items = [],
  title = "Page Header",
  image,
  size = "",
  overlayOpacity = "40",
}) => {
  const pathname = usePathname();

  const matchedTitle = items.find((x) =>
    pathname?.startsWith(x.menu_link)
  )?.menu_label;

  if (matchedTitle) title = matchedTitle;

  const segments = pathname.split("/").filter(Boolean);
  const rootSlug = segments[0];

  // ✅ Default WHITE
  const titleColor = JOURNAL_COLORS[rootSlug] || "#fff";

  const imageSrc = image ? "/" + image : "/images/hero-bgimg.jpg";

  return (
    <div className="w-full h-full relative">
      <div className="relative h-[200px] overflow-hidden">
        <div
          style={{
            background: `url(${imageSrc}) center / cover no-repeat`,
            position: "absolute",
            inset: 0,
          }}
        />
        <div className={`absolute inset-0 bg-black/${overlayOpacity}`} />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ color: titleColor }}
        className={`absolute top-1/2 left-1/2 -translate-1/2 w-full px-10 max-sm:px-5
          ${size ? size : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"}
          font-semibold text-center z-10`}
      >
        {title}
      </motion.h1>
    </div>
  );
};

export default PageHeader;
