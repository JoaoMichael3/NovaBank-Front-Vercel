"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/button";
import ToastNotifications from "@/components/toast/page";

interface ClientFormData {
  id: string;
  name: string;
  email: string;
  personType: "CPF" | "CNPJ";
  cpfCnpj: string;
  mobilePhone: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  province?: string;
  notificationDisabled: boolean;
  additionalEmails: string;
  municipalInscription: string;
  stateInscription: string;
  observations: string;
  groupName: string;
  company: string;
  foreignCustomer: boolean;
}

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

const formatPhoneNumber = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

const validateCpf = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  return remainder === parseInt(cpf.substring(10, 11));
};

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

interface UpdateClientProps {
  initialData: ClientFormData;
}

const UpdateClient: React.FC<UpdateClientProps> = ({ initialData }) => {
  const [formData, setFormData] = useState<ClientFormData>(initialData);
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
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      if (name === "cpfCnpj") {
        setFormData((prev) => ({
          ...prev,
          [name]: formatCpfCnpj(value, prev.personType),
        }));
      } else if (name === "mobilePhone") {
        setFormData((prev) => ({
          ...prev,
          [name]: formatPhoneNumber(value),
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Nome é obrigatório";
    if (!formData.email) newErrors.email = "E-mail é obrigatório";
    if (
      (formData.personType === "CPF" && !validateCpf(formData.cpfCnpj)) ||
      (formData.personType === "CNPJ" && !validateCnpj(formData.cpfCnpj))
    ) {
      newErrors.cpfCnpj = `${formData.personType} inválido`;
    }
    if (!formData.mobilePhone)
      newErrors.mobilePhone = "Celular é obrigatório";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_UPDATE_CLIENT_URL}/${formData.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Erro na API: ${errorMessage}`);
        }

        setToasts((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: "Cliente atualizado com sucesso!",
            type: "success",
          },
        ]);
      } catch (error: any) {
        setToasts((prev) => [
          ...prev,
          {
            id: Date.now(),
            message:
              error.message || "Erro ao atualizar cliente. Tente novamente.",
            type: "error",
          },
        ]);
      }
    }
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const labels: Record<string, string> = {
    name: "Nome",
    email: "E-mail",
    personType: "Tipo de Pessoa",
    cpfCnpj: formData?.personType === "CPF" ? "CPF" : "CNPJ",
    mobilePhone: "Celular",
    postalCode: "CEP",
    address: "Endereço",
    addressNumber: "Número",
    province: "Bairro",
    notificationDisabled: "Desabilitar Notificações",
    additionalEmails: "E-mails Adicionais",
    municipalInscription: "Inscrição Municipal",
    stateInscription: "Inscrição Estadual",
    observations: "Observações",
    groupName: "Nome do Grupo",
    company: "Empresa",
    foreignCustomer: "Cliente Estrangeiro",
  };

  const inputClasses =
    "w-full px-3 py-2 rounded-md bg-[#30343A] border focus:outline-none focus:ring-2 focus:ring-[#A644CB] text-white";

  return (
    <div className="flex justify-center items-center min-h-screen w-full p-10">
      <ToastNotifications toasts={toasts} removeToast={removeToast} />
      <div className="w-full bg-[#25282E] z-30 shadow-lg rounded-lg text-white p-10">
        <div className="border-l-4 pl-2 text-[30px] border-solid border-[#A644CB]">
          <h2 className="text-2xl font-semibold mb-6 border-l-4 border-[#A644CB]">
            Atualizar Cliente
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div>
            <label className="block text-neutral-400 capitalize mb-1">
              {labels.name}
            </label>
            <input
              type="text"
              name="name"
              value={formData?.name}
              onChange={handleInputChange}
              className={inputClasses}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>
          {/* E-mail */}
          <div>
            <label className="block text-neutral-400 capitalize mb-1">
              {labels.email}
            </label>
            <input
              type="email"
              name="email"
              value={formData?.email}
              onChange={handleInputChange}
              className={inputClasses}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
          {/* Tipo de Pessoa */}
          <div>
            <label className="block text-neutral-400 capitalize mb-1">
              {labels.personType}
            </label>
            <select
              name="personType"
              value={formData?.personType}
              onChange={handleInputChange}
              className={inputClasses}
            >
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
            </select>
          </div>
          {/* CPF/CNPJ */}
          <div>
            <label className="block text-neutral-400 capitalize mb-1">
              {labels.cpfCnpj}
            </label>
            <input
              type="text"
              name="cpfCnpj"
              value={formData?.cpfCnpj}
              onChange={handleInputChange}
              className={inputClasses}
            />
            {errors.cpfCnpj && (
              <p className="text-red-500 text-sm">{errors.cpfCnpj}</p>
            )}
          </div>
          {/* Celular */}
          <div>
            <label className="block text-neutral-400 capitalize mb-1">
              {labels.mobilePhone}
            </label>
            <input
              type="text"
              name="mobilePhone"
              value={formData?.mobilePhone}
              onChange={handleInputChange}
              className={inputClasses}
            />
            {errors.mobilePhone && (
              <p className="text-red-500 text-sm">{errors.mobilePhone}</p>
            )}
          </div>
          {/* CEP */}
          <div>
            <label className="block text-neutral-400 capitalize mb-1">
              {labels.postalCode}
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData?.postalCode}
              onChange={handleInputChange}
              className={inputClasses}
            />
          </div>
          {/* Endereço */}
          <div>
            <label className="block text-neutral-400 capitalize mb-1">
              {labels.address}
            </label>
            <input
              type="text"
              name="address"
              value={formData?.address}
              onChange={handleInputChange}
              className={inputClasses}
            />
          </div>
          {/* Número */}
          <div>
            <label className="block text-neutral-400 capitalize mb-1">
              {labels.addressNumber}
            </label>
            <input
              type="text"
              name="addressNumber"
              value={formData?.addressNumber}
              onChange={handleInputChange}
              className={inputClasses}
            />
          </div>
          {/* Bairro */}
          <div>
            <label className="block text-neutral-400 capitalize mb-1">
              {labels.province}
            </label>
            <input
              type="text"
              name="province"
              value={formData?.province}
              onChange={handleInputChange}
              className={inputClasses}
            />
          </div>
          {/* Notificações (checkbox) */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="notificationDisabled"
              checked={formData?.notificationDisabled}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label className="text-neutral-400">
              {labels.notificationDisabled}
            </label>
          </div>
          {/* E-mails adicionais */}
          <div>
            <label className="block text-neutral-400 capitalize mb-1">
              {labels.additionalEmails}
            </label>
            <input
              type="text"
              name="additionalEmails"
              value={formData?.additionalEmails}
              onChange={handleInputChange}
              className={inputClasses}
            />
          </div>
          {/* Inscrição Municipal */}
          <div>
            <label className="block text-neutral-400 capitalize mb-1">
              {labels.municipalInscription}
            </label>
            <input
              type="text"
              name="municipalInscription"
              value={formData?.municipalInscription}
              onChange={handleInputChange}
              className={inputClasses}
            />
          </div>
          {/* Inscrição Estadual */}
          <div>
            <label className="block text-neutral-400 capitalize mb-1">
              {labels.stateInscription}
            </label>
            <input
              type="text"
              name="stateInscription"
              value={formData?.stateInscription}
              onChange={handleInputChange}
              className={inputClasses}
            />
          </div>
          {/* Observações */}
          <div className="md:col-span-2">
            <label className="block text-neutral-400 capitalize mb-1">
              {labels.observations}
            </label>
            <input
              type="text"
              name="observations"
              value={formData?.observations}
              onChange={handleInputChange}
              className={inputClasses}
            />
          </div>
          {/* Nome do Grupo */}
          <div>
            <label className="block text-neutral-400 capitalize mb-1">
              {labels.groupName}
            </label>
            <input
              type="text"
              name="groupName"
              value={formData?.groupName}
              onChange={handleInputChange}
              className={inputClasses}
            />
          </div>
          {/* Empresa */}
          <div>
            <label className="block text-neutral-400 capitalize mb-1">
              {labels.company}
            </label>
            <input
              type="text"
              name="company"
              value={formData?.company}
              onChange={handleInputChange}
              className={inputClasses}
            />
          </div>
          {/* Cliente Estrangeiro (checkbox) */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="foreignCustomer"
              checked={formData?.foreignCustomer}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label className="text-neutral-400">
              {labels.foreignCustomer}
            </label>
          </div>
        </div>
        <div className="mt-6">
          <Button
            text="Atualizar Cliente"
            color="bg-[#A644CB]"
            hoverColor="hover:bg-[#8E38A6]"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default UpdateClient;
