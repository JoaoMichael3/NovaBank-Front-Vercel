"use client";

import React, { useEffect, useState } from "react";
import UpdateClient from "./components/UpdateClient";
import { ClientFormData } from "./types";

const AtualizarClientePage = () => {
  const [initialData, setInitialData] = useState<ClientFormData | null>(null);

  useEffect(() => {
    // Exemplo: buscar os dados do cliente via API ou de outra fonte
    // Substitua essa parte pela sua lógica de obtenção dos dados
    const fetchData = async () => {
      // Simulação de dados iniciais
      const data: ClientFormData = {
        id: "",
        name: "",
        email: "joaomichaelfd@gmail.com",
        personType: "CPF",
        cpfCnpj: "18350611766",
        mobilePhone: "21969898442",
        postalCode: "21675560",
        address: "Rua Martins de Nantes",
        addressNumber: "82",
        province: "RJ",
        notificationDisabled: false,
        additionalEmails: "",
        municipalInscription: "",
        stateInscription: "",
        observations: "",
        groupName: "",
        company: "",
        foreignCustomer: false,
      };
      setInitialData(data);
    };
    fetchData();
  }, []);

  if (!initialData) {
    return <div>Carregando...</div>;
  }

  return <UpdateClient initialData={initialData} />;
};

export default AtualizarClientePage;
