"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

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

  const imageSrc = image ? "/" + image : "/images/hero-bgimg.jpg";
  return (
    <div className="w-full h-full relative text-white">
      {/* <div className="relative h-52 w-full">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
          priority={true}
        />
        <div className={`absolute inset-0 bg-black/${overlayOpacity}`}></div>
      </div> */}

      <div className={`relative h-[200px] overflow-hidden`}>
        <div
          style={{
            background: `url(${imageSrc}) center no-repeat`,
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
          }}
        ></div>
        <div className={`absolute inset-0 bg-black/${overlayOpacity}`}></div>
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className={`absolute top-1/2 left-1/2 -translate-1/2 w-full px-10 max-sm:px-5
              ${size ? size : "text-2xl sm:text-3xl  md:text-4xl lg:text-5xl "}
             font-semibold text-center z-10 `}
      >
        {title}
      </motion.h1>
    </div>
  );
};

export default PageHeader;
