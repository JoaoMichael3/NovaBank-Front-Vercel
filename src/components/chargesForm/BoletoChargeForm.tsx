"use client";

import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { addBusinessDays, format, isBefore } from "date-fns";

interface BoletoChargeFormProps {
  addToast: (message: string, type: "success" | "error" | "info") => void;
}

const boletoValidationSchema = Yup.object().shape({
  customer: Yup.string().required("Cliente (ID) é obrigatório"),
  value: Yup.string()
    .required("Valor é obrigatório")
    .matches(/^R\$\s\d{1,3}(\.\d{3})*,\d{2}$/, "Formato de valor inválido"),
  description: Yup.string().max(500, "Descrição pode ter no máximo 500 caracteres"),
  dueDate: Yup.date()
    .required("Data de vencimento é obrigatória")
    .test(
      "is-valid-date",
      "A data de vencimento deve estar entre hoje e 30 dias úteis à frente.",
      (value) => {
        if (!value) return false;
        const today = new Date();
        const maxDate = addBusinessDays(today, 30);
        return !isBefore(value, today) && !isBefore(maxDate, value);
      }
    ),
  installmentCount: Yup.number()
    .required("Número de parcelas é obrigatório")
    .min(1, "Mínimo de 1 parcela")
    .max(12, "Máximo de 12 parcelas"),
});

const formatCurrency = (value: string) => {
  const numericValue = value.replace(/\D/g, "");
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parseFloat(numericValue) / 100);
};

const BoletoChargeForm: React.FC<BoletoChargeFormProps> = ({ addToast }) => {
  const handleSubmit = async (values: any, { resetForm }: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      addToast("Token de autenticação não encontrado. Faça login.", "error");
      return;
    }

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_CREATE_CHARGES_URL!,
        {
          customer: values.customer,
          billingType: "BOLETO",
          value: parseFloat(values.value.replace(/[^\d,]/g, "").replace(",", ".")),
          description: values.description,
          dueDate: values.dueDate,
          installmentCount: values.installmentCount,
          totalValue: parseFloat(values.value.replace(/[^\d,]/g, "").replace(",", ".")),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        addToast("Cobrança no Boleto criada com sucesso!", "success");
        resetForm();
      } else {
        throw new Error("Erro ao criar a cobrança.");
      }
    } catch (error) {
      console.error(error);
      addToast("Erro ao criar a cobrança.", "error");
    }
  };

  return (
    <Formik
      initialValues={{
        customer: "",
        value: "R$ 0,00",
        description: "",
        dueDate: format(new Date(), "yyyy-MM-dd"),
        installmentCount: 1,
      }}
      validationSchema={boletoValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue, errors, touched, values }) => (
        <Form className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            Cliente (ID):
            <Field name="customer" className="p-2 rounded bg-gray-800 text-white" />
            {errors.customer && touched.customer && (
              <span className="text-red-500 text-sm">{errors.customer}</span>
            )}
          </label>

          <label className="flex flex-col gap-1">
            Valor:
            <Field
              name="value"
              type="text"
              className="p-2 rounded bg-gray-800 text-white"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFieldValue("value", formatCurrency(e.target.value))
              }
            />
            {errors.value && touched.value && (
              <span className="text-red-500 text-sm">{errors.value}</span>
            )}
          </label>

          <label className="flex flex-col gap-1">
            Descrição:
            <Field name="description" as="textarea" className="p-2 rounded bg-gray-800 text-white" />
          </label>

          <label className="flex flex-col gap-1">
            Número de Parcelas:
            <Field
              as="select"
              name="installmentCount"
              className="p-2 rounded bg-gray-800 text-white"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setFieldValue("installmentCount", e.target.value);
              }}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const installmentNumber = i + 1;
                const rawValue = values.value.replace(/[^\d,]/g, "").replace(",", ".");
                const baseValue = parseFloat(rawValue) || 0;
                const installmentValue = (baseValue / installmentNumber).toFixed(2);

                return (
                  <option key={installmentNumber} value={installmentNumber}>
                    {`${installmentNumber}x R$ ${installmentValue.replace(".", ",")}`}
                  </option>
                );
              })}
            </Field>
          </label>

          <label className="flex flex-col gap-1">
            Data de Vencimento:
            <Field
              name="dueDate"
              type="date"
              className="p-2 rounded bg-gray-800 text-white"
              min={format(new Date(), "yyyy-MM-dd")}
              max={format(addBusinessDays(new Date(), 30), "yyyy-MM-dd")}
            />
            {errors.dueDate && touched.dueDate && (
              <span className="text-red-500 text-sm">{errors.dueDate}</span>
            )}
          </label>

          <button
            type="submit"
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
          >
            Criar Cobrança no Crédito
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default BoletoChargeForm;
