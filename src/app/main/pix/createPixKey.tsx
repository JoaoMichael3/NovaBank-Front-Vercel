"use client";

import { useState } from "react";
import axios from "axios";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  useField,
  useFormikContext,
} from "formik";
import * as Yup from "yup";
import Button from "@/components/button";
import { isValidCPF, isValidCNPJ } from "@/utils/validations";

// ---------- Helper Functions ----------
const removeFormatting = (value: string): string => value.replace(/\D/g, "");

const formatCPF = (cpf: string): string => {
  const cleaned = removeFormatting(cpf).slice(0, 11);
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return cleaned;
};

const formatCNPJ = (cnpj: string): string => {
  const cleaned = removeFormatting(cnpj).slice(0, 14);
  if (cleaned.length === 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return cleaned;
};

const formatPhone = (phone: string): string => {
  const cleaned = removeFormatting(phone).slice(0, 11);
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return cleaned;
};

const detectPixKeyType = (value: string): "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "EVP" => {
  const trimmed = value.trim();
  if (trimmed.includes("@")) return "EMAIL";
  const digits = removeFormatting(trimmed);
  if (/^\d+$/.test(digits)) {
    if (digits.length === 14) return "CNPJ";
    if (digits.length === 11) return isValidCPF(digits) ? "CPF" : "PHONE";
    if (digits.length === 10) return "PHONE";
  }
  return "EVP";
};

export interface TransferFormBancoValues {
  transferValue: string;
  institution: string;
  agency: string;
  accountNumber: string;
  accountDigitNumber: string;
  accountType: "CONTA_CORRENTE" | "CONTA_POUPANCA";
  recipientName: string;
  recipientCPF: string;
  transferDescription: string;
}

export interface TransferFormPixValues {
  transferValue: string;
  pixAddressKey: string;
  pixAddressKeyType: "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "EVP";
  scheduleDate: string | null;
  transferDescription: string;
  receiverName: string;
  receiverCity: string;
}

interface CPFInputProps {
  name: string;
  placeholder?: string;
}
const CPFInput: React.FC<CPFInputProps> = ({ name, placeholder }) => {
  const [field, meta, helpers] = useField(name);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = removeFormatting(e.target.value);
    if (raw.length > 14) {
      raw = raw.slice(0, 14);
    }
    helpers.setValue(raw);
  };

  const handleBlur = () => {
    let value = field.value;
    if (isValidCPF(value)) {
      helpers.setValue(formatCPF(value));
    } else if (isValidCNPJ(value)) {
      helpers.setValue(formatCNPJ(value));
    }
  };

  return (
    <>
      <input
        {...field}
        maxLength={14}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500
"
      />
      {meta.touched && meta.error && (
        <div className="text-red-500 text-xs mt-1">{meta.error}</div>
      )}
    </>
  );
};
// ---------- Custom Input para Telefone ----------
interface PhoneInputProps {
  name: string;
  placeholder?: string;
}
const PhoneInput: React.FC<PhoneInputProps> = ({ name, placeholder }) => {
  const [field, meta, helpers] = useField(name);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = removeFormatting(e.target.value);
    if (raw.length > 11) {
      raw = raw.slice(0, 11);
    }
    helpers.setValue(raw);
  };

  const handleBlur = () => {
    let value = field.value;
    helpers.setValue(formatPhone(value));
  };

  return (
    <>
      <input
        {...field}
        maxLength={11}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      {meta.touched && meta.error && (
        <div className="text-red-500 text-xs mt-1">{meta.error}</div>
      )}
    </>
  );
};

// ---------- Custom Input para Chave Pix (CPF/CNPJ/Telefone ou outros) ----------
const PixKeyInput: React.FC<{ name: string; placeholder?: string }> = ({
  name,
  placeholder,
}) => {
  const { values } = useFormikContext<any>();
  const keyType = values.pixAddressKeyType;
  if (keyType === "PHONE") {
    return <PhoneInput name={name} placeholder={placeholder} />;
  } else if (keyType === "CPF" || keyType === "CNPJ") {
    return <CPFInput name={name} placeholder={placeholder} />;
  } else {
    return (
      <Field
        name={name}
        type="text"
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    );
  }
};


// ---------- COMPONENTES DE FORMULÁRIO ----------

