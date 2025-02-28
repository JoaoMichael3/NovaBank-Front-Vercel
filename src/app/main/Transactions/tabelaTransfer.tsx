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
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

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

interface TransactionTableTransferProps {
  title: string;
  fetchEndpoint: string;
  deleteEndpoint: string;
  columns: { key: string; label: string }[];
  fetchCustomerName: (customerId: string) => Promise<string>;
}

const formatCurrency = (value: any) => {
  const numericValue = parseFloat(value);
  return numericValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};

const formatDate = (dateString: any) => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
};

const translateStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    PENDING: "Aguardando pagamento",
    DONE: "Confirmada",
    CANCELLED: "Cancelada",
  };
  return statusMap[status] || status;
};

const TransactionTableTransfer: React.FC<TransactionTableTransferProps> = ({
  title,
  fetchEndpoint,
  deleteEndpoint,
  columns,
  fetchCustomerName,
}) => {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [filteredData, setFilteredData] = useState<Array<Record<string, any>>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const itemsPerPage = 15;
  const router = useRouter();

  const addToast = (message: string, type: ToastType) => {
    const id = Math.floor(Math.random() * 10000);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Encapsula fetchData com useCallback para que sua referência seja estável
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
      const fetchedData = Array.isArray(result.data?.data)
        ? result.data.data
        : [];

      const updatedData = await Promise.all(
        fetchedData.map(async (transfer: Record<string, any>) => {
          const customerName = await fetchCustomerName(transfer.customer);
          return {
            ...transfer,
            customerName,
            dateCreated: formatDate(transfer.dateCreated),
            confirmedDate: formatDate(transfer.dueDate),
            value: formatCurrency(transfer.value),
            status: translateStatus(transfer.status),
          };
        })
      );
      setData(updatedData);
      setFilteredData(updatedData);
      addToast("Dados carregados com sucesso", "success");
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      addToast("Erro ao buscar dados", "error");
    }
  }, [fetchEndpoint, fetchCustomerName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = data.filter((transfer) => {
        const idMatch = transfer.id.toString().includes(lowerSearch);
        const nameMatch =
          transfer.customerName &&
          transfer.customerName.toLowerCase().includes(lowerSearch);
        return idMatch || nameMatch;
      });
      setFilteredData(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, data]);

  // Se certifica de que as colunas incluam "customerName"
  const headerColumns = [...columns];
  if (!headerColumns.some((col) => col.key === "customerName")) {
    headerColumns.push({ key: "customerName", label: "Nome do Cliente" });
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

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
    router.push(`/main/updateClient/?id=${id}`);
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

  return (
    <div className="bg-[#181B21] text-white rounded-lg w-full p-6 font-roboto">
      <ToastNotifications toasts={toasts} removeToast={removeToast} />

      {/* Título e filtro */}
      <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-4">
        <h1 className="border-l-4 pl-2 text-[30px] border-solid border-[#A644CB]">
          {title}
        </h1>
        <div className="mt-4 sm:mt-0">
          <input
            type="text"
            placeholder="Buscar por ID ou nome do cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 rounded-md text-black w-full sm:w-64"
          />
        </div>
      </div>

      {/* Container com overflow horizontal */}
      <div className="overflow-x-auto w-full">
        <table className="table-auto w-full border-collapse">
          <thead className="sticky top-0 bg-[#181B21] z-20">
            <tr>
              {headerColumns.map((col) => (
                <th
                  key={col.key}
                  className="text-[13px] text-left font-semibold py-3 text-[#ddd] border-b-2 border-[#a744cb93] px-4 whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              <th className="text-[13px] font-semibold py-3 text-[#ddd] border-b-2 border-[#a744cb93] px-4 whitespace-nowrap">
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
                {headerColumns.map((col) => (
                  <td
                    key={col.key}
                    className="text-xs py-2 text-[#8C8C8D] px-4 whitespace-nowrap"
                  >
                    {client[col.key] || "N/A"}
                  </td>
                ))}
                <td className="text-xs py-2 text-[#8C8C8D] px-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(client.id)}>
                      <Image src={editIcon} alt="Editar" className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(client.id)}>
                      <Image src={trashIcon} alt="Excluir" className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex justify-center items-center mt-4 gap-2">
        <button
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-purple-700 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === index + 1 ? "bg-purple-700" : "bg-gray-600"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-purple-700 rounded disabled:opacity-50"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default TransactionTableTransfer;
