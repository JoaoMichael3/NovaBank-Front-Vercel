"use client";

import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { addBusinessDays, isBefore, isAfter, format } from "date-fns";

interface PixChargeFormProps {
  addToast: (message: string, type: "success" | "error" | "info") => void;
}


const today = new Date();
const minDueDate = today; 
const maxDueDate = addBusinessDays(today, 30);

const pixValidationSchema = Yup.object().shape({
  customer: Yup.string().required("Cliente (ID) é obrigatório"),
  value: Yup.string()
    .required("Valor é obrigatório")
    .matches(/^R\$\s\d{1,3}(\.\d{3})*,\d{2}$/, "Formato de valor inválido"),
  description: Yup.string()
    .required("Descrição é obrigatória")
    .max(500, "Descrição pode ter no máximo 500 caracteres"),
  dueDate: Yup.date()
    .required("Data de vencimento é obrigatória")
    .test(
      "is-valid-date",
      "A data de vencimento deve estar entre hoje e 30 dias úteis à frente.",
      (value) => {
        if (!value) return false;
        return !isBefore(value, minDueDate) && !isAfter(value, maxDueDate);
      }
    ),
});

const formatCurrency = (value: string) => {
  const numericValue = value.replace(/\D/g, "");
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parseFloat(numericValue) / 100);
};

const PixChargeForm: React.FC<PixChargeFormProps> = ({ addToast }) => {
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
          billingType: "PIX",
          value: parseFloat(
            values.value.replace(/[^\d,]/g, "").replace(",", ".")
          ),
          description: values.description,
          dueDate: values.dueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        addToast("Cobrança PIX criada com sucesso!", "success");
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
        dueDate: format(minDueDate, "yyyy-MM-dd"), 
      }}
      validationSchema={pixValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue, errors, touched }) => (
        <Form className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            Cliente (ID):
            <Field
              name="customer"
              className="p-2 rounded bg-gray-800 text-white"
            />
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
            <Field
              name="description"
              as="textarea"
              className="p-2 rounded bg-gray-800 text-white"
            />
            {errors.description && touched.description && (
              <span className="text-red-500 text-sm">{errors.description}</span>
            )}
          </label>

          <label className="flex flex-col gap-1">
            Data de Vencimento:
            <Field
              name="dueDate"
              type="date"
              className="p-2 rounded bg-gray-800 text-white"
              min={format(minDueDate, "yyyy-MM-dd")}
              max={format(maxDueDate, "yyyy-MM-dd")}
            />
            {errors.dueDate && touched.dueDate && (
              <span className="text-red-500 text-sm">{errors.dueDate}</span>
            )}
          </label>

          <button
            type="submit"
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
          >
            Criar Cobrança PIX
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default PixChargeForm;
