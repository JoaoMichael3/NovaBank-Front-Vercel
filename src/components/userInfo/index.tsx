"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCopy } from "react-icons/fi";
import Image from "next/image";
import loadingSpinner from "@/assets/images/loading.svg";
import ToastNotifications from "@/components/toast/page";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  mobilePhone: string | null;
  address: string;
  addressNumber: string;
  province: string;
  postalCode: string;
  cpfCnpj: string;
  birthDate: string;
  personType: string;
  state: string;
  country: string;
  incomeValue: number;
  accountNumber?: {
    agency: string;
    account: string;
    accountDigit: string;
  };
  pixKeys?: Array<{ id: string; key: string; type: string }>; 
}

const UseInfo: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userId = localStorage.getItem("selectedSubaccountId");
        if (!userId) {
          throw new Error("ID da subconta não encontrado no localStorage.");
        }

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token não encontrado no localStorage.");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CONSULTID_URL}${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erro ao buscar dados da subconta: ${response.status}`);
        }

        const data = await response.json();
        setUserInfo(data);
      } catch (err: any) {
        console.error("❌ Erro ao buscar informações da subconta:", err.message);
        setError(err.message || "Erro desconhecido.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  if (loading) {
    return (
      <div className="text-white flex justify-center items-center h-screen">
        <Image
          src={loadingSpinner}
          alt="Carregando..."
          className="w-[300px] h-[300px] animate-spin"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        <p>Erro: {error}</p>
        <button
          onClick={() => router.push("/main")}
          className="mt-4 bg-blue-500 text-white p-2 rounded-md"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <ToastNotifications toasts={[]} removeToast={() => {}} />
      <div className="w-[90%] p-6 text-white rounded-lg space-y-6">
        <h1 className="text-2xl font-bold text-start border-l-4 pl-2 text-[30px] border-solid border-[#A644CB] ml-2 mb-5">
          Informações da Subconta
        </h1>

        <div className="p-4 bg-[#25282E] rounded-lg">
          <h2 className="text-xl font-semibold border-l-4 pl-2 text-[30px] border-solid border-[#A644CB] ml-2 mb-5">
            Dados da Subconta
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "ID da Subconta", value: userInfo?.id },
              { label: "Nome", value: userInfo?.name },
              { label: "Email", value: userInfo?.email },
              { label: "CPF/CNPJ", value: userInfo?.cpfCnpj },
            ].map((item, index) => (
              <div key={index}>
                <span className="block text-neutral-400 pl-5">{item.label}</span>
                <div className="flex items-center gap-2 mt-2 pl-5">
                  <p>{item.value || "N/A"}</p>
                  <FiCopy
                    className="cursor-pointer text-blue-500"
                    onClick={() => handleCopy(item.value || "N/A")}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-[#25282E] rounded-lg">
          <h2 className="text-xl font-semibold mb-4 border-l-4 pl-2 text-[30px] border-solid border-[#A644CB] ml-2">
            Informações Bancárias
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-neutral-400 pl-5">Agência</span>
              <div className="flex items-center gap-2 mt-2 pl-5">
                <p>{userInfo?.accountNumber?.agency || "N/A"}</p>
                <FiCopy
                  className="cursor-pointer text-blue-500"
                  onClick={() =>
                    handleCopy(userInfo?.accountNumber?.agency || "N/A")
                  }
                />
              </div>
            </div>
            <div>
              <span className="block text-neutral-400 pl-5">Conta</span>
              <div className="flex items-center gap-2 mt-2 pl-5">
                <p>
                  {userInfo?.accountNumber
                    ? `${userInfo.accountNumber.account}-${userInfo.accountNumber.accountDigit}`
                    : "N/A"}
                </p>
                <FiCopy
                  className="cursor-pointer text-blue-500"
                  onClick={() =>
                    handleCopy(
                      userInfo?.accountNumber
                        ? `${userInfo.accountNumber.account}-${userInfo.accountNumber.accountDigit}`
                        : "N/A"
                    )
                  }
                />
              </div>
            </div>
            <div>
              <span className="block text-neutral-400 pl-5">Renda Mensal</span>
              <div className="flex items-center gap-2 mt-2 pl-5">
                <p>
                  {userInfo?.incomeValue
                    ? userInfo.incomeValue.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : "N/A"}
                </p>
                <FiCopy
                  className="cursor-pointer text-blue-500"
                  onClick={() =>
                    handleCopy(
                      userInfo?.incomeValue
                        ? userInfo.incomeValue.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "N/A"
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#25282E] rounded-lg">
          <h2 className="text-xl font-semibold mb-4 border-l-4 pl-2 text-[30px] border-solid border-[#A644CB] ml-2">
            Chaves PIX
          </h2>
          {userInfo?.pixKeys && userInfo.pixKeys.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {userInfo.pixKeys.map((pixKey) => (
                <div key={pixKey.id}>
                  <span className="block text-neutral-400 pl-5">{pixKey.type}</span>
                  <div className="flex items-center gap-2 mt-2 pl-5">
                    <p>{pixKey.key}</p>
                    <FiCopy
                      className="cursor-pointer text-blue-500"
                      onClick={() => handleCopy(pixKey.key)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400 pl-5">Nenhuma chave Pix cadastrada.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UseInfo;
