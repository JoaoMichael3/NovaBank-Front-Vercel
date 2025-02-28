"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FiCopy } from "react-icons/fi";
import ToastNotifications from "@/components/toast/page";
import loadingImage from "@/assets/images/loading.svg";

export interface UserInfoProps {
  username: string;
  sobrename?: string;
  bank?: string;
  financialInfo?: {
    accountAgency?: string;
    accountNumber?: string;
    accountDigit?: string;
  };
  pix?: string | null;
}

const InfoBankUser: React.FC = () => {
  const [data, setData] = useState<UserInfoProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); 
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: "success" | "error" | "info" }[]
  >([]);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado");

        const res = await fetch(`${process.env.NEXT_PUBLIC_PERFIL_URL || ""}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Erro ao buscar dados do usuário");
        }

        const userData = await res.json();
        setData(userData.data);
      } catch (error: any) {
        console.error("Erro ao buscar dados do usuário:", error.message);
        setError(error.message || "Erro ao carregar dados do usuário");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setToasts((prevToasts) => [
      ...prevToasts,
      { id: Date.now(), message: `"${text}" copiado com sucesso!`, type: "info" },
    ]);
  };

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  
  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <Image
          src={loadingImage}
          alt="Carregando..."
          width={600}
          height={150}
          className="animate-spin"
        />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-500 mt-4 flex justify-center font-robotoMono text-sm font-semibold">
        {error}
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-gray-500 text-center font-robotoMono text-sm font-semibold">
        Nenhuma informação disponível.
      </p>
    );
  }

  const Agencia = data.financialInfo?.accountAgency || "N/A";
  const Conta = data.financialInfo?.accountNumber || "N/A";
  const Digito = data.financialInfo?.accountDigit || "N/A";
  const pix = data.pix || " ";

  return (
    <>
      <ToastNotifications toasts={toasts} removeToast={removeToast} />
      <article className="border-[#A644CB] border-solid border-t-2 border-b-2 flex flex-col gap-3 py-5 px-3 mt-5">
        <h2 className="font-robotoMono font-semibold text-[#A644CB]">
          Olá, {data.username} {data.sobrename || ""}!
        </h2>
        <ul className="flex flex-col gap-y-3">
          <div className="flex flex-col gap-y-2">
            <li className="font-robotoMono text-[#757575] text-[12px] break-keep flex items-center gap-2">
              <span className="text-[13px] font-roboto font-semibold">Agência:</span>
              <span className="text-[#A644CB]">{Agencia}</span>
              <FiCopy
                className="cursor-pointer text-blue-500"
                onClick={() => handleCopy(Agencia)}
              />
            </li>
          </div>
          <div className="flex flex-col gap-y-2">
            <li className="font-robotoMono text-[#757575] text-[12px] break-keep flex items-center gap-2">
              <span className="text-[13px] font-roboto font-semibold">Conta:</span>
              <span className="text-[#A644CB]">
                {Conta}-{Digito}
              </span>
              <FiCopy
                className="cursor-pointer text-blue-500"
                onClick={() => handleCopy(`${Conta}-${Digito}`)}
              />
            </li>
            {/* <li className="font-robotoMono text-[#757575] text-[12px] break-keep flex items-center gap-2">
              <span className="text-[13px] font-roboto font-semibold">PIX:</span>
              {data.pix ? || "" (
                <>
                  <span className="text-[#A644CB]">{data.pix}</span>
                  <FiCopy
                    className="cursor-pointer text-blue-500"
                    onClick={() => handleCopy(data.pix!)}
                  />
                </>
              ) : (
                ''
              )}
            </li> */}
          </div>
        </ul>
      </article>
    </>
  );
};

export default InfoBankUser;
