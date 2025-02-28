"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import loadingSpinner from "@/assets/images/loading.svg";

interface Company {
  name: string;
  incomeValue: number;
}

interface TierListProps {
  title: string;
  highlight: string;
}

const TierList: React.FC<TierListProps> = ({ title, highlight }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrl = process.env.NEXT_PUBLIC_LIST_URL;

    

    if (!fetchUrl) {
      setError("A URL da API não foi configurada.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
   

    if (!token) {
      setError("Você precisa estar autenticado para ver este conteúdo.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await fetch(fetchUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erro ao buscar os dados da API: ${response.status}`);
        }

        const data = await response.json();
      

        const formattedCompanies = (data.data || data || []) 
          .map((item: any) => ({
            name: item.name || "Nome Indisponível",
            incomeValue: item.incomeValue || 0,
          }))
          .sort((a: Company, b: Company) => b.incomeValue - a.incomeValue)
          .slice(0, 5);

      
        setCompanies(formattedCompanies);
      } catch (error: any) {
        console.error("Erro ao buscar os dados:", error.message);
        setError(error.message || "Ocorreu um erro inesperado.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Image
          src={loadingSpinner}
          alt="Carregando"
          width={50}
          height={50}
          className="animate-spin"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <p className="text-red-500 text-lg">Erro: {error}</p>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white text-lg">Nenhum dado disponível.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-white rounded-lg p-6">
      <h2 className="text-md font-semibold text-[#D069F8]">
        {title} <span className="text-white">{highlight}</span>
      </h2>
      <ul className="flex flex-col gap-3">
        {companies.map((company, index) => (
          <li
            key={index}
            className="flex items-center justify-between p-4 bg-[#2A2A2A] rounded-md shadow-sm"
          >
            <div className="flex items-center">
              <span className="text-xl font-bold text-[#D069F8] mr-4">
                {index + 1}°
              </span>
              <div>
                <h3 className="text-md font-semibold">{company.name}</h3>
                <p className="text-sm text-[#8C8C8D]">
                  R$ {company.incomeValue.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TierList;
