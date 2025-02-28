"use client";

import React, { useState } from "react";
import pix from "@/assets/icons/pix.svg";
import copia from "@/assets/icons/copiar.png";
import Image from "next/image";
import Button from "@/components/button";
import TransactionTableTransfer from "@/app/main/Transactions/tabelaTransfer"
import Popup from "@/components/popup";
import PixEndTed from "../pix/createPixKey";
import CopyEndGlu from "../charges/components/createPayment/copyendglu/page";

const Transaction: React.FC = () => {
  const [isCreatePaymentOpenPopup, setIsCreatePaymentOpenPopup] =
    useState<boolean>(false);
  const [customers, setCustomers] = useState<Record<string, string>>({});
  const [copyOpenPopup, setCopyOpenPopup] = useState<boolean>(false);

  const columns = [
    { key: "id", label: "ID" },
    { key: "customerName", label: "Nome do Cliente" }, 
    { key: "value", label: "Valor" },
    { key: "status", label: "Status" },
    { key: "description", label: "Descrição" },
    { key: "dateCreated", label: "Data de Criação" },
    { key: "confirmedDate", label: "Data de confirmação" },
    { key: "operationType", label: "Operação" },
    { key: "pixAddressKey", label: "Chave pix" },
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
    <div className="flex flex-col w-full h-full p-6">
      <div className="mt-16 flex items-center">
        <span className="lg:h-10 h-8 text-transparent flex items-center bg-[#A644CB]">
          |
        </span>
        <p className="text-white lg:text-[1.5rem] text-[1.2rem] flex justify-center mt-2 ml-2">
          Transferências
        </p>
      </div>

      <div className="mt-8 flex flex-col lg:flex-row gap-4 w-full mb-12">
        <div className="flex flex-col items-center bg-[#1F1F1F] p-4 rounded-lg w-full lg:w-1/2 border border-white">
          <div className="flex justify-between items-center w-full">
            <div className="flex justify-between items-center">
              <Image src={pix} alt="pix" className="lg:w-36 w-20" />
              <div className="pl-6">
                <p className="text-[#dddd] font-roboto font-semibold mb-1 lg:text-[20px] text-[14px]">
                  Transferir valores
                </p>
                <p className="text-[#dddd] font-roboto text-[10px]">
                  Transferência por Pix ou TED.
                </p>
              </div>
            </div>
            <div className="text-[10px]">
              <Button
                type="submit"
                text="Transferir"
                color="bg-[#A644CB]"
                hoverColor="bg-[#8E38A6]"
                disabled={false}
                onClick={() => setIsCreatePaymentOpenPopup(true)}
              />
            </div>
            {isCreatePaymentOpenPopup && (
              <Popup
                isOpen={isCreatePaymentOpenPopup}
                onClose={() => setIsCreatePaymentOpenPopup(false)}
              >
                <PixEndTed />
              </Popup>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center bg-[#1F1F1F] p-4 rounded-lg w-full lg:w-1/2 border border-white">
          <div className="flex justify-between items-center w-full">
            <div className="flex justify-between items-center">
              <Image src={copia} alt="Copiar e cola" className="lg:w-16 w-10" />
              <div className="pl-6">
                <p className="text-[#dddd] lg:text-[20px] text-[14px] font-roboto font-semibold mb-1">
                  PIX copia e cola
                </p>
                <p className="text-[#dddd] text-[10px] font-roboto">
                  Colo ou digite um código para realizar pagamentos.
                </p>
              </div>
            </div>
            <div className="text-[10px]">
              <Button
                type="submit"
                text="Pagar"
                color="bg-[#A644CB]"
                hoverColor="bg-[#8E38A6]"
                disabled={false}
                onClick={() => setCopyOpenPopup(true)}
              />
            </div>
            {copyOpenPopup && (
              <Popup
                isOpen={copyOpenPopup}
                onClose={() => setCopyOpenPopup(false)}
              >
                <CopyEndGlu />
              </Popup>
            )}
          </div>
        </div>
      </div>
      <TransactionTableTransfer
        title="Transferencias"
        fetchEndpoint={process.env.NEXT_PUBLIC_PAYOUT_TRANSFERSList_URL || "ERROR"}
        deleteEndpoint={process.env.NEXT_PUBLIC_DELETE_TRANFERENCIA_URL || "ERROR"}
        columns={columns}
        fetchCustomerName={fetchCustomerName}
      />
    </div>
  );
};

export default Transaction;
