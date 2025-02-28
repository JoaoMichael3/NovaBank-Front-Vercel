import React from "react";
import { TitleProps } from "./types";

const Title: React.FC<TitleProps> = ({ text }) => {
  return (
    <div className="flex items-baseline gap-x-3">
      <div className="h-[0.125rem] w-10 bg-gray-400" />
      <h1 className="text-white font-roboto text-center text-xl md:text-4xl">{text}</h1>
      <div className="h-[0.125rem] w-10 bg-gray-400" />
    </div>
  );
};

export default Title;
