"use client";
import React, { useState } from "react";
import SubaccountTable from "@/components/subaccountTable/page";
import loadingSpinner from "@/assets/images/loading.svg";
import Image from "next/image";

interface Transaction {
  id: string;
  customer: string;
  status: string;
  amount: number;
  dateCreated: string;
}

const BuscarCliente = () => {
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nome" },
    { key: "status", label: "Status" },
    { key: "email", label: "Email" },
    { key: "cpfCnpj", label: "CPF / CNPJ" },
    { key: "companyType", label: "Tipo" },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      const response = await fetch("process.env.NEXT_PUBLIC_CHARGES_URL", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar transações");

      const data = await response.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 p-6">
      {loading ? (
        <div className="flex justify-center ">
          <Image
            src={loadingSpinner}
            alt="Carregando..."
            className="w-[300px] h-[300px] animate-spin"
          />
        </div>
      ) : (
        <SubaccountTable
          title="Buscar cliente"
          fetchEndpoint={process.env.NEXT_PUBLIC_LIST_URL || ""}
          deleteEndpoint={process.env.NEXT_PUBLIC_DELETE_ENDPOINT || ""}
          columns={columns}
        />
        
      )}
    </div>
  );
};

export default BuscarCliente;
