"use client";

import React, { useState } from "react";
import Popup from "@/components/popup";
import TransactionTable from "@/components/transactionTable";
import { columns, data } from "@/utils/tableData";

const ChargesPage: React.FC = () => {
  const [isCreatePaymentOpenPopup, setIsCreatePaymentOpenPopup] = useState<boolean>(false);
  const [customers, setCustomers] = useState<Record<string, string>>({}); 
  
  const columns = [
    { key: "id", label: "ID" },
    { key: "customerName", label: "Nome do Cliente" }, 
    { key: "dateCreated", label: "Data de criação" },
    { key: "value", label: "Valor" },
    // { key: "netValue", label: "Valor LIQ" },
    { key: "status", label: "Status" },
    { key: "description", label: "Descrição" },
    { key: "dueDate", label: "Vencimento" },
    // { key: "billingType", label: "Tipo de cobrança" },
    
  ];
  const fetchCustomerName = async (customerId: string) => {
    if (!customerId) return "N/A";
    if (customers[customerId]) return customers[customerId];

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado.");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SEARCH_CUSTOMER_URL}/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Erro ao buscar cliente");

      const data = await response.json();
      const customerName = data.name || "Não encontrado";

      setCustomers((prev) => ({ ...prev, [customerId]: customerName }));
      return customerName;
    } catch (error) {
      console.error("Erro ao buscar nome do cliente:", error);
      return "Não encontrado";
    }
  };
  return (
    <div className="items-center w-full h-auto p-10">

      <div className="flex justify-end m-5">
        <button
          className="bg-[#A644CB] text-[#ddd] font-roboto text-[12px] font-bold py-2 px-4 rounded hover:bg-purple-500"
          onClick={() => setIsCreatePaymentOpenPopup(true)}
        >
          Criar Novo Pagamento
        </button>
      </div>
      <div>
      <TransactionTable
        title="Transações"
        fetchEndpoint={process.env.NEXT_PUBLIC_CHARGES_URL!}
        deleteEndpoint={process.env.NEXT_PUBLIC_DELETE_CHARGES_URL!}
        columns={columns}
        fetchCustomerName={fetchCustomerName} 
      />
      </div>

    </div>
  );
};

export default ChargesPage;
