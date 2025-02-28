"use client";

import React, { useState } from "react";
import Image from "next/image";
import iconeTrash from "@/assets/icons/trash.svg";

interface Notification {
  data: string;
  email: string;
  status: string;
}

const NotificationSection: React.FC = () => {
  const [inputType, setInputType] = useState<string>("text");
  const [inputValue, setInputValue] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([
    { data: "29/08/2024", email: "example1@example.com", status: "Enviado" },
    { data: "29/08/2024", email: "example2@example.com", status: "Pendente" },
    { data: "29/08/2024", email: "example3@example.com", status: "Erro" },
  ]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === "whatsapp") {
      setInputType("text");
    } else {
      setInputType("text");
    }
  };

  const handleSubmit = () => {
    if (!inputValue) return;

    const newNotification: Notification = {
      data: new Date().toLocaleString(),
      email: inputValue,
      status: "Pendente",
    };
    setNotifications((prev) => [...prev, newNotification]);
    setInputValue(""); 
  };

  const handleDelete = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Enviado":
        return "text-green-500";
      case "Pendente":
        return "text-yellow-500";
      case "Erro":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <section className="border border-solid border-gray-500 m-5 p-5">
      <p className="font-roboto font-bold text-[#ddd] border-l-8 h-8 lg:text-[26px] flex pl-3 items-center border-solid border-[#9D54BD] justify-start">
        Notificações
      </p>

      {/* Contêiner Flex para alinhar o Select e o Input */}
      <div className="flex items-center gap-4 mb-4 mt-12">
        <select
          onChange={handleSelectChange}
          className="p-2 bg-[#3A3A3A] rounded-[6px] text-[#ddd] outline-none focus:ring-0"
        >
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
        </select>

        <input
          type={inputType}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={inputType === "text" ? "Insira o WhatsApp" : "Insira o Email"}
          className="w-full p-2 rounded-[6px] text-[#ddd] outline-none focus:ring-0 bg-[#3A3A3A]"
        />
      </div>

      {/* Botão para adicionar a notificação */}
      <button
        onClick={handleSubmit}
        className="py-3 px-4 text-[#ddd] text-[14px] flex w-full items-center justify-center gap-x-3 rounded transition-all duration-300 bg-[#9D54BD] hover:bg-fuchsia-700 mb-4"
      >
        Enviar
      </button>

      {/* Contêiner para a tabela com overflow-x no mobile */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="text-start mb-5 border-b-2 border-gray-50 border-solid">
            <tr className="text-start">
              <th className="text-start text-[#9D54BD] pb-5 px-4">Data de Envio</th>
              <th className="text-start text-[#9D54BD] pb-5 px-4">Email/WhatsApp</th>
              <th className="text-start text-[#9D54BD] pb-5 px-4">Status</th>
              <th className="text-start text-[#9D54BD] pb-5 px-4">Ações</th>
            </tr>
          </thead>
          <tbody className="pb-48">
            {notifications.map((notification, index) => (
              <tr key={index}>
                <td className="text-[#ddd] border border-gray-300 p-2 px-4">
                  {notification.data}
                </td>
                <td className="text-[#ddd] border border-gray-300 p-2 px-4">
                  {notification.email}
                </td>
                <td className={`border border-gray-300 p-2 px-4 ${getStatusClass(notification.status)}`}>
                  {notification.status}
                </td>
                <td className="text-[#ddd] border border-gray-300 p-2 px-4">
                  <button onClick={() => handleDelete(index)} className="text-[#ddd] p-1">
                    <Image src={iconeTrash} alt="Excluir" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default NotificationSection;
