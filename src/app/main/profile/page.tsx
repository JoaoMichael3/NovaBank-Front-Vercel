"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import loadingSpinner from "@/assets/images/loading.svg";

interface UserData {
  username: string;
  name: string;
  email: string;
  cpfCnpj: string;
  birthDate: string;
  mobilePhone: string;
  address: string;
  addressNumber: string;
  complement?: string;
  province: string;
  postalCode: string;
  accountAgency: string;
  accountNumber: string;
  accountDigit: string;
}

const PerfilUser: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token de autenticação ausente. Por favor, faça login.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_PERFIL_URL}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Erro na resposta do servidor");

        const result = await response.json();
        const data = result.data;

        setUserData({
          username: data.username || "",
          name: data.name || "",
          email: data.email || "",
          cpfCnpj: formatCpfCnpj(data.cpfCnpj || ""),
          birthDate: formatDate(data.birthDate || ""),
          mobilePhone: formatPhone(data.contactInfo?.mobilePhone || ""),
          address: data.contactInfo?.address || "",
          addressNumber: data.contactInfo?.addressNumber || "",
          complement: data.contactInfo?.complement || "",
          province: data.contactInfo?.province || "",
          postalCode: formatCep(data.contactInfo?.postalCode || ""),
          accountAgency: data.financialInfo?.accountAgency || "",
          accountNumber: data.financialInfo?.accountNumber || "",
          accountDigit: data.financialInfo?.accountDigit || "",
        });

        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        setError("Erro ao carregar dados do usuário. Verifique o token.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    switch (name) {
      case "cpfCnpj":
        formattedValue = formatCpfCnpj(value);
        break;
      case "birthDate":
        formattedValue = formatDate(value);
        break;
      case "mobilePhone":
        formattedValue = formatPhone(value);
        break;
      case "postalCode":
        formattedValue = formatCep(value);
        break;
      // Validação para aceitar apenas números nos campos específicos
      case "accountAgency":
      case "accountNumber":
      case "accountDigit":
        formattedValue = value.replace(/\D/g, "");
        break;
    }

    setUserData((prevData) =>
      prevData ? { ...prevData, [name]: formattedValue } : null
    );
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token de autenticação ausente. Por favor, faça login.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(
       `${process.env.NEXT_PUBLIC_MY_ACCOUNT_INFO}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) throw new Error("Erro ao salvar os dados");

      setSuccessMessage("Dados atualizados com sucesso!");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Erro ao salvar dados do usuário:", error);
      setError("Erro ao salvar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Funções de formatação
  const formatCpfCnpj = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return cleaned.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  };

  const formatDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
  };

  const formatPhone = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const formatCep = (value: string): string => {
    return value.replace(/(\d{5})(\d{3})/, "$1-$2");
  };

  if (loading) {
    return (
      <div className="flex justify-center">
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
      <div className="text-red-500 flex justify-center font-robotoMono font-bold text-center mt-[20%]">
        {error}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-10">
      <div className="w-full max-w-7xl bg-white/20 backdrop-blur-sm p-8 rounded-xl shadow-lg">
        <div className="flex items-center mb-12">
          <span className="lg:h-10 h-8 text-transparent flex items-center bg-[#A644CB]">
            |
          </span>
          <p className="text-white lg:text-[1.5rem] text-[1.2rem] flex justify-center mt-2 ml-2">
            Perfil do Usuário
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userData && (
            <>
              <div>
                <p className="text-white mb-2 font-roboto">Nome</p>
                <input
                  disabled
                  type="text"
                  name="username"
                  value={userData.username}
                  onChange={handleChange}
                  className="w-full border border-[#A644CB] px-3 py-2 rounded bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <p className="text-white mb-2 font-roboto">Nome da Empresa</p>
                <input
                  disabled
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  className="w-full border border-[#A644CB] px-3 py-2 rounded bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <p className="text-white mb-2 font-roboto">E-mail</p>
                <input
                  disabled
                  type="text"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="w-full border border-[#A644CB] px-3 py-2 rounded bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <p className="text-white mb-2 font-roboto">
                  {userData.cpfCnpj.length === 18 ? "CNPJ" : "CPF"}
                </p>
                <input
                  disabled
                  type="text"
                  name="cpfCnpj"
                  value={userData.cpfCnpj}
                  onChange={handleChange}
                  className="w-full border border-[#A644CB] px-3 py-2 rounded bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <p className="text-white mb-2 font-roboto">
                  Data de Nascimento
                </p>
                <input
                  disabled
                  type="text"
                  name="birthDate"
                  value={userData.birthDate}
                  onChange={handleChange}
                  className="w-full border border-[#A644CB] px-3 py-2 rounded bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <p className="text-white mb-2 font-roboto">
                  Número de Telefone
                </p>
                <input
                  disabled
                  type="text"
                  name="mobilePhone"
                  value={userData.mobilePhone}
                  onChange={handleChange}
                  className="w-full border border-[#A644CB] px-3 py-2 rounded bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <p className="text-white mb-2 font-roboto">Endereço</p>
                <input
                  disabled
                  type="text"
                  name="address"
                  value={userData.address}
                  onChange={handleChange}
                  className="w-full border border-[#A644CB] px-3 py-2 rounded bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <p className="text-white mb-2 font-roboto">Número</p>
                <input
                  disabled
                  type="text"
                  name="addressNumber"
                  value={userData.addressNumber}
                  onChange={handleChange}
                  className="w-full border border-[#A644CB] px-3 py-2 rounded bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <p className="text-white mb-2 font-roboto">Complemento</p>
                <input
                  disabled
                  type="text"
                  name="complement"
                  value={userData.complement}
                  onChange={handleChange}
                  className="w-full border border-[#A644CB] px-3 py-2 rounded bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <p className="text-white mb-2 font-roboto">CEP</p>
                <input
                  disabled
                  type="text"
                  name="postalCode"
                  value={userData.postalCode}
                  onChange={handleChange}
                  className="w-full border border-[#A644CB] px-3 py-2 rounded bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <p className="text-white mb-2 font-roboto">Agência</p>
                <input
                  disabled
                  type="text"
                  name="accountAgency"
                  value={userData.accountAgency}
                  onChange={handleChange}
                  className="w-full border border-[#A644CB] px-3 py-2 rounded bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <p className="text-white mb-2 font-roboto">Número da Conta</p>
                <input
                  disabled
                  type="text"
                  name="accountNumber"
                  value={userData.accountNumber}
                  onChange={handleChange}
                  className="w-full border border-[#A644CB] px-3 py-2 rounded bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <p className="text-white mb-2 font-roboto">Conta</p>
                <input
                  disabled
                  type="text"
                  name="accountDigit"
                  value={userData.accountDigit}
                  onChange={handleChange}
                  className="w-full border border-[#A644CB] px-3 py-2 rounded bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <p className="text-white mb-2 font-roboto">Estado</p>
                <input
                  disabled
                  type="text"
                  name="province"
                  value={userData.province}
                  onChange={handleChange}
                  className="w-full border border-[#A644CB] px-3 py-2 rounded bg-gray-100 text-gray-700"
                />
              </div>
            </>
          )}
        </div>

        {successMessage && (
          <p className="text-green-500 mt-4">{successMessage}</p>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        {/* <button onClick={handleSubmit} className="bg-[#A644CB] text-white px-4 py-2 rounded mt-6 w-full">
          Salvar
        </button> */}
      </div>
    </div>
  );
};

export default PerfilUser;
