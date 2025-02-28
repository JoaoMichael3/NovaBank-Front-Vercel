"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import CustomChart from "@/components/chart";
import TierList from "@/components/tierList";
import SubaccountTable from "@/components/subaccountTable/page";
import Image from "next/image";
import loadingSpinner from "@/assets/images/loading.svg";

interface AdminResponse {
  data: {
    isAdmin: boolean;
  };
}

const MainPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const router = useRouter();

  const columns = [
    { key: "name", label: "Nome" },
    { key: "email", label: "Email" },
    { key: "cpfCnpj", label: "CNPJ/CPF" },
    { key: "phone", label: "Telefone" },
    { key: "address", label: "Endereço" },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        setLoading(true);

        const adminRequest = axios.get<AdminResponse>(
          process.env.NEXT_PUBLIC_PERFIL_URL || "",
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );

        const adminResponse = await adminRequest;
        const userIsAdmin = adminResponse.data.data.isAdmin;
        setIsAdmin(userIsAdmin);

        if (userIsAdmin) {
          await axios.get(process.env.NEXT_PUBLIC_LIST_URL || "", {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          });
        }

        setDataLoaded(true);
      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Image
          src={loadingSpinner}
          alt="Carregando..."
          width={150}
          height={150}
          className="animate-spin"
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex flex-col w-full h-full p-5">
        <div className="flex items-center justify-between w-full">
          <CustomChart />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full h-full p-5">
      <div className="flex items-center justify-between w-full">
        <CustomChart />
      </div>

      <div className="grid grid-cols-1 gap-4 w-full mt-5">
        <div className="bg-[#181B21] rounded-lg p-3">
          <SubaccountTable
            title="Lista de Subcontas"
            fetchEndpoint={process.env.NEXT_PUBLIC_LIST_URL || ""}
            deleteEndpoint={process.env.NEXT_PUBLIC_DELETE_ENDPOINT || ""}
            columns={columns}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full mt-5">
      {/* <div className="w-full mt-5"> */}
        <div className="bg-[#181B21] rounded-lg p-4">
          <TierList title="RANKING DE EMPRESAS" highlight="MAIOR VOLUME DE VENDAS" />
        </div>
        <div className="bg-[#181B21] rounded-lg p-4">
          <TierList title="RANKING DE EMPRESAS" highlight="MAIOR VOLUME DE VENDAS" />
        </div>
      </div>
    </main>
  );
};

export default MainPage;
