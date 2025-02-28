import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { UserDetails } from "./types";
import logo from "@/assets/images/logopng.png";

interface PDFGeneratorProps {
  userDetails: UserDetails;
  mapStatus: (status: string) => string;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ userDetails, mapStatus }) => {
  const [customerName, setCustomerName] = useState<string>("");

  useEffect(() => {
    if (userDetails.customer) {
      fetchCustomerName(userDetails.customer);
    }
  }, [userDetails.customer]);

  const fetchCustomerName = async (customerId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado.");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SEARCH_CUSTOMER_URL}/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Erro ao buscar nome do cliente:", response.status);
        return;
      }

      const data = await response.json();
      setCustomerName(data.name || "Nome não encontrado");
    } catch (error) {
      console.error("Erro ao buscar nome do cliente:", error);
      setCustomerName("Nome não encontrado");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Define o fundo da página
    doc.setFillColor(24, 27, 33);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

    // Adiciona logo
    doc.addImage(logo.src, "PNG", pageWidth / 2 - 30, 10, 65, 30);
    yPosition += 18;

    // Cabeçalhos das seções
    const sectionHeader = (title: string) => {
      doc.setFillColor(166, 68, 203);
      doc.rect(10, yPosition, 2, 10, "F");
      doc.setFontSize(14).setFont("helvetica", "bold").setTextColor(255, 255, 255);
      doc.text(title, 15, yPosition + 8);
      yPosition += 20;
    };

    // Função para desenhar blocos de informações
    const renderBlock = (data: { label: string; value: string | number | null }[]) => {
      const blockHeight = Math.ceil(data.length / 2) * 13 + 18;
      doc.setFillColor(48, 52, 58);
      doc.roundedRect(10, yPosition, pageWidth - 20, blockHeight, 2, 2, "F");

      let blockYPosition = yPosition + 15;
      let columnXPosition = 15;

      data.forEach((item, index) => {
        if (index === Math.floor(data.length / 2)) {
          columnXPosition = pageWidth / 2 + 3;
          blockYPosition = yPosition + 15;
        }

        // Label
        doc.setFontSize(13).setFont("helvetica", "bold").setTextColor(255, 255, 255);
        doc.text(item.label, columnXPosition, blockYPosition - 3);

        // Valor
        doc.setFontSize(11).setFont("helvetica", "normal").setTextColor(255, 255, 255);
        doc.text(
          item.value ? item.value.toString() : "Não informado",
          columnXPosition,
          blockYPosition + 3
        );

        blockYPosition += 16;
      });

      yPosition += blockHeight + 8;
    };

    // Informações Gerais
    sectionHeader("Informações Gerais");
    renderBlock([
      { label: "Cliente ID", value: userDetails.customer },
      { label: "Nome", value: customerName || "Não informado" },
      { label: "Status", value: mapStatus(userDetails.status) },
      { label: "Descrição", value: userDetails.description || "Sem descrição" },
    ]);

    // Informações Financeiras
    sectionHeader("Informações Financeiras");
    renderBlock([
      { label: "Valor", value: parseFloat(userDetails.value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) },
      {
        label: "Multa",
        value: userDetails.fine
          ? `${userDetails.fine.value} ${userDetails.fine.type === "PERCENTAGE" ? "% (Porcentagem)" : "Fixo"}`
          : "N/A",
      },
      {
        label: "Juros",
        value: userDetails.interest
          ? `${userDetails.interest.value} ${userDetails.interest.type === "PERCENTAGE" ? "% (Porcentagem)" : "Fixo"}`
          : "N/A",
      },
      { label: "Desconto", value: parseFloat(userDetails.discount?.value?.toString() || "0").toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) },
    ]);

    // Informações de Pagamento
    sectionHeader("Informações de Pagamento");
    renderBlock([
      { label: "Forma de Pagamento", value: userDetails.billingType || "N/A" },
      { label: "Número do Boleto", value: userDetails.invoiceNumber || "N/A" },
      { label: "Data Criada", value: userDetails.dateCreated ? new Date(userDetails.dateCreated).toLocaleDateString("pt-BR") : "N/A" },
      { label: "Data de Vencimento", value: userDetails.dueDate ? new Date(userDetails.dueDate).toLocaleDateString("pt-BR") : "N/A" },
    ]);

    // Salvar o PDF
    doc.save("detalhes_cobranca.pdf");
  };

  return (
    <button
      onClick={generatePDF}
      className="bg-[#A644CB] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#8E38A6]"
    >
      Baixar PDF
    </button>
  );
};

export default PDFGenerator;
