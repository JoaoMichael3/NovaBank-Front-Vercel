"use client";
import React, { useState } from "react";
import Button from "@/components/button";


const cobranca: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen ">
      <div className="w-full bg-slate-500 p-8">
        <div className="flex gap-6">
          <Button
            text="Ativar Antecipação"
            color="bg-gray-600"
            hoverColor="hover:bg-gray-500"
            type="button"
          />
          <Button
            text="Ativar Antecipação"
            color="bg-gray-600"
            hoverColor="hover:bg-gray-500"
            type="button"
          />
          <Button
            text="Ativar Antecipação"
            color="bg-gray-600"
            hoverColor="hover:bg-gray-500"
            type="button"
          />
          <Button
            text="Ativar Antecipação"
            color="bg-gray-600"
            hoverColor="hover:bg-gray-500"
            type="button"
          />
        </div>
      </div>
    </div>
  );
};

export default cobranca;