// Formulário para Dados Bancários (TED)
interface StepBancoProps {
  initialValues: TransferFormBancoValues;
  onSubmit: (values: TransferFormBancoValues) => void;
}
const StepBanco: React.FC<StepBancoProps> = ({ initialValues, onSubmit }) => {
  const validationSchema = Yup.object().shape({
    transferValue: Yup.number()
      .typeError("Valor deve ser numérico")
      .positive("Valor deve ser positivo")
      .required("Valor é obrigatório"),
    institution: Yup.string().required("Instituição é obrigatória"),
    agency: Yup.string().required("Agência é obrigatória"),
    accountNumber: Yup.string().required("Conta é obrigatória"),
    accountDigitNumber: Yup.string().required("Dígito é obrigatório"),
    accountType: Yup.string()
      .oneOf(["CONTA_CORRENTE", "CONTA_POUPANCA"])
      .required("Tipo de conta é obrigatório"),
    recipientName: Yup.string().required("Nome do destinatário é obrigatório"),
    recipientCPF: Yup.string()
      .required("CPF/CNPJ é obrigatório")
      .test("cpf-cnpj", "CPF/CNPJ inválido", (value) =>
        value ? isValidCPF(value) || isValidCNPJ(value) : false
      ),
    transferDescription: Yup.string(),
  });

  return (
    <div className="p-4 rounded-lg  border border-purple-500 bg-[#2D2D44]">
      <h3 className="text-lg font-semibold mb-4 text-white">Dados para Pix</h3>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => onSubmit(values)}
      >
        {() => (
          <Form>
            <div className="mb-4">
              <label className="block font-semibold text-white mb-1">
                Valor da transferência
              </label>
              <Field
                name="transferValue"
                type="number"
                placeholder="Ex: 10.00"
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <ErrorMessage
                name="transferValue"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold text-white mb-1">
                Número da Instituição
              </label>
              <Field
                name="institution"
                type="text"
                placeholder="Ex: 237"
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <ErrorMessage
                name="institution"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold text-white mb-1">
                Agência (sem dígito)
              </label>
              <Field
                name="agency"
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <ErrorMessage
                name="agency"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold text-white mb-1">
                Conta (sem dígito)
              </label>
              <Field
                name="accountNumber"
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <ErrorMessage
                name="accountNumber"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold text-white mb-1">
                Dígito da Conta
              </label>
              <Field
                name="accountDigitNumber"
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <ErrorMessage
                name="accountDigitNumber"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold text-white mb-1">
                Tipo de Conta
              </label>
              <Field
                as="select"
                name="accountType"
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="CONTA_CORRENTE">Conta Corrente</option>
                <option value="CONTA_POUPANCA">Conta Poupança</option>
              </Field>
              <ErrorMessage
                name="accountType"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold text-white mb-1">
                Nome do Destinatário
              </label>
              <Field
                name="recipientName"
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <ErrorMessage
                name="recipientName"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold text-white mb-1">
                CPF/CNPJ do Destinatário
              </label>
              {/* Utiliza o componente customizado para formatação */}
              <CPFInput
                name="recipientCPF"
                placeholder="Ex: 12345678909 ou 12345678000195"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold text-white mb-1">
                Descrição (opcional)
              </label>
              <Field
                name="transferDescription"
                as="textarea"
                rows={3}
                placeholder="Insira uma descrição opcional para o pagamento"
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <ErrorMessage
                name="transferDescription"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            <div className="flex justify-end">
              <Button
                text="Avançar"
                color="bg-blue-600"
                hoverColor="bg-blue-700"
                type="submit"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const AutoPixKeyInput: React.FC<{ name: string; placeholder?: string }> = ({
  name,
  placeholder,
}) => {
  const [field, meta, helpers] = useField(name);
  const { setFieldValue } = useFormikContext<any>();

  // Detecta o tipo conforme o valor atual; se o campo estiver vazio, não limita
  const currentValue = field.value || "";
  const detectedType = detectPixKeyType(currentValue);
  const maxLength =
    detectedType === "CPF" || detectedType === "CNPJ"
      ? 14
      : detectedType === "PHONE"
      ? 11
      : undefined; // Para EMAIL ou EVP, não define maxLength

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    helpers.setValue(e.target.value);
  };

  const handleBlur = () => {
    const value = field.value;
    const detected = detectPixKeyType(value);
    // Atualiza automaticamente o tipo da chave no formulário
    setFieldValue("pixAddressKeyType", detected);

    // Aplica a formatação se for CPF, CNPJ ou PHONE
    if (detected === "CPF") {
      helpers.setValue(formatCPF(value));
    } else if (detected === "CNPJ") {
      helpers.setValue(formatCNPJ(value));
    } else if (detected === "PHONE") {
      helpers.setValue(formatPhone(value));
    }
  };

  return (
    <>
      <input
        {...field}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      {meta.touched && meta.error && (
        <div className="text-red-500 text-xs mt-1">{meta.error}</div>
      )}
    </>
  );
};

// ---------- Componente StepPix ----------
interface StepPixProps {
  onSubmit: (values: TransferFormPixValues) => void;
  initialValues: TransferFormPixValues;
}
const StepPix: React.FC<StepPixProps> = ({ onSubmit, initialValues }) => {
  const validationSchema = Yup.object().shape({
    transferValue: Yup.number()
      .typeError("Valor deve ser numérico")
      .positive("Valor deve ser positivo")
      .required("Valor é obrigatório"),
    // O campo pixAddressKey é obrigatório; o tipo será atualizado automaticamente
    pixAddressKey: Yup.string().required("Chave Pix é obrigatória"),
    scheduleDate: Yup.string()
      .nullable()
      .test("future-date", "A data deve estar no futuro", function (value) {
        if (!value) return true;
        const today = new Date().toISOString().split("T")[0];
        return value >= today;
      }),
    // receiverName: Yup.string().required("Nome do recebedor é obrigatório"),
    // receiverCity: Yup.string().required("Cidade do recebedor é obrigatória"),
    transferDescription: Yup.string(),
  });

  return (
    <div className="p-4 rounded-lg  border border-purple-500 bg-[#2D2D44]">
      <h3 className="text-lg font-semibold mb-4 text-white">Dados para Pix</h3>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {() => (
          <Form>
            <div className="mb-4">
              <label className="block font-semibold text-white mb-1">Valor da transferência</label>
              <Field
                name="transferValue"
                type="number"
                placeholder="Ex: 20.00"
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <ErrorMessage name="transferValue" component="div" className="text-red-500 text-xs mt-1" />
            </div>
            <div className="mb-4">
              <label className="block font-semibold text-white mb-1">Chave Pix</label>
              <AutoPixKeyInput name="pixAddressKey" placeholder="Ex: 53131335000105" />
              <ErrorMessage name="pixAddressKey" component="div" className="text-red-500 text-xs mt-1" />
            </div>
            <div className="mb-4">
              <label className="block font-semibold text-white mb-1">
                Data do Pagamento 
              </label>
              <Field
                name="scheduleDate"
                type="date"
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <ErrorMessage name="scheduleDate" component="div" className="text-red-500 text-xs mt-1" />
            </div>
            {/* <div className="mb-4">
              <label className="block font-semibold text-white mb-1">Nome do Recebedor</label>
              <Field
                name="receiverName"
                type="text"
                placeholder="Digite o nome do recebedor"
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <ErrorMessage name="receiverName" component="div" className="text-red-500 text-xs mt-1" />
            </div> */}
            {/* <div className="mb-4">
              <label className="block font-semibold text-white mb-1">Cidade do Recebedor</label>
              <Field
                name="receiverCity"
                type="text"
                placeholder="Digite a cidade do recebedor"
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <ErrorMessage name="receiverCity" component="div" className="text-red-500 text-xs mt-1" />
            </div> */}
            <div className="mb-4">
              <label className="block font-semibold text-white mb-1">Descrição (opcional)</label>
              <Field
                name="transferDescription"
                as="textarea"
                rows={3}
                placeholder="Descrição opcional"
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <ErrorMessage name="transferDescription" component="div" className="text-red-500 text-xs mt-1" />
            </div>
            <div className="flex justify-end">
              <Button text="Avançar" color="bg-blue-600" hoverColor="bg-blue-700" type="submit" />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

// ---------- COMPONENTE DE RESUMO E ENVIO (Step de Revisão) ----------
interface ReviewStepProps {
  selectedTransferMethod: "banco" | "pix";
  formValues: TransferFormBancoValues | TransferFormPixValues;
  onSubmit: () => void;
}
const ReviewStep: React.FC<ReviewStepProps> = ({
  selectedTransferMethod,
  formValues,
  onSubmit,
}) => {
  if (selectedTransferMethod === "pix") {
    const pixValues = formValues as TransferFormPixValues;
    return (
      <div className="p-4 rounded-lg w-full max-w-md border bg-[#3B3B5A]">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Resumo da Transferência
        </h3>
        <p className="text-white">
          <strong>Método:</strong> Pix
        </p>
        <p className="text-white">
          <strong>Chave:</strong> {pixValues.pixAddressKey}
        </p>
        <p className="text-white">
          <strong>Tipo da Chave:</strong> {pixValues.pixAddressKeyType}
        </p>
        <p className="text-white">
          <strong>Valor:</strong> R${" "}
          {parseFloat(pixValues.transferValue).toFixed(2)}
        </p>
        <p className="text-white">
          <strong>Data do Pagamento:</strong>{" "}
          {pixValues.scheduleDate || "Não agendada"}
        </p>
        <p className="text-white">
          <strong>Recebedor:</strong> {pixValues.receiverName}
        </p>
        <p className="text-white">
          <strong>Cidade:</strong> {pixValues.receiverCity}
        </p>
        {pixValues.transferDescription && (
          <p className="text-white">
            <strong>Descrição:</strong> {pixValues.transferDescription}
          </p>
        )}
        <div className="flex justify-end mt-4 ">
          <Button
            text="Enviar"
            color="bg-green-600"
            hoverColor="bg-green-700"
            onClick={onSubmit}
          />
        </div>
      </div>
    );
  } else {
    const bankValues = formValues as TransferFormBancoValues;
    return (
      <div className="p-4 rounded-lg w-full max-w-md border bg-[#3B3B5A]">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Resumo da Transferência
        </h3>
        <p className="text-white">
          <strong>Método:</strong> Dados Bancários
        </p>
        <p className="text-white">
          <strong>Valor:</strong> R${" "}
          {parseFloat(bankValues.transferValue).toFixed(2)}
        </p>
        <p className="text-white">
          <strong>Instituição:</strong> {bankValues.institution}
        </p>
        <p className="text-white">
          <strong>Agência:</strong> {bankValues.agency}
        </p>
        <p className="text-white">
          <strong>Conta:</strong> {bankValues.accountNumber}
        </p>
        <p className="text-white">
          <strong>Dígito:</strong> {bankValues.accountDigitNumber}
        </p>
        <p className="text-white">
          <strong>Tipo de Conta:</strong> {bankValues.accountType}
        </p>
        <p className="text-white">
          <strong>Nome do Destinatário:</strong> {bankValues.recipientName}
        </p>
        <p className="text-white">
          <strong>CPF/CNPJ:</strong>{" "}
          {isValidCPF(bankValues.recipientCPF)
            ? formatCPF(bankValues.recipientCPF)
            : formatCNPJ(bankValues.recipientCPF)}
        </p>
        {bankValues.transferDescription && (
          <p className="text-white">
            <strong>Descrição:</strong> {bankValues.transferDescription}
          </p>
        )}
        <div className="flex justify-end mt-4">
          <Button
            text="Enviar"
            color="bg-green-600"
            hoverColor="bg-green-700"
            onClick={onSubmit}
          />
        </div>
      </div>
    );
  }
};

const TransferOptions: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [selectedTransferMethod, setSelectedTransferMethod] = useState<
    "banco" | "pix"
  >("banco");

  const [bankFormValues, setBankFormValues] = useState<TransferFormBancoValues>(
    {
      transferValue: "",
      institution: "",
      agency: "",
      accountNumber: "",
      accountDigitNumber: "",
      accountType: "CONTA_CORRENTE",
      recipientName: "",
      recipientCPF: "",
      transferDescription: "",
    }
  );

  const [pixFormValues, setPixFormValues] = useState<TransferFormPixValues>({
    transferValue: "",
    pixAddressKey: "",
    pixAddressKeyType: "EVP",
    scheduleDate: null,
    transferDescription: "",
    receiverName: "",
    receiverCity: "",
  });

  const [paymentError, setPaymentError] = useState<string>("");
  const [paymentSuccess, setPaymentSuccess] = useState<string>("");
  const token = localStorage.getItem("token") || "SUA_API_TOKEN_AQUI";

  const handleMethodSelect = (method: "banco" | "pix") => {
    setSelectedTransferMethod(method);
  };

  const handleFormSubmit = (
    values: TransferFormBancoValues | TransferFormPixValues
  ) => {
    if (selectedTransferMethod === "banco") {
      setBankFormValues(values as TransferFormBancoValues);
    } else {
      setPixFormValues(values as TransferFormPixValues);
    }
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    let payload: any = {};
    if (selectedTransferMethod === "banco") {
      payload = {
        operationType: "TED",
        value: parseFloat(bankFormValues.transferValue),
        bankAccount: {
          ownerName: bankFormValues.recipientName,
          cpfCnpj: removeFormatting(bankFormValues.recipientCPF),
          agency: removeFormatting(bankFormValues.agency),
          account: removeFormatting(bankFormValues.accountNumber),
          accountDigit: removeFormatting(bankFormValues.accountDigitNumber),
          bankAccountType: bankFormValues.accountType,
          bank: {
            code: removeFormatting(bankFormValues.institution),
          },
        },
        description: bankFormValues.transferDescription,
      };
    } else {
      payload = {
        value: parseFloat(pixFormValues.transferValue),
        pixAddressKey:
          pixFormValues.pixAddressKeyType === "EVP"
            ? pixFormValues.pixAddressKey
            : removeFormatting(pixFormValues.pixAddressKey),
        pixAddressKeyType: pixFormValues.pixAddressKeyType,
        scheduleDate: pixFormValues.scheduleDate,
        description: pixFormValues.transferDescription,
        receiverName: pixFormValues.receiverName,
        receiverCity: pixFormValues.receiverCity,
      };
    }

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_PAYOUT_TRANSFERS_URL ||
          "https://67.205.164.128/payout/transfers",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (![200, 201].includes(response.status)) {
        throw new Error("Erro ao processar transferência.");
      }
      setPaymentSuccess("Transferência realizada com sucesso!");
      setTimeout(() => {
        // Redirecione ou feche o modal conforme necessário
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao enviar transferência:", error);
      setPaymentError("Erro ao processar transferência. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-[60rem]  p-6 ">
      {step === 1 && (
        <div className="p-4 rounded-lg justify-center flex flex-col  border border-purple-500 ">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Como você quer transferir?
          </h3>
          <div className="flex gap-4 mb-4">
            <div
              className={`p-4 border rounded-lg w-1/2 cursor-pointer ${
                selectedTransferMethod === "pix"
                  ? "border-purple-300 bg-purple-700"
                  : "bg-[#1E1E2F]"
              }`}
              onClick={() => handleMethodSelect("pix")}
            >
              <p className="font-semibold text-white">Enviar Pix com chave</p>
              <p className="text-sm text-gray-300">
                Transfira via Pix usando CPF/CNPJ, e-mail, celular ou chave
                aleatória.
              </p>
            </div>
            <div
              className={`p-4 border rounded-lg w-1/2 cursor-pointer ${
                selectedTransferMethod === "banco"
                  ? "border-purple-300 bg-purple-700"
                  : "bg-[#1E1E2F]"
              }`}
              onClick={() => handleMethodSelect("banco")}
            >
              <p className="font-semibold text-white">
                Transferir por dados bancários
              </p>
              <p className="text-sm text-gray-300">
                Se não possui a chave Pix, preencha os dados bancários.
              </p>
            </div>
          </div>
          {selectedTransferMethod === "banco" ? (
            <StepBanco
              initialValues={bankFormValues}
              onSubmit={handleFormSubmit}
            />
          ) : (
            <StepPix
              initialValues={pixFormValues}
              onSubmit={handleFormSubmit}
            />
          )}
        </div>
      )}
      {step === 2 && (
        <>
          <ReviewStep
            selectedTransferMethod={selectedTransferMethod}
            formValues={
              selectedTransferMethod === "banco"
                ? bankFormValues
                : pixFormValues
            }
            onSubmit={handleSubmit}
          />
          <div className="flex gap-6 mt-6">
            <Button
              text="Voltar"
              color="bg-[#8E38A6]"
              hoverColor="bg-[#A644CB]"
              onClick={handleBack}
            />
          </div>
        </>
      )}
      {paymentError && (
        <span className="block text-red-500 mt-2 truncate">{paymentError}</span>
      )}
      {paymentSuccess && (
        <span className="block text-green-500 mt-2 truncate">
          {paymentSuccess}
        </span>
      )}
    </div>
  );
};

export default TransferOptions;
