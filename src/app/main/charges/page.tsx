"use client";

import React, { useState, useEffect } from "react";
import ToastNotifications from "@/components/toast/page";
import TransactionTable from "@/components/transactionTable"; 
import ChargeForme from "@/components/chargesForm/index";
import Image from "next/image";
import Loading from "@/assets/images/loading.svg"
const CreateCharges: React.FC = () => {
  const [toasts, setToasts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Record<string, string>>({}); 
  const [columns, setColumns] = useState<{ key: string; label: string }[]>([]);

  useEffect(() => {
    setColumns([
      { key: "customer", label: "ID Cliente" }, 
      { key: "customerName", label: "Nome do Cliente" }, 
      { key: "dateCreated", label: "Criada em" },
      { key: "dueDate", label: "Data de vencimento" },
      { key: "status", label: "Status" },
      { key: "value", label: "Valor" },
      { key: "billingType", label: "Tipo" },
      { key: "description", label: "Descrição" },
    ]);
  }, []);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = new Date().getTime();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

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
        console.error(`Erro ao buscar cliente (${response.status}):`, await response.text());
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
    <div className="text-white items-center p-10 rounded-lg">
      <ToastNotifications toasts={toasts} removeToast={removeToast} />
      <ChargeForme />
      <div className="mt-12">
        {columns.length > 0 ? (
          <TransactionTable
          title="Lista de Cobranças"
          fetchEndpoint={`${process.env.NEXT_PUBLIC_CHARGES_URL}`}
          deleteEndpoint={`${process.env.NEXT_PUBLIC_DELETE_CHARGES_URL}`}
          columns={columns}
          fetchCustomerName={fetchCustomerName}
        />        
        ) : (
          <div className="flex justify-center items-center">
            <div className="w-80 h-80 ">
            <Image src={Loading} alt="Loading" className="animate-spin" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCharges;
 