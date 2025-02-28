"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import loadingSpinner from "@/assets/images/loading.svg";
import Apresentation from "@/components/apresentation";
import Button from "@/components/button";
import CreditCardForm, { CreditCardFormValues } from "@/components/CreditCardForm";
import PDFGenerator from "@/components/pdfegenerator";

// Definição da interface de dados retornados (ajuste conforme sua API)
export interface PaymentData {
  billingType: "BOLETO" | "PIX" | "CREDIT_CARD";
  id: string;
  // Dados para boleto
  identificationField?: string;
  nossoNumero?: string;
  barCode?: string;
  // Dados para PIX
  encodedImage?: string;
  payload?: string;
  expirationDate?: string;
  // Dados para cartão (se necessário)
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    mobilePhone: string;
  };
}

const PaymentPage: React.FC = () => {
  const { hash } = useParams() as { hash: string };
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  // Decodifica o hash (assumindo que é um base64 de um JSON com { id })
  useEffect(() => {
    if (!hash) {
      setError("Hash de pagamento não fornecido.");
      setLoading(false);
      return;
    }
    try {
      const decoded = atob(hash);
      const payload = JSON.parse(decoded) as { id: string };
      fetchPaymentData(payload.id);
    } catch (err) {
      console.error(err);
      setError("Erro ao decodificar o hash de pagamento.");
      setLoading(false);
    }
  }, [hash]);

  // Busca os dados do pagamento (incluindo billingType) no endpoint novo
  const fetchPaymentData = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<PaymentData>(`http://localhost:3004/payout/charges/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setPaymentData(response.data);
      setLoading(false);
      // Define mensagem padrão de status conforme o billingType
      if (response.data.billingType === "BOLETO") {
        setStatusMessage("Seu boleto será compensado em até 3 dias úteis a partir do pagamento.");
      } else if (response.data.billingType === "PIX") {
        setStatusMessage("Aguardando pagamento via PIX...");
      }
    } catch (err: any) {
      console.error(err);
      setError("Erro ao buscar dados de pagamento.");
      setLoading(false);
    }
  };

  // Para PIX, inicia um polling a cada 1 minuto (máximo de 10 tentativas)
  useEffect(() => {
    let attempt = 0;
    let interval: NodeJS.Timeout;
    if (paymentData && paymentData.billingType === "PIX") {
      interval = setInterval(async () => {
        if (attempt >= 10) {
          clearInterval(interval);
          return;
        }
        attempt++;
        try {
          const res = await axios.get<{ status: string }>(`http://localhost:3004/payout/charges/payment/${hash}`);
          if (res.data.status === "paid") {
            setStatusMessage("Pagamento realizado com sucesso!");
            clearInterval(interval);
          } else {
            setStatusMessage(`Aguardando pagamento via PIX... (status: ${res.data.status})`);
          }
        } catch (err) {
          console.error(err);
        }
      }, 60000); // 60000 ms = 1 minuto
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentData, hash]);

  // Função para tratar o envio do formulário de cartão de crédito
  const handleCreditCardSubmit = async (values: CreditCardFormValues) => {
    try {
      const res = await axios.post("http://localhost/payout/charges/payment/s5tbBtcFqWY", values);
      if ([200, 201].includes(res.status)) {
        setStatusMessage("Pagamento com cartão realizado com sucesso! Em análise por até 24h.");
      } else {
        setError("Erro ao processar pagamento com cartão.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Erro ao processar pagamento com cartão.");
    }
  };

  // Renderiza o conteúdo conforme o billingType
  const renderPaymentContent = () => {
    if (!paymentData) return null;
    switch (paymentData.billingType) {
      case "PIX":
        return (
          <div className="flex flex-col items-center">
            {paymentData.encodedImage && (
              <Image
                src={`data:image/png;base64,${paymentData.encodedImage}`}
                alt="QR Code Pix"
                width={300}
                height={300}
              />
            )}
            <p className="text-white mt-4">{statusMessage}</p>
            {paymentData.payload && (
              <p className="text-gray-300 mt-2 text-center">{paymentData.payload}</p>
            )}
          </div>
        );
      case "BOLETO":
        return (
          <div className="flex flex-col items-center">
            <p className="text-white text-lg font-semibold">Pagamento por Boleto</p>
            <p className="text-gray-300 mt-2">
              Identificação: {paymentData.identificationField}
            </p>
            <p className="text-gray-300 mt-2">
              Nosso Número: {paymentData.nossoNumero}
            </p>
            <p className="text-gray-300 mt-2">
              Código de Barras: {paymentData.barCode}
            </p>
            <p className="text-white mt-4">{statusMessage}</p>
          </div>
        );
      case "CREDIT_CARD":
        if (!paymentData.creditCard || !paymentData.creditCardHolderInfo) {
          return <p className="text-red-500">Dados do cartão não encontrados.</p>;
        }
        const creditCardData: CreditCardFormValues = {
          creditCard: paymentData.creditCard,
          creditCardHolderInfo: {
            ...paymentData.creditCardHolderInfo,
            addressComplement: paymentData.creditCardHolderInfo.addressComplement || "",
          },
        };
        
        return (
          <div className="flex flex-col items-center">
            <p className="text-white text-lg font-semibold">Pagamento com Cartão de Crédito</p>
            <p className="text-white mt-2">{statusMessage}</p>
            <CreditCardForm data={creditCardData} onSubmit={handleCreditCardSubmit} />
          </div>
        );
      default:
        return <p className="text-red-500">Tipo de pagamento não suportado.</p>;
    }
  };

  if (loading) {
    return <p className="text-white">Carregando...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-[#151515] flex flex-col lg:flex-row">
      <div className="hidden lg:block lg:w-3/5">
        <Apresentation />
      </div>
      <div className="flex flex-col items-center justify-center w-full lg:w-2/5 p-4">
        {renderPaymentContent()}
        <Button
          text="Voltar"
          color="bg-[#A644CB]"
          hoverColor="bg-[#8E38A6]"
          onClick={() => router.back()}
        />
      </div>
    </div>
  );
};

export default PaymentPage;
