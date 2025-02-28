import React from "react";
import Image from "next/image";
import { ButtonProps } from "./types";

const Button: React.FC<ButtonProps> = ({
  imageSrc,
  imageAlt,
  type,
  text,
  onClick,
  color,
  hoverColor,
  disabled = false,
}) => {
  return (
    <button
      type={type}
      className={`py-3 px-4 flex w-full items-center justify-center gap-x-3 rounded transition-all duration-300 bg-[#A644CB] hover:bg-fuchsia-700`}
      onClick={onClick}
      disabled={disabled}
    >
      {imageSrc && imageAlt && (
        <div className="w-5 flex justify-center items-center">
          <Image
            src={imageSrc}
            alt={imageAlt}
            className="w-6 h-6 justify-center items-start flex"
          />
        </div>
      )}
      <span className="font-roboto text-white flex justify-center text-[12px] ">
        {text}
      </span>
    </button>
  );
};

export default Button;
