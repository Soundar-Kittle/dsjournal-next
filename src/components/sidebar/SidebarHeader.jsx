import React from "react";
// import { useSettings } from "@/context/Settings";
import Image from "next/image";

export const SidebarHeader = ({ collapsed }) => {
  // const settings = useSettings();
  return (
    <>
      {/* Logo row ------------------------------------------------------- */}
      <div className="p-4 flex items-center justify-center sticky top-0 z-10 h-[78px]">
        <div className="flex items-center">
          {collapsed && (
            <div className="w-12 h-12 flex items-center justify-center font-bold">
              <Image
                src="/logo.png"
                alt="Logo"
                width={50}
                height={50}
                objectFit="contain"
              />
            </div>
          )}
          {!collapsed && (
            <div className="text-lg font-bold ml-3 w-55 h-8">
              {/* src={`/uploads/settings/${settings?.logo}`} */}
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                objectFit="contain"
                // fallbackSrc={"/logo/logo.png"}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
