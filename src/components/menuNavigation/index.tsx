"use client";
import Cookies from "js-cookie";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AgilizaLogo from "@/components/agilizaLogo";
import ListItems from "@/components/list";
import DashboardOption from "@/components/dashboardOption";
import InfoBankUser from "@/components/infoBankUser";
import Button from "../button";
import power from "@/assets/images/power.svg";
import {
  dashboardOption,
  clientMainSection,
  chargerMainSection,
  billMainSection,
  transferenceMainSection,
} from "@/utils/mainObjects";
const MenuNavigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };
  const handleLogout = () => {
    localStorage.removeItem("token"); 
    Cookies.remove("token");
    router.push("/login"); 
  };
  return (
    <div>
      <div className="lg:hidden fixed flex items-center justify-between p-3 w-full bg-[#fff] top-0 left-0 z-50">
        <div className="py-2 flex items-center">
          <AgilizaLogo />
        </div>
        <button onClick={toggleMenu}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
            />
          </svg>
        </button>
      </div>
      <section
        className={`fixed left-0 top-0 h-full w-full bg-[#ffff] p-3 z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:relative lg:w-[19.9rem] lg:flex lg:flex-col overflow-auto`}
      >
        <div className="flex items-center justify-cent mb-5 mt-4">
          <div className="ml-12">
          <AgilizaLogo />
          </div>
          <button onClick={toggleMenu}>
            <svg
              className="w-6 h-6 text-gray-500 hover:text-gray-800 transition lg:hidden"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <InfoBankUser />
        <article className="flex flex-col gap-y-8 mt-10 p-10 w-full overflow-y-auto">
          <DashboardOption section={dashboardOption} onClick={handleLinkClick} />
          <ListItems section={clientMainSection} onClick={handleLinkClick} />
          <ListItems section={chargerMainSection} onClick={handleLinkClick} />
          <ListItems section={billMainSection} onClick={handleLinkClick} />
          <ListItems section={transferenceMainSection} onClick={handleLinkClick} />
          <Button
            type="button"
            text="Logout"
            color="bg-red-500"
            hoverColor="hover:bg-red-700"
            disabled={false}
            imageSrc={power}
            onClick={handleLogout} 
          />
        </article>
      </section>
    </div>
  );
};
export default MenuNavigation;