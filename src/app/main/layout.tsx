"use client";

import MenuNavigation from "@/components/menuNavigation";
import Navbar from "@/components/navbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex w-full min-h-screen bg-[#15151] overflow-hidden">
      <MenuNavigation />
      <main className="flex flex-col w-full h-screen overflow-hidden">
        <Navbar onEmpresaChange={function (empresa: any): void {
          throw new Error("Function not implemented.");
        } } />
        <div className="flex-1 z-0 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
