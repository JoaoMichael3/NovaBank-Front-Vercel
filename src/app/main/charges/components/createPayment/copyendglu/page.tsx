"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Button from "@/components/button";
import { isValidCPF, isValidCNPJ } from "@/utils/validations";
// Função para verificar se uma string é um UUID (EVP)
const isUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};
const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, "");
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};
const formatCNPJ = (cnpj: string): string => {
  const cleaned = cnpj.replace(/\D/g, "");
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};
// Tipos dos dados de transferência.
export interface TransferData {
  value: number;
  pixAddressKey: string; // Para exibição (formatada)
  pixAddressKeyType: "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "EVP";
  scheduleDate: string | null;
  description: string;
  receiverName: string;
  receiverCity: string;
}
// Etapa 1: Componente para inserir o código Pix.
interface PixFormProps {
  pixCode: string;
  setPixCode: (code: string) => void;
  errorMessage: string;
  onNext: () => void;
}
const PixForm: React.FC<PixFormProps> = ({ pixCode, setPixCode, errorMessage, onNext }) => {
  return (
    <>
      <div className="mt-16 flex items-center">
        <span className="lg:h-10 h-8 text-transparent flex items-center bg-[#A644CB]">|</span>
        <p className="text-white lg:text-[1.5rem] text-[1.2rem] flex justify-center mt-2 ml-2">
          Pagamento via Pix Copia e Cola
        </p>
      </div>
      <span className="text-gray-500 text-[12px] ml-3 mt-2">
        Insira o código do Pix no campo abaixo para realizar o pagamento.
      </span>
      <input
        type="text"
        name="pixCode"
        placeholder="Cole aqui o código Pix Copia e Cola"
        value={pixCode}
        onChange={(e) => setPixCode(e.target.value)}
        className="w-[40rem] text-[12px] py-2 pl-2 ml-3 mt-4 rounded-md bg-slate-600 text-[#dddd]"
      />
      {errorMessage && (
        <p className="ml-3 mt-2 text-red-500 text-[12px] truncate">{errorMessage}</p>
      )}
      <div className="flex gap-6 ml-3 mt-4">
        <Button text="Cancelar" color="bg-[#A644CB]" hoverColor="bg-[#8E38A6]" onClick={() => {}} />
        <Button text="Avançar" color="bg-[#A644CB]" hoverColor="bg-[#8E38A6]" onClick={onNext} disabled={!pixCode.trim()} />
      </div>
    </>
  );
};
// Etapa 2: Componente para inserir detalhes adicionais e exibir o resumo.
interface PaymentDetailsFormProps {
  initialData: TransferData;
  onSubmit: (data: TransferData) => void;
  onBack: () => void;
  loading: boolean;
}
const PaymentDetailsForm: React.FC<PaymentDetailsFormProps> = ({ initialData, onSubmit, onBack, loading }) => {
  const [details, setDetails] = useState<TransferData>(initialData);
  const [dateError, setDateError] = useState<string>("");
  const getTomorrowDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    if (new Date(selected) < new Date(getTomorrowDate())) {
      setDateError("A data deve ser no futuro.");
    } else {
      setDateError("");
      setDetails((prev) => ({ ...prev, scheduleDate: selected }));
    }
  };
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDetails((prev) => ({ ...prev, description: e.target.value }));
  };
  return (
    <>
      <div className="bg-gray-700 w-full p-3 rounded-md mb-4">
        <p className="text-white font-semibold">Resumo do Pagamento</p>
        <p className="text-white">Empresa: {details.receiverName}</p>
        <p className="text-white">Valor: R$ {details.value.toFixed(2)}</p>
        {details.pixAddressKeyType === "CNPJ" ? (
          <p className="text-white">
            CNPJ: {details.pixAddressKey.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")}
          </p>
        ) : details.pixAddressKeyType === "CPF" ? (
          <p className="text-white">
            CPF: {details.pixAddressKey.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
          </p>
        ) : (
          <p className="text-white">Chave: {details.pixAddressKey}</p>
        )}
      </div>
      <div className="mt-10 flex flex-col items-start bg-gray-800 p-4 rounded-lg">
        <div className="w-full mb-4">
          <label className="text-white block text-sm mb-1">Data do Pagamento (YYYY-MM-DD):</label>
          <input
            type="date"
            value={details.scheduleDate || ""}
            min={getTomorrowDate()}
            onChange={handleDateChange}
            className="w-full p-2 rounded-md bg-slate-600 text-white"
          />
          {dateError && <p className="text-red-500 text-xs mt-1 truncate">{dateError}</p>}
        </div>
        <div className="w-full mb-4">
          <label className="text-white block text-sm mb-1">Descrição (opcional):</label>
          <textarea
            value={details.description}
            onChange={handleDescriptionChange}
            placeholder="Insira uma descrição opcional para o pagamento"
            className="w-full p-2 rounded-md bg-slate-600 text-white"
            rows={3}
          />
        </div>
      </div>
      <div className="flex gap-6 ml-3 mt-6">
        <Button text="Voltar" color="bg-gray-600" hoverColor="bg-gray-700" onClick={onBack} />
        <Button text="Pagar" color="bg-green-500" hoverColor="bg-green-700" onClick={() => onSubmit(details)} disabled={loading || dateError !== ""} />
      </div>
    </>
  );
};
// Função para extrair informações do código Pix (formato EMV)
const extractPixInfo = (code: string): TransferData | null => {
  // Extrai o valor do campo 54 (opcional)
  const valueMatch = code.match(/54(\d{2})(\d+\.\d{2})/);
  const value = valueMatch ? parseFloat(valueMatch[2]) : 0;
  // Extrai a chave Pix do campo "pix01": "pix01" + 2 dígitos de comprimento + a chave
  const pixMatch = code.match(/pix01(\d{2})(.{1,})/i);
  if (!pixMatch) return null;
  const keyLength = parseInt(pixMatch[1], 10);
  const rawKeyCandidate = pixMatch[2].substring(0, keyLength).trim();
  // Extrai o nome do recebedor do campo 59
  const nameMatch = code.match(/59(\d{2})([A-Za-z\s]+)(?=\d{4})/);
  if (!nameMatch) return null;
  const receiverName = nameMatch[2].trim();
  // Extrai a cidade do recebedor do campo 60 (opcional)
  const cityMatch = code.match(/60(\d{2})([A-Za-z\s]+)/);
  const receiverCity = cityMatch ? cityMatch[2].trim() : "BRASILIA";
  let keyType: "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "EVP" = "EVP";
  if (rawKeyCandidate && isValidCPF(rawKeyCandidate)) {
    keyType = "CPF";
  } else if (rawKeyCandidate && isValidCNPJ(rawKeyCandidate)) {
    keyType = "CNPJ";
  } else if (/^[0-9a-f]{8}-.*-[0-9a-f]{12}$/i.test(rawKeyCandidate) && isUUID(rawKeyCandidate)) {
    keyType = "EVP";
  } else {
    const digits = rawKeyCandidate.replace(/\D/g, "");
    if (digits.length === 14) {
      keyType = "CNPJ";
    } else if (/^\+55\d{11}$/.test(rawKeyCandidate)) {
      keyType = "PHONE";
    } else if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(rawKeyCandidate)) {
      keyType = "EMAIL";
    }
  }
  let displayKey = rawKeyCandidate;
  if (keyType === "CPF") {
    displayKey = formatCPF(rawKeyCandidate);
  } else if (keyType === "CNPJ") {
    displayKey = formatCNPJ(rawKeyCandidate);
  }
  return {
    value,
    pixAddressKey: displayKey,
    pixAddressKeyType: keyType,
    scheduleDate: new Date().toISOString().split("T")[0],
    description: `Pagamento via Pix para ${receiverName}`,
    receiverName,
    receiverCity,
  };
};
// Componente principal (Página) – removemos as props, pois páginas no Next.js não devem receber props
const CopyAndPaste: React.FC = () => {
  const [pixCode, setPixCode] = useState<string>("");
  const [extractedData, setExtractedData] = useState<TransferData | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [step, setStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [paymentError, setPaymentError] = useState<string>("");
  const [paymentSuccess, setPaymentSuccess] = useState<string>("");
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);
  const handleAvancar = () => {
    console.log("Código Pix recebido:", pixCode);
    const extracted = extractPixInfo(pixCode);
    console.log("Dados extraídos:", extracted);
    if (!extracted) {
      setErrorMessage("Código Pix inválido. Insira um código válido.");
      return;
    }
    setErrorMessage("");
    setExtractedData(extracted);
    setStep(2);
  };
  const handleSubmitDetails = async (finalDetails: TransferData) => {
    if (!token || !finalDetails) {
      console.error("Token ou dados da transferência não encontrados.");
      return;
    }
    setLoading(true);
    setPaymentError("");
    setPaymentSuccess("");
    try {
      const payload = {
        ...finalDetails,
        pixAddressKey:
          finalDetails.pixAddressKeyType === "EVP"
            ? finalDetails.pixAddressKey
            : finalDetails.pixAddressKey.replace(/\D/g, ""),
      };
      const response = await axios.post(
        process.env.NEXT_PUBLIC_PAYOUT_TRANSFERS_URL || " ",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (![200, 201].includes(response.status)) {
        throw new Error("Erro ao processar pagamento.");
      }
      setPaymentSuccess("Pagamento realizado com sucesso!");
      setTimeout(() => {
        
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error);
      setPaymentError("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col w-full h-full p-6 bg-[#1E1E2F]">
      {step === 1 && (
        <PixForm
          pixCode={pixCode}
          setPixCode={setPixCode}
          errorMessage={errorMessage}
          onNext={handleAvancar}
        />
      )}
      {step === 2 && extractedData && (
        <PaymentDetailsForm
          initialData={extractedData}
          onSubmit={handleSubmitDetails}
          onBack={() => setStep(1)}
          loading={loading}
        />
      )}
      {loading && <p className="mt-4 text-white">Processando pagamento...</p>}
      {paymentError && (
        <span className="block text-red-500 mt-2 truncate">{paymentError}</span>
      )}
      {paymentSuccess && (
        <span className="block text-green-500 mt-2 truncate">{paymentSuccess}</span>
      )}
    </div>
  );
};
export default CopyAndPaste;
