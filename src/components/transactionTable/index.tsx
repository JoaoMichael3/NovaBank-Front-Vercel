import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import downloadIcon from "@/assets/icons/download.svg";
import editIcon from "@/assets/icons/edit.svg";
import trashIcon from "@/assets/icons/trash.svg";
import copia from "@/assets/icons/copiar.png";
import ToastNotifications from "@/components/toast/page";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionTableProps {
  title: string;
  fetchEndpoint: string;
  deleteEndpoint: string;
  columns: { key: string; label: string }[];
  fetchCustomerName: (customerId: string) => Promise<string>;
}

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
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
    CONFIRMED: "Confirmada",
    RECEIVED: "Recebida",
    OVERDUE: "Vencida",
  };
  return statusMap[status] || status;
};

const formatBillingType = (type: string) => {
  const typeMap: { [key: string]: string } = {
    PIX: "Pix",
    BOLETO: "Boleto",
    CREDIT_CARD: "Cartão de Crédito",
  };
  return typeMap[type] || type;
};

const TransactionTable: React.FC<TransactionTableProps> = ({
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
  const itemsPerPage = 10;
  const router = useRouter();

  const addToast = (message: string, type: ToastType) => {
    const id = Math.floor(Math.random() * 10000);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta cobrança?")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      const res = await fetch(`${deleteEndpoint}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const errorResponse = await res.json();
        throw new Error(
          errorResponse.message || `Erro ao excluir cobrança: ${res.status}`
        );
      }
      setData((prevData) =>
        prevData.filter((transaction) => transaction.id !== id)
      );
      setFilteredData((prevData) =>
        prevData.filter((transaction) => transaction.id !== id)
      );
      addToast("Cobrança excluída com sucesso", "success");
    } catch (error) {
      console.error("Erro ao excluir cobrança:", error);
      addToast("Erro ao excluir cobrança", "error");
    }
  };

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
        fetchedData.map(async (transaction: Record<string, any>) => {
          const customerName = await fetchCustomerName(transaction.customer);
          return {
            ...transaction,
            customerName,
            dateCreated: formatDate(transaction.dateCreated),
            dueDate: formatDate(transaction.dueDate),
            value: formatCurrency(transaction.value),
            status: translateStatus(transaction.status),
            billingType: formatBillingType(transaction.billingType),
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
    if (searchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = data.filter((transaction) => {
        const idMatch = transaction.id.toString().includes(lowerSearch);
        const nameMatch =
          transaction.customerName &&
          transaction.customerName.toLowerCase().includes(lowerSearch);
        return idMatch || nameMatch;
      });
      setFilteredData(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, data]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cálculo dos dados para a página atual
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

  // Função para baixar os dados em formato XLSX
  const handleDownloadXLSX = () => {
    if (filteredData.length === 0) {
      addToast("Nenhum dado para baixar", "info");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "transactions.xlsx");
  };

  // Função para baixar os dados em formato XML
  const handleDownloadXML = () => {
    if (filteredData.length === 0) {
      addToast("Nenhum dado para baixar", "info");
      return;
    }
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<transactions>\n';
    filteredData.forEach((transaction) => {
      xmlContent += "  <transaction>\n";
      for (const key in transaction) {
        xmlContent += `    <${key}>${transaction[key]}</${key}>\n`;
      }
      xmlContent += "  </transaction>\n";
    });
    xmlContent += "</transactions>";
    const blob = new Blob([xmlContent], { type: "text/xml" });
    saveAs(blob, "transactions.xml");
  };

  return (
    <div className="bg-[#181B21] text-white rounded-lg p-6 font-roboto">
      <ToastNotifications toasts={toasts} removeToast={removeToast} />

      <div className="mb-6">
        <h1 className="border-l-4 pl-2 text-[30px] border-solid border-[#A644CB] mb-6">
          {title}
        </h1>
        <div className="flex flex-col sm:flex-row w-full sm:justify-start sm:items-center">
          {/* <div className="flex items-center gap-4">
            <button
              onClick={handleDownloadXLSX}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
            >
              <Image src={copia} alt="Baixar XLSX" width={24} height={24} />
              <span className="text-sm">Baixar XLSX</span>
            </button>
            <button
              onClick={handleDownloadXML}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
            >
              <Image src={downloadIcon} alt="Baixar XML" width={24} height={24} />
              <span className="text-sm">Baixar XML</span>
            </button>
          </div> */}
          <input
            type="text"
            placeholder="Buscar por ID ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 rounded-md text-black w-full sm:w-1/3 mt-4 sm:mt-0"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-auto table-auto border-collapse">
          <thead className="sticky top-0 bg-[#181B21] z-20">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-[13px] text-left font-semibold py-3 text-[#ddd] border-b-2 border-purple-300 px-2 whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              <th className="text-[13px] font-semibold py-3 text-[#ddd] border-b-2 border-purple-300 px-2 whitespace-nowrap">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((transaction, index) => (
              <tr
                key={transaction.id}
                className={`border ${
                  index % 2 === 0 ? "bg-[#25282e]" : "bg-[#1c1f26]"
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="text-xs py-2 text-[#8C8C8D] px-2 whitespace-nowrap"
                  >
                    {transaction[col.key] || "N/A"}
                  </td>
                ))}
                <td className="text-xs py-2 text-[#8C8C8D] px-2 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        router.push(`/main/detailsCobrancas/?id=${transaction.id}`)
                      }
                      className="bg-blue-400 w-8 h-8 flex justify-center items-center rounded-lg"
                    >
                      <Image src={editIcon} alt="Editar" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="bg-red-600 w-8 h-8 flex justify-center items-center rounded-md"
                    >
                      <Image src={trashIcon} alt="Excluir" className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            className={`px-3 py-1 rounded ${
              currentPage === index + 1 ? "bg-purple-700" : "bg-gray-600"
            }`}
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
  );
};

export default TransactionTable;
