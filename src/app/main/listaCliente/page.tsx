"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ToastNotifications from "@/components/toast/page";
import { useRouter } from "next/navigation";
import downloadIcon from "@/assets/icons/download.svg";
import editIcon from "@/assets/icons/edit.svg";
import trashIcon from "@/assets/icons/trash.svg";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  personType: string;
}

const ClientListTable: React.FC = () => {
  const [data, setData] = useState<Client[]>([]);
  const [filteredData, setFilteredData] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const router = useRouter();

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.floor(Math.random() * 10000);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  }, []);
  
  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Envolvendo fetchData em useCallback para garantir que seja referencialmente estável
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      const res = await fetch("/api/customer", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) throw new Error("Erro ao buscar dados");

      const result = await res.json();
      const clients: Client[] = Array.isArray(result) ? result : result.data || [];
      setData(clients);
      setFilteredData(clients);
      addToast("Dados carregados com sucesso", "success");
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      addToast("Erro ao buscar dados", "error");
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const filtered = data.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      const res = await fetch(`${process.env.NEXT_PUBLIC_DELETE_CUSTOMER_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        addToast(`Erro ao excluir cliente: ${res.status}`, "error");
        return;
      }

      setData((prevData) => prevData.filter((client) => client.id !== id));
      setFilteredData((prevData) => prevData.filter((client) => client.id !== id));
      addToast("Cliente excluído com sucesso", "success");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      addToast("Erro ao excluir cliente", "error");
    }
  };

  const handleUpdate = (id: string) => {
    router.push(`/main/atualizarCustomer/?id=${id}`);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, "clientes.xlsx");
    addToast("Tabela exportada com sucesso", "success");
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-[#181B21] text-white rounded-lg w-full max-w-5xl p-6 font-roboto mx-auto">
        <ToastNotifications toasts={toasts} removeToast={removeToast} />

        <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-4">
          <h1 className="border-l-4 pl-2 text-[30px] border-solid border-[#A644CB]">
            Lista de Clientes
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <button onClick={handleDownload} className="bg-[#A644CB] p-2 w-44 h-8 rounded-md flex items-center justify-center">
              <Image src={downloadIcon} alt="download" className="mr-2 w-5 h-5" />
              Exportar tabela
            </button>
            <button onClick={handleRefresh} className="bg-[#A644CB] p-2 w-44 h-8 rounded-md flex items-center justify-center">
              Atualizar
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Buscar por Nome ou Email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full lg:w-[20rem] h-8 text-[12px] bg-[#3A3A3A] text-[#ddd] rounded-md px-3 mb-4"
        />

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead className="sticky top-0 bg-[#181B21] z-20">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">E-mail</th>
                <th className="px-4 py-3 text-left">Empresa</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((client, index) => (
                <tr key={client.id} className={`border border-gray-200 ${index % 2 === 0 ? "bg-[#25282e]" : "bg-[#1c1f26]"}`}>
                  <td className="py-3 px-4">{client.name}</td>
                  <td className="py-3 px-4">{client.email || "N/A"}</td>
                  <td className="py-3 px-4">{client.company || "N/A"}</td>
                  <td className="py-3 px-4">{client.personType}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => handleUpdate(client.id)}>
                      <Image src={editIcon} alt="Editar" className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(client.id)}>
                      <Image src={trashIcon} alt="Excluir" className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-purple-700 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded ${currentPage === index + 1 ? "bg-purple-700" : "bg-gray-600"}`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-purple-700 rounded disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientListTable;
