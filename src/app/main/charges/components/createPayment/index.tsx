"use client";

import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import CustomInput from "@/components/input";
import CustomSelect from "@/components/select";
import CustomTextarea from "@/components/textArea";
import Button from "@/components/button";
import { formatCurrency, generateInstallmentOptions } from "@/utils/utils";

interface Fine {
  value: string;
  type: "fixed" | "percent";
}

interface Discount {
  value: string;
  dueDateLimitDays: number;
  type: "fixed" | "percent";
}

interface FormValues {
  customer: string;
  billingType: "PIX" | "BOLETO" | "CREDIT_CARD";
  value: string;
  dueDate: string;
  description: string;
  installmentCount: number;
  fine: Fine;
  discount: Discount;
  postalService: boolean;
  printInvoice: boolean;
}

const CreateCharges: React.FC = () => {
  const [installmentOptions, setInstallmentOptions] = useState<
    Record<string, string>
  >({});
  const [isInstallmentEnabled, setIsInstallmentEnabled] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<FormValues | null>(null);

  const billingTypeOptions: Record<"PIX" | "BOLETO" | "CREDIT_CARD", string> = {
    PIX: "Pix",
    BOLETO: "Boleto",
    CREDIT_CARD: "Cartão de Crédito",
  };

  const validationSchema = Yup.object().shape({
    customer: Yup.string().required("Cliente é obrigatório"),
    billingType: Yup.mixed<"PIX" | "BOLETO" | "CREDIT_CARD">()
      .oneOf(["PIX", "BOLETO", "CREDIT_CARD"], "Forma de pagamento inválida")
      .required("Forma de pagamento é obrigatória"),
    value: Yup.string().required("Valor é obrigatório"),
    dueDate: Yup.date().required("Data de vencimento é obrigatória"),
    description: Yup.string().max(500, "Máximo de 500 caracteres"),
  });

  useEffect(() => {
    if (summary?.value && summary.billingType !== "PIX") {
      setIsInstallmentEnabled(true);
      const options = generateInstallmentOptions(summary.value);
      setInstallmentOptions(options);
    } else {
      setIsInstallmentEnabled(false);
    }
  }, [summary?.value, summary?.billingType]);
  return (
    <Formik
      initialValues={{
        customer: "",
        billingType: "PIX",
        value: "",
        dueDate: "",
        description: "",
        installmentCount: 1,
        fine: {
          value: "",
          type: "percent",
        },
        discount: {
          value: "",
          dueDateLimitDays: 0,
          type: "percent",
        },
        postalService: false,
        printInvoice: false,
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        const formattedValues: FormValues = {
          ...values,
          fine: {
            ...values.fine,
            type: values.fine.type as "fixed" | "percent",
          },
          discount: {
            ...values.discount,
            type: values.discount.type as "fixed" | "percent",
          },
          billingType: values.billingType as "PIX" | "BOLETO" | "CREDIT_CARD",
        };

        setIsLoading(true);
        setTimeout(() => {
          setSummary(formattedValues);
          setIsLoading(false);
        }, 1000);
      }}
    >
      {({ setFieldValue, values }) => (
        <Form className="p-10">
          <div className="border-l-4 pl-2 text-2xl lg:text-[30px] border-[#A644CB] text-[#ddd] mb-5">
            Criar um novo pagamento
          </div>
          <div className="flex flex-wrap gap-6">
            <CustomInput
              name="customer"
              label="Cliente"
              placeholder="Digite o identificador do cliente"
              required
            />
            <CustomSelect
              name="billingType"
              label="Forma de pagamento"
              options={billingTypeOptions}
              required
              onChange={(e) =>
                setFieldValue(
                  "billingType",
                  e.target.value as "PIX" | "BOLETO" | "CREDIT_CARD"
                )
              }
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <CustomInput
              name="value"
              label="Valor da Cobrança"
              placeholder="100,00 R$"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const formattedValue = formatCurrency(e.target.value);
                setFieldValue("value", formattedValue);
              }}
              required
            />
            <CustomInput
              name="dueDate"
              label="Data de Vencimento"
              type="date"
              required
            />
          </div>

          {isInstallmentEnabled && (
            <CustomSelect
              name="installmentCount"
              label="Número de Parcelas"
              options={installmentOptions}
              required
              onChange={(e) => setFieldValue("installmentCount", e.target.value)}
            />
          )}

          <CustomTextarea
            name="description"
            label="Descrição da cobrança (Opcional)"
            placeholder="Máximo de 500 caracteres"
          />

          <Button
            type="submit"
            color="bg-[#A644CB]"
            hoverColor="hover:bg-[#8E38A6]"
            text="Criar Pagamento"
          />
        </Form>
      )}
    </Formik>
  );
};

export default CreateCharges;
