import React from "react";
import Image from "next/image";
import Logo from "@/assets/images/logo.png";

const AgilizaLogo: React.FC = () => {
  return (
    <>
      <article className="flex items-center justify-center ">
        <div className="w-10 h-10">
          <Image src={Logo} alt="logo" priority />
        </div>
        <h1 className="font-montserrat font-extrabold text-[20px] text-slate-600">
          Agiliza
          <span className="text-[#A644CB]">.app</span>
        </h1>
      </article>
    </>
  );
};

export default AgilizaLogo;
