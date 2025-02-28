"use client";
import React, { useState } from "react";
import Image from "next/image";
import ArrowIcon from "@/assets/icons/arrowIcon.png";
import { ListItemsProps } from "./types";
import Link from "next/link";

const ListItems: React.FC<ListItemsProps> = ({ section, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex flex-col">
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={toggleOpen}
      >
        <div className="flex items-start gap-2">
          <div className="w-7 invert">
            <Image src={section.iconSrc} alt={section.alt} />
          </div>
          <p className="font-roboto tracking-wide text-[#A644CB] text-lg font-bold transition-all duration-300 ease-in-out">
            {section.title}
          </p>
        </div>
        <div
          className={`w-7 transform transition-transform ${
            isOpen ? "rotate-0" : "rotate-180"
          }`}
        >
          <Image src={ArrowIcon} alt="Arrow" />
        </div>
      </div>

      {isOpen && (
        <ul className="pl-3 mt-3 ml-3 transition-all duration-300 ease-in-out">
          <div className="w-20 h-1 border-t-cyan-900"></div>
          {section.items.map((item, index) => (
            <li
              key={index}
              className="p-1 border-[#A644CB] border-solid hover:border-b-2 rounded-xl"
            >
              <Link
                href={item.route}
                passHref
                className="flex items-start mb-2"
                onClick={onClick} 
              >
                <div className="w-6 mr-3 pl-1">
                  <Image src={item.iconSrc} alt={item.alt} />
                </div>
                <p className="font-roboto text-[#8192A9] text-sm">{item.label}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListItems;
