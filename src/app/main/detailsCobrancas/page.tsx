"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import loadingSpinner from "@/assets/images/loading.svg";
import PDFGenerator from "@/components/pdfegenerator";
import { UserDetails } from "@/components/pdfegenerator/types";

interface DocumentRowProps {
  doc: any;
  paymentId: string;
  customer: string;
  refreshDocuments: () => void;
  onDelete: (doc: any) => void;
  onSelectUpdate: (doc: any) => void;
}

// Função que formata CPF/CNPJ: se CPF, mascara tudo exceto a parte do meio; se CNPJ, formata normalmente.
const formatCpfCnpj = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 11) {
    const middle = cleaned.substring(3, 6);
    const last = cleaned.substring(9);
    return `***.${middle}.***-${last}`;
  } else if (cleaned.length === 14) {
    return `${cleaned.substring(0, 2)}.${cleaned.substring(
      2,
      5
    )}.${cleaned.substring(5, 8)}/${cleaned.substring(
      8,
      12
    )}-${cleaned.substring(12)}`;
  }
  return value;
};

const EditCharge: React.FC = () => {
  const [chargeData, setChargeData] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [errorDocuments, setErrorDocuments] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Estados para upload de documento
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("INVOICE");
  const [availableAfterPayment, setAvailableAfterPayment] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Função para abrir o modal de exclusão:
  const handleOpenDeleteModal = (doc: any) => {
    setDocumentToDelete(doc);
    setShowDeleteModal(true);
  };

  // Função para fechar o modal:
  const handleCloseDeleteModal = () => {
    setDocumentToDelete(null);
    setShowDeleteModal(false);
  };

  // Função para mapear status (usada também no PDF generator)
  const mapStatus = (status: string): string => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmado";
      case "PENDING":
        return "Pendente";
      case "CANCELED":
        return "Cancelado";
      case "OVERDUE":
        return "Atrasado";
      default:
        return status;
    }
  };

  // Busca dos dados da cobrança
  useEffect(() => {
    const fetchCharge = async () => {
      try {
        const selectedTransactionId = localStorage.getItem(
          "selectedTransactionId"
        );
        const token = localStorage.getItem("token");
        if (!selectedTransactionId || !token) {
          throw new Error("ID da transação ou token não encontrado.");
        }
        const response = await fetch(
          `http://localhost/payout/charges/${selectedTransactionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Erro ao buscar os detalhes da cobrança.");
        }
        const data = await response.json();
        setChargeData(data.data);
      } catch (err: any) {
        setError(err.message || "Erro desconhecido.");
      } finally {
        setLoading(false);
      }
    };
    fetchCharge();
  }, []);

  // Busca dos dados do cliente
  useEffect(() => {
    const fetchClient = async () => {
      if (chargeData?.customer) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `http://localhost/customer/${chargeData.customer}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) {
            throw new Error("Erro ao buscar os dados do cliente.");
          }
          const data = await response.json();
          setClientData(data);
        } catch (err: any) {
          console.error(err.message || "Erro desconhecido.");
        }
      }
    };
    fetchClient();
  }, [chargeData]);

  const fetchPaymentLink = useCallback(async () => {
    if (chargeData?.id) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost/payout/charges/payment/hash/${chargeData.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Erro ao buscar o link de pagamento.");
        }
        const data = await response.json();

        if (data.data?.hash) {
          setPaymentLink(`https://marilou.pro/hash/${data.data.hash}`);
        } else {
          console.warn("Hash não encontrado na resposta.");
        }
      } catch (error: any) {
        console.error(
          error.message || "Erro desconhecido ao buscar link de pagamento."
        );
      }
    }
  }, [chargeData?.id]);

  useEffect(() => {
    fetchPaymentLink();
  }, [fetchPaymentLink]);

  // Função para buscar a listagem de documentos
  const fetchDocuments = useCallback(async () => {
    if (chargeData?.id) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost/payout/documents/${chargeData.id}/documents`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Erro ao buscar documentos");
        }
        const data = await response.json();
        setDocuments(data.data.data);
      } catch (error: any) {
        setErrorDocuments(
          error.message || "Erro desconhecido ao buscar documentos"
        );
      } finally {
        setLoadingDocuments(false);
      }
    }
  }, [chargeData?.id]); // Apenas chargeData.id como dependência

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Validações com Yup
  const generalSchema = Yup.object().shape({
    billingType: Yup.string().required("Obrigatório"),
    value: Yup.number().required("Obrigatório"),
    dueDate: Yup.date().required("Obrigatório"),
    description: Yup.string().max(500, "Máximo de 500 caracteres"),
    daysAfterDueDateToRegistrationCancellation: Yup.number().nullable(),
    externalReference: Yup.string().nullable(),
  });
  const discountSchema = Yup.object().shape({
    value: Yup.number().required("Obrigatório"),
    dueDateLimitDays: Yup.number().required("Obrigatório"),
    type: Yup.string().required("Obrigatório"),
  });
  const interestSchema = Yup.object().shape({
    value: Yup.number().required("Obrigatório"),
  });
  const fineSchema = Yup.object().shape({
    value: Yup.number().required("Obrigatório"),
    type: Yup.string().required("Obrigatório"),
  });

  const documentUpdateSchema = Yup.object().shape({
    type: Yup.string().required("Obrigatório"),
    availableAfterPayment: Yup.boolean().required("Obrigatório"),
  });

  // 1. Crie ou atualize o componente DeleteConfirmationModal:
  const DeleteConfirmationModal: React.FC<{
    doc: any;
    onConfirm: (doc: any) => void;
    onCancel: () => void;
  }> = ({ doc, onConfirm, onCancel }) => {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCancel();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onCancel]);

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity"
        onClick={onCancel} // Fecha o modal ao clicar fora
      >
        <div
          className="bg-white p-6 rounded shadow-md"
          onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar no conteúdo
        >
          <p className="mb-4 text-black">
            Você realmente deseja excluir o documento?
          </p>
          <div className="flex justify-end gap-4">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => onConfirm(doc)}
            >
              Sim
            </button>
            <button
              className="bg-gray-300 text-black px-4 py-2 rounded"
              onClick={onCancel}
            >
              Não
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DocumentRow: React.FC<DocumentRowProps> = ({
    doc,
    paymentId,
    customer,
    refreshDocuments,
    onDelete,
    onSelectUpdate,
  }) => {
    return (
      <tr>
        <td className="border p-2">{doc.id}</td>
        <td className="border p-2">{doc.name}</td>
        <td className="border p-2">{doc.type}</td>
        <td className="border p-2">
          {doc.availableAfterPayment ? "Sim" : "Não"}
        </td>
        <td className="border p-2">
          <a
            href={doc.file.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 underline"
          >
            Ver
          </a>
        </td>
        <td className="border p-2">
          <button
            type="button"
            onClick={() => onSelectUpdate(doc)}
            className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
          >
            Atualizar
          </button>
          <button
            type="button"
            onClick={() => onDelete(doc)}
            className="bg-red-500 text-white px-2 py-1 rounded"
          >
            Excluir
          </button>
        </td>
      </tr>
    );
  };

  const handleConfirmDelete = async (doc: any) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost/payout/documents/${chargeData.id}/documents/${doc.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao excluir documento.");
      }
      // Atualiza a listagem de documentos
      fetchDocuments();
      setShowDeleteModal(false);
    } catch (error: any) {
      console.error(error.message || "Erro desconhecido ao excluir documento.");
    }
  };

  // Funções de envio (sem alteração)
  const handleGeneralSubmit = async (
    values: any,
    { setSubmitting, setStatus }: any
  ) => {
    try {
      const selectedTransactionId = chargeData.id;
      const token = localStorage.getItem("token");
      const bodyData = { ...values, customer: chargeData.customer };
      const response = await fetch(
        `http://localhost/payout/charges/${selectedTransactionId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao atualizar informações gerais.");
      }
      setStatus({ success: "Informações gerais atualizadas com sucesso!" });
    } catch (error: any) {
      setStatus({ error: error.message || "Erro desconhecido." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscountSubmit = async (
    values: any,
    { setSubmitting, setStatus }: any
  ) => {
    try {
      const selectedTransactionId = chargeData.id;
      const token = localStorage.getItem("token");
      const body = { discount: values, customer: chargeData.customer };
      const response = await fetch(
        `http://localhost/payout/charges/${selectedTransactionId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao atualizar informações de desconto.");
      }
      setStatus({ success: "Desconto atualizado com sucesso!" });
    } catch (error: any) {
      setStatus({ error: error.message || "Erro desconhecido." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInterestSubmit = async (
    values: any,
    { setSubmitting, setStatus }: any
  ) => {
    try {
      const selectedTransactionId = chargeData.id;
      const token = localStorage.getItem("token");
      const body = { interest: values, customer: chargeData.customer };
      const response = await fetch(
        `http://localhost/payout/charges/${selectedTransactionId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao atualizar informações de juros.");
      }
      setStatus({ success: "Juros atualizado com sucesso!" });
    } catch (error: any) {
      setStatus({ error: error.message || "Erro desconhecido." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFineSubmit = async (
    values: any,
    { setSubmitting, setStatus }: any
  ) => {
    try {
      const selectedTransactionId = chargeData.id;
      const token = localStorage.getItem("token");
      const body = { fine: values, customer: chargeData.customer };
      const response = await fetch(
        `http://localhost/payout/charges/${selectedTransactionId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao atualizar informações de multa.");
      }
      setStatus({ success: "Multa atualizada com sucesso!" });
    } catch (error: any) {
      setStatus({ error: error.message || "Erro desconhecido." });
    } finally {
      setSubmitting(false);
    }
  };

  // Funções para upload de documento via drag & drop ou file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDocumentUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Nenhum arquivo selecionado.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost/payout/documents/${chargeData.id}/documents`;
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append(
        "availableAfterPayment",
        availableAfterPayment ? "true" : "false"
      );
      formData.append("type", uploadType);
      formData.append("customer", chargeData.customer);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Erro ao enviar documento.");
      }
      setUploadStatus("Documento enviado com sucesso!");
      setUploadError(null);
      setUploadFile(null);
      fetchDocuments();
    } catch (err: any) {
      setUploadError(err.message || "Erro desconhecido.");
      setUploadStatus(null);
    }
  };

  // Função para selecionar um documento para atualização
  const handleSelectDocument = (doc: any) => {
    setSelectedDocument(doc);
  };

  // Função para atualizar documento (formulário abaixo da tabela)
  const handleDocumentUpdate = async (
    values: { type: string; availableAfterPayment: boolean },
    { setSubmitting, setStatus }: any
  ) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost/payout/documents/${chargeData.id}/documents/${selectedDocument.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: values.type,
            availableAfterPayment: values.availableAfterPayment,
            customer: chargeData.customer,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao atualizar documento.");
      }
      setStatus({ success: "Documento atualizado com sucesso!" });
      fetchDocuments();
      setSelectedDocument(null);
    } catch (error: any) {
      setStatus({ error: error.message || "Erro desconhecido." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <Image
          src={loadingSpinner}
          alt="Carregando..."
          className="w-[300px] h-[300px] animate-spin"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        <p>{error}</p>
        <button
          onClick={() => router.push("/main")}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#181B21] text-white min-h-screen p-6">
      <h1 className="text-2xl mb-7 border-solid pl-2 border-[#A644CB] font-bold border-l-4">
        Editar Cobrança
      </h1>

      {/* Seção: Dados do Cliente */}
      <div className="p-4 bg-[#25282E] rounded-md mb-6">
        <h2 className="text-xl font-bold mb-4 border-solid pl-2 border-[#A644CB] border-l-4">
          Dados do Cliente
        </h2>
        {clientData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="block text-neutral-400 mb-1">Nome:</span>
              <p>{clientData.name}</p>
            </div>
            <div>
              <span className="block text-neutral-400 mb-1">CPF/CNPJ:</span>
              <p>
                {clientData.cpfCnpj
                  ? formatCpfCnpj(clientData.cpfCnpj)
                  : "Não informado"}
              </p>
            </div>
            <div>
              <span className="block text-neutral-400 mb-1">E-mail:</span>
              <p>{clientData.email || "Não informado"}</p>
            </div>
            <div>
              <span className="block text-neutral-400 mb-1">País:</span>
              <p>{clientData.country}</p>
            </div>
            {paymentLink && (
              <div>
                <span className="block text-neutral-400 mb-1">
                  Link de Pagamento:
                </span>
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 underline"
                >
                  {paymentLink}
                </a>
              </div>
            )}
          </div>
        ) : (
          <p>Carregando dados do cliente...</p>
        )}
      </div>

      <div className="space-y-8">
        {/* Seção: Informações Gerais */}
        <div className="p-4 bg-[#30343A] rounded-md">
          <h2 className="text-xl font-bold mb-4 border-solid pl-2 border-[#A644CB] border-l-4">
            Informações Gerais
          </h2>
          <Formik
            initialValues={{
              billingType: chargeData.billingType || "",
              value: chargeData.value || 0,
              dueDate: chargeData.dueDate
                ? chargeData.dueDate.split("T")[0]
                : "",
              description: chargeData.description || "",
              daysAfterDueDateToRegistrationCancellation:
                chargeData.daysAfterDueDateToRegistrationCancellation || "",
              externalReference: chargeData.externalReference || "",
            }}
            validationSchema={generalSchema}
            onSubmit={handleGeneralSubmit}
          >
            {({ isSubmitting, status }) => (
              <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label>Forma de Pagamento</label>
                  <Field
                    as="select"
                    name="billingType"
                    className="p-2 rounded-md bg-[#181B21] border"
                  >
                    <option value="BOLETO">BOLETO</option>
                    <option value="PIX">PIX</option>
                    <option value="CREDIT_CARD">CREDIT_CARD</option>
                  </Field>
                  <ErrorMessage
                    name="billingType"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Valor da Cobrança</label>
                  <Field
                    type="number"
                    name="value"
                    className="p-2 rounded-md bg-[#181B21] border"
                  />
                  <ErrorMessage
                    name="value"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Data de Vencimento</label>
                  <Field
                    type="date"
                    name="dueDate"
                    className="p-2 rounded-md bg-[#181B21] border"
                  />
                  <ErrorMessage
                    name="dueDate"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Descrição</label>
                  <Field
                    as="textarea"
                    name="description"
                    className="p-2 rounded-md bg-[#181B21] border"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Dias para Cancelamento (Boleto)</label>
                  <Field
                    type="number"
                    name="daysAfterDueDateToRegistrationCancellation"
                    className="p-2 rounded-md bg-[#181B21] border"
                  />
                  <ErrorMessage
                    name="daysAfterDueDateToRegistrationCancellation"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Referência Externa</label>
                  <Field
                    type="text"
                    name="externalReference"
                    className="p-2 rounded-md bg-[#181B21] border"
                  />
                  <ErrorMessage
                    name="externalReference"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div className="col-span-1 md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#A644CB] text-white px-4 py-2 rounded-md hover:bg-[#8E38A6]"
                  >
                    {isSubmitting ? "Salvando..." : "Salvar Informações Gerais"}
                  </button>
                </div>
                {status && status.success && (
                  <div className="col-span-1 md:col-span-2 text-green-500">
                    {status.success}
                  </div>
                )}
                {status && status.error && (
                  <div className="col-span-1 md:col-span-2 text-red-500">
                    {status.error}
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>

        {/* Seção: Informações de Desconto */}
        <div className="p-4 bg-[#30343A] rounded-md">
          <h2 className="text-xl font-bold mb-4 border-solid pl-2 border-[#A644CB] border-l-4">
            Informações de Desconto
          </h2>
          <Formik
            initialValues={{
              value: chargeData.discount?.value || 0,
              dueDateLimitDays: chargeData.discount?.dueDateLimitDays || 0,
              type: chargeData.discount?.type || "",
            }}
            validationSchema={discountSchema}
            onSubmit={handleDiscountSubmit}
          >
            {({ isSubmitting, status }) => (
              <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label>Valor do Desconto</label>
                  <Field
                    type="number"
                    name="value"
                    className="p-2 rounded-md bg-[#181B21] border"
                  />
                  <ErrorMessage
                    name="value"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Dias Limite para Desconto</label>
                  <Field
                    type="number"
                    name="dueDateLimitDays"
                    className="p-2 rounded-md bg-[#181B21] border"
                  />
                  <ErrorMessage
                    name="dueDateLimitDays"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Tipo de Desconto</label>
                  <Field
                    as="select"
                    name="type"
                    className="p-2 rounded-md bg-[#181B21] border"
                  >
                    <option value="">Selecione</option>
                    <option value="FIXED">FIXED</option>
                    <option value="PERCENTAGE">PERCENTAGE</option>
                  </Field>
                  <ErrorMessage
                    name="type"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div className="col-span-1 md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#A644CB] text-white px-4 py-2 rounded-md hover:bg-[#8E38A6]"
                  >
                    {isSubmitting ? "Salvando..." : "Salvar Desconto"}
                  </button>
                </div>
                {status && status.success && (
                  <div className="col-span-1 md:col-span-2 text-green-500">
                    {status.success}
                  </div>
                )}
                {status && status.error && (
                  <div className="col-span-1 md:col-span-2 text-red-500">
                    {status.error}
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>

        {/* Seção: Informações de Juros */}
        <div className="p-4 bg-[#30343A] rounded-md">
          <h2 className="text-xl font-bold mb-4 border-solid pl-2 border-[#A644CB] border-l-4">
            Informações de Juros
          </h2>
          <Formik
            initialValues={{
              value: chargeData.interest?.value || 0,
            }}
            validationSchema={interestSchema}
            onSubmit={handleInterestSubmit}
          >
            {({ isSubmitting, status }) => (
              <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label>Percentual de Juros ao Mês</label>
                  <Field
                    type="number"
                    name="value"
                    className="p-2 rounded-md bg-[#181B21] border"
                  />
                  <ErrorMessage
                    name="value"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div className="col-span-1 md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#A644CB] text-white px-4 py-2 rounded-md hover:bg-[#8E38A6]"
                  >
                    {isSubmitting ? "Salvando..." : "Salvar Juros"}
                  </button>
                </div>
                {status && status.success && (
                  <div className="col-span-1 md:col-span-2 text-green-500">
                    {status.success}
                  </div>
                )}
                {status && status.error && (
                  <div className="col-span-1 md:col-span-2 text-red-500">
                    {status.error}
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>

        {/* Seção: Informações de Multa */}
        <div className="p-4 bg-[#30343A] rounded-md">
          <h2 className="text-xl font-bold mb-4 border-solid pl-2 border-[#A644CB] border-l-4">
            Informações de Multa
          </h2>
          <Formik
            initialValues={{
              value: chargeData.fine?.value || 0,
              type: chargeData.fine?.type || "",
            }}
            validationSchema={fineSchema}
            onSubmit={handleFineSubmit}
          >
            {({ isSubmitting, status }) => (
              <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label>Percentual de Multa</label>
                  <Field
                    type="number"
                    name="value"
                    className="p-2 rounded-md bg-[#181B21] border"
                  />
                  <ErrorMessage
                    name="value"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Tipo de Multa</label>
                  <Field
                    as="select"
                    name="type"
                    className="p-2 rounded-md bg-[#181B21] border"
                  >
                    <option value="">Selecione</option>
                    <option value="FIXED">FIXED</option>
                    <option value="PERCENTAGE">PERCENTAGE</option>
                  </Field>
                  <ErrorMessage
                    name="type"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div className="col-span-1 md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#A644CB] text-white px-4 py-2 rounded-md hover:bg-[#8E38A6]"
                  >
                    {isSubmitting ? "Salvando..." : "Salvar Multa"}
                  </button>
                </div>
                {status && status.success && (
                  <div className="col-span-1 md:col-span-2 text-green-500">
                    {status.success}
                  </div>
                )}
                {status && status.error && (
                  <div className="col-span-1 md:col-span-2 text-red-500">
                    {status.error}
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>

        {/* Seção: Upload de Documentos */}
        <div className="p-4 bg-[#30343A] rounded-md">
          <h2 className="text-xl font-bold mb-4 border-solid pl-2 border-[#A644CB] border-l-4">
            Documentos
          </h2>
          <form
            onSubmit={handleDocumentUpload}
            className="grid grid-cols-1 gap-4"
          >
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-dashed border-2 border-gray-500 rounded-md p-4 text-center cursor-pointer"
            >
              {uploadFile ? (
                <p>{uploadFile.name}</p>
              ) : (
                <p>Arraste seu documento aqui ou clique para selecionar</p>
              )}
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="block mt-2 text-blue-300 underline cursor-pointer"
              >
                Selecionar arquivo
              </label>
            </div>
            <div className="flex flex-col">
              <label>Tipo de Documento</label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="p-2 rounded-md bg-[#181B21] border"
              >
                <option value="INVOICE">INVOICE</option>
                <option value="CONTRACT">CONTRACT</option>
                <option value="MEDIA">MEDIA</option>
                <option value="DOCUMENT">DOCUMENT</option>
                <option value="SPREADSHEET">SPREADSHEET</option>
                <option value="PROGRAM">PROGRAM</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={availableAfterPayment}
                onChange={(e) => setAvailableAfterPayment(e.target.checked)}
                id="availableAfterPayment"
              />
              <label htmlFor="availableAfterPayment">
                Disponibilizar após o pagamento
              </label>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500"
              >
                Enviar Documento
              </button>
            </div>
            {uploadStatus && (
              <div className="text-green-500">{uploadStatus}</div>
            )}
            {uploadError && <div className="text-red-500">{uploadError}</div>}
          </form>
        </div>

        {/* Seção: Listagem de Documentos */}
        <div className="p-4 bg-[#25282E] rounded-md mt-6">
          <h2 className="text-xl font-bold mb-4 border-solid pl-2 border-[#A644CB] border-l-4">
            Documentos Enviados
          </h2>
          {loadingDocuments ? (
            <p>Carregando documentos...</p>
          ) : errorDocuments ? (
            <p className="text-red-500">{errorDocuments}</p>
          ) : documents.length === 0 ? (
            <p>Nenhum documento enviado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Nome</th>
                    <th className="border p-2">Tipo</th>
                    <th className="border p-2">Disponível</th>
                    <th className="border p-2">Preview</th>
                    <th className="border p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <DocumentRow
                      key={doc.id}
                      doc={doc}
                      paymentId={chargeData.id}
                      customer={chargeData.customer}
                      refreshDocuments={fetchDocuments}
                      onDelete={handleOpenDeleteModal}
                      onSelectUpdate={(doc) => setSelectedDocument(doc)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Seção: Atualização de Documento Selecionado */}
        {selectedDocument && (
          <div className="p-4 bg-[#30343A] rounded-md mt-6">
            <h2 className="text-xl font-bold mb-4 border-solid pl-2 border-[#A644CB] border-l-4">
              Atualizar Definições do Documento
            </h2>
            <Formik
              initialValues={{
                type: selectedDocument.type,
                availableAfterPayment: selectedDocument.availableAfterPayment,
              }}
              validationSchema={documentUpdateSchema}
              onSubmit={handleDocumentUpdate}
              enableReinitialize
            >
              {({ isSubmitting, status }) => (
                <Form className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col">
                    <label>Tipo de Documento</label>
                    <Field
                      as="select"
                      name="type"
                      className="p-2 rounded-md bg-[#181B21] border"
                    >
                      <option value="INVOICE">INVOICE</option>
                      <option value="CONTRACT">CONTRACT</option>
                      <option value="MEDIA">MEDIA</option>
                      <option value="DOCUMENT">DOCUMENT</option>
                      <option value="SPREADSHEET">SPREADSHEET</option>
                      <option value="PROGRAM">PROGRAM</option>
                      <option value="OTHER">OTHER</option>
                    </Field>
                    <ErrorMessage
                      name="type"
                      component="div"
                      className="text-red-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Field type="checkbox" name="availableAfterPayment" />
                    <label>Disponibilizar após o pagamento</label>
                    <ErrorMessage
                      name="availableAfterPayment"
                      component="div"
                      className="text-red-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      Enviar
                    </button>
                  </div>
                  {status && status.success && (
                    <div className="text-green-500">{status.success}</div>
                  )}
                  {status && status.error && (
                    <div className="text-red-500">{status.error}</div>
                  )}
                </Form>
              )}
            </Formik>
          </div>
        )}

        {showDeleteModal && documentToDelete && (
          <DeleteConfirmationModal
            doc={documentToDelete}
            onConfirm={handleConfirmDelete}
            onCancel={handleCloseDeleteModal}
          />
        )}

        {/* Botões de navegação e PDF Generator */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
          <button
            onClick={() => router.push("/main/charges")}
            className="bg-[#A644CB] text-white px-4 py-2 rounded-md hover:bg-[#8E38A6]"
          >
            Voltar
          </button>
          {chargeData && (
            <PDFGenerator
              userDetails={chargeData as UserDetails}
              mapStatus={mapStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditCharge;
