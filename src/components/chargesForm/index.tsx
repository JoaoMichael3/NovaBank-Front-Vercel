"use client";

import React, { useState } from "react";
import ToastNotifications from "@/components/toast/page";
import PixChargeForm from "@/components/chargesForm/PixChargeForm";
import BoletoChargeForm from "@/components/chargesForm/BoletoChargeForm";
import CreditCardChargeForm from "@/components/chargesForm/CreditCardChargeForm";

const ChargeForm: React.FC = () => {
  const [billingType, setBillingType] = useState<string>("PIX");
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = new Date().getTime();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="bg-[#1c1f27] rounded-lg p-5 text-white">
      <ToastNotifications toasts={toasts} removeToast={removeToast} />

      <h2 className="border-l-4 pl-2 text-[30px] border-solid border-[#A644CB] mb-6">
        Criar Nova Cobrança
      </h2>

      <label className="flex flex-col gap-1 mb-4">
        Escolha o tipo de pagamento:
        <select
          className="p-2 rounded bg-gray-800 text-white"
          value={billingType}
          onChange={(e) => setBillingType(e.target.value)}
        >
          <option value="PIX">Pix</option>
          <option value="BOLETO">Boleto</option>
          <option value="CREDIT_CARD">Cartão de Crédito</option>
        </select>
      </label>

       {billingType === "PIX" && <PixChargeForm addToast={addToast} />} 
      {billingType === "BOLETO" && <BoletoChargeForm addToast={addToast} />}
       {billingType === "CREDIT_CARD" && <CreditCardChargeForm addToast={addToast} />}
    </div>
  );
};

export default ChargeForm;
