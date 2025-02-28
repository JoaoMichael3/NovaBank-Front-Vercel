"use client";
import TransactionTable from "@/components/transactionTable";
import React, { useState } from "react";

const TransactionsPage: React.FC = () => {
  const [customers, setCustomers] = useState<Record<string, string>>({});
  const columns = [
    { key: "customerName", label: "Nome" },
    { key: "customer", label: "Cliente" },
    { key: "dateCreated", label: "Data de Criação" },
    { key: "status", label: "Status" },
    // { key: "customer", label: "Cliente" },
    { key: "billingType", label: "Tipo de cobrança" },
    { key: "description", label: "Descrição" },
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

      if (!response.ok) {
        console.error(
          `Erro ao buscar cliente (${response.status}):`,
          await response.text()
        );
        return "Erro ao buscar";
      }

      const data = await response.json();

      if (data && data.name) {
        const customerName = data.name;
        setCustomers((prev) => ({ ...prev, [customerId]: customerName }));
        return customerName;
      } else {
        console.warn(`Nome não encontrado para o cliente ${customerId}`);
        return "Nome não encontrado";
      }
    } catch (error) {
      console.error("Erro ao buscar nome do cliente:", error);
      return "Erro ao buscar";
    }
  };
  return (
    <div className="flex items-center w-full overflow-y-auto overflow-x-auto p-10">
      <div className="flex flex-col gap-5 justify-center items-center w-full">
        <div className="items-center w-full h-auto p-5">
          <TransactionTable
            title="Extratos"
            fetchEndpoint={`${process.env.NEXT_PUBLIC_CHARGES_URL}`}
            deleteEndpoint={`${process.env.NEXT_PUBLIC_CHARGES_URL}`}
            columns={columns}
            fetchCustomerName={fetchCustomerName}
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
