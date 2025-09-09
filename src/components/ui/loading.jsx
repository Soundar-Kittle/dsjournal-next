import Image from "next/image";
import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Image src={"/logo.png"} priority alt={"loading"} />
    </div>
  );
};

export default Loading;
