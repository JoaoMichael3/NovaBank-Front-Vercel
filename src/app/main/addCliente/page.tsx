"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/button";
import ToastNotifications from "@/components/toast/page";

// Interface para o estado do formulário
interface FormData {
  name: string;
  username: string;
  birthDate: string;
  email: string;
  personType: "CPF" | "CNPJ";
  cpfCnpj: string;
  mobilePhone: string;
  incomeValue: string;
  address: string;
  addressNumber: string;
  province: string;
  postalCode: string;
}

// Função para formatar CPF/CNPJ
const formatCpfCnpj = (value: string, personType: string): string => {
  value = value.replace(/[^\d]/g, "");
  if (personType === "CPF") {
    return value
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  } else if (personType === "CNPJ") {
    return value
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return value;
};

// Função para formatar moeda
const formatCurrency = (value: string): string => {
  const numericValue = value.replace(/[^\d]/g, "");
  const formattedValue = parseFloat(numericValue) / 100;
  return formattedValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

// Função para formatar telefone
const formatPhoneNumber = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

// Função para validar idade
const validateAge = (birthDate: string): boolean => {
  const birth = new Date(birthDate).getTime();
  const today = new Date().getTime();
  const age = (today - birth) / (1000 * 60 * 60 * 24 * 365.25);
  return age >= 18;
};

// Função para validar CPF
const validateCpf = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  // Cálculo do primeiro dígito verificador
  let sum = 0;
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  // Cálculo do segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;

  return remainder === parseInt(cpf.substring(10, 11));
};

// Função para validar CNPJ
const validateCnpj = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/[^\d]/g, "");
  if (cnpj.length !== 14) return false;

  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  let digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length += 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
};

const CreateSubaccount: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    birthDate: "",
    email: "",
    personType: "CPF",
    cpfCnpj: "",
    mobilePhone: "",
    incomeValue: "",
    address: "",
    addressNumber: "",
    province: "",
    postalCode: "",
  });

  const [token, setToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: "success" | "error" }[]
  >([]);

  useEffect(() => {
    const userToken = localStorage.getItem("token");
    setToken(userToken);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "cpfCnpj") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: formatCpfCnpj(value, prevState.personType),
      }));
    } else if (name === "incomeValue") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: formatCurrency(value),
      }));
    } else if (name === "mobilePhone") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: formatPhoneNumber(value),
      }));
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "Nome é obrigatório";
    if (!formData.birthDate) {
      newErrors.birthDate = "Data de nascimento é obrigatória";
    } else if (!validateAge(formData.birthDate)) {
      newErrors.birthDate = "É necessário ter mais de 18 anos.";
    }
    if (!formData.email) newErrors.email = "E-mail é obrigatório";
    if (
      (formData.personType === "CPF" && !validateCpf(formData.cpfCnpj)) ||
      (formData.personType === "CNPJ" && !validateCnpj(formData.cpfCnpj))
    ) {
      newErrors.cpfCnpj = `${formData.personType} inválido`;
    }
    if (!formData.mobilePhone) newErrors.mobilePhone = "Celular é obrigatório";
    if (!formData.incomeValue)
      newErrors.incomeValue = "Renda mensal é obrigatória";
    if (!formData.address) newErrors.address = "Endereço é obrigatório";
    if (!formData.addressNumber) newErrors.addressNumber = "Número é obrigatório";
    if (!formData.province) newErrors.province = "Bairro é obrigatório";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const mappedPersonType = formData.personType === "CPF" ? "FISICA" : "JURIDICA";

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CREATUSER_URL}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...formData,
              personType: mappedPersonType,
              incomeValue:
                parseFloat(formData.incomeValue.replace(/[^\d]/g, "")) / 100,
            }),
          }
        );

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Erro na API: ${errorMessage}`);
        }

        setToasts((prevToasts) => [
          ...prevToasts,
          {
            id: Date.now(),
            message: "Subconta criada com sucesso!",
            type: "success",
          },
        ]);

        setFormData({
          name: "",
          username: "",
          birthDate: "",
          email: "",
          personType: "CPF",
          cpfCnpj: "",
          mobilePhone: "",
          incomeValue: "",
          address: "",
          addressNumber: "",
          province: "",
          postalCode: "",
        });
      } catch (error: any) {
        const message = error.message || "Erro ao criar subconta. Tente novamente.";
        setToasts((prevToasts) => [
          ...prevToasts,
          {
            id: Date.now(),
            message,
            type: "error",
          },
        ]);
      }
    }
  };

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const labels = {
    name: "Nome da Empresa",
    username: "Nome",
    birthDate: "Data de Nascimento",
    email: "E-mail",
    personType: "Tipo de Pessoa",
    cpfCnpj: formData.personType === "CPF" ? "CPF" : "CNPJ",
    mobilePhone: "Celular",
    incomeValue: "Renda Mensal",
    address: "Endereço",
    addressNumber: "Número",
    province: "Bairro",
    postalCode: "CEP",
  };

  const inputClasses =
    "w-full px-3 py-2 rounded-md bg-[#30343A] border focus:outline-none focus:ring-2 focus:ring-[#A644CB] text-white";

  return (
    <div className="flex justify-center items-center min-h-screen w-full p-10">
      <ToastNotifications toasts={toasts} removeToast={removeToast} />
      <div className="w-full bg-[#25282E] z-30 shadow-lg rounded-lg text-white p-10">
        <div className="border-l-4 pl-2 text-[30px] border-solid border-[#A644CB]">
          <h2 className="text-2xl font-semibold border text-white mb-6 border-l-4 border-[#A644CB] ">
            Criar Subconta
          </h2>
        </div>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(formData).map((key) => {
              const value = formData[key as keyof typeof formData];
              return (
                <div key={key}>
                  <label className="block text-neutral-400 capitalize mb-1">
                    {labels[key as keyof typeof labels]}
                  </label>
                  {key === "personType" ? (
                    <select
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className={inputClasses}
                    >
                      <option value="CPF">CPF</option>
                      <option value="CNPJ">CNPJ</option>
                    </select>
                  ) : (
                    <input
                      type={key === "birthDate" ? "date" : "text"}
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className={inputClasses}
                    />
                  )}
                  {errors[key] && (
                    <p className="text-red-500 text-sm">{errors[key]}</p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6">
            <Button
              text="Criar Subconta"
              color="bg-[#A644CB]"
              hoverColor="hover:bg-[#8E38A6]"
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSubaccount;