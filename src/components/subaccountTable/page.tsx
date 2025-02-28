"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import downloadIcon from "@/assets/icons/download.svg";
import editIcon from "@/assets/icons/edit.svg";
import trashIcon from "@/assets/icons/trash.svg";
import ToastNotifications from "@/components/toast/page";
import { useRouter } from "next/navigation";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface SubaccountTableProps {
  title: string;
  fetchEndpoint: string;
  deleteEndpoint: string;
  columns: { key: string; label: string }[];
}

const SubaccountTable: React.FC<SubaccountTableProps> = ({
  title,
  fetchEndpoint,
  deleteEndpoint,
  columns,
}) => {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [filteredData, setFilteredData] = useState<Array<Record<string, any>>>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const router = useRouter();

  const addToast = (message: string, type: ToastType) => {
    const id = Math.floor(Math.random() * 10000);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Função fetchData envolvida em useCallback para manter referência estável
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      const res = await fetch(fetchEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`Erro ao buscar dados: ${res.status}`);

      const result = await res.json();
      const responseData = Array.isArray(result) ? result : result.data || [];
      setData(responseData);
      setFilteredData(responseData);
      addToast("Dados carregados com sucesso", "success");
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      addToast("Erro ao buscar dados", "error");
    }
  }, [fetchEndpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = data.filter((subaccount) => {
        const matchesName = subaccount.name
          ?.toLowerCase()
          .includes(lowerSearch);
        const matchesEmail = subaccount.email
          ?.toLowerCase()
          .includes(lowerSearch);
        return matchesName || matchesEmail;
      });
      setFilteredData(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, data]);

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      const res = await fetch(`${deleteEndpoint}${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorMessage = `Erro ao excluir subconta: ${res.status} ${res.statusText}`;
        console.error(errorMessage);
        addToast(errorMessage, "error");
        return;
      }

      setData((prevData) =>
        prevData.filter((subaccount) => subaccount.id !== id)
      );
      setFilteredData((prevData) =>
        prevData.filter((subaccount) => subaccount.id !== id)
      );
      addToast("Subconta excluída com sucesso", "success");
    } catch (error) {
      const errorMessage = `Erro ao excluir subconta: ${
        error instanceof Error ? error.message : error
      }`;
      console.error(errorMessage);
      addToast(errorMessage, "error");
    }
  };

  const handleViewDetails = (id: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedSubaccountId", id);
      router.push("/main/infoSubAccount");
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subcontas");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, "subcontas.xlsx");
    addToast("Tabela exportada com sucesso", "success");
  };

  const renderPagination = () => {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    return pageNumbers.map((page) => (
      <button
        key={page}
        onClick={() => setCurrentPage(page)}
        className={`px-[10px] py-[10px] ${
          page === currentPage
            ? "bg-[#A644CB] text-white"
            : "bg-gray-600 text-white"
        } rounded-md mx-1`}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="bg-[#181B21] text-white rounded-lg w-full p-6 font-roboto">
      <ToastNotifications toasts={toasts} removeToast={removeToast} />

      <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-4">
        <h1 className="border-l-4 pl-2 text-[30px] border-solid border-[#A644CB]">
          {title}
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center text-[#ddd] text-[12px] font-roboto font-bold bg-[#A644CB] p-2 w-44 h-8 rounded-md"
          >
            <Image src={downloadIcon} alt="download" className="mr-2 w-5 h-5" />
            Exportar tabela
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center text-[#ddd] text-[12px] font-roboto font-bold bg-[#A644CB] p-2 xs:w-44 h-8 rounded-md"
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por Nome ou Email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-[#ddd] w-full lg:w-[20rem] h-8 text-[12px] bg-[#3A3A3A] rounded-md px-3 focus:border-transparent"
        />
      </div>

      <div
        className={`overflow-x-auto px-0 py-0 ${
          filteredData.length > 10 ? "overflow-y-auto h-[25rem]" : "h-[25rem]"
        }`}
      >
        <table className="min-w-full table-auto border-collapse">
          <thead className="sticky top-0 bg-[#181B21] z-20">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-[13px] text-left font-roboto font-semibold py-3 text-[#ddd] bg-[#181B21] border-b-2 border-[#a744cb93] px-6 whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              <th className="text-[13px] font-roboto font-semibold py-3 text-[#ddd] bg-[#181B21] border-b-2 border-[#a744cb93] px-6 whitespace-nowrap">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((client, index) => (
              <tr
                key={client.id}
                className={`border border-gray-200 ${
                  index % 2 === 0 ? "bg-[#25282e]" : "bg-[#1c1f26]"
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="text-xs py-2 whitespace-nowrap text-[#8C8C8D] px-6"
                  >
                    {client[col.key] || "N/A"}
                  </td>
                ))}
                <td className="text-xs py-2 whitespace-nowrap text-[#8C8C8D] px-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(client.id)}
                      className="bg-blue-400 w-8 h-8 flex justify-center items-center rounded-lg"
                    >
                      <Image src={editIcon} alt="Editar" className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center my-4">{renderPagination()}</div>
    </div>
  );
};

export default SubaccountTable;
