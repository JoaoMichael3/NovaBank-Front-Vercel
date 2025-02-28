"use client";

import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import CustomInput from "@/components/input";
import Button from "@/components/button";

// Define a estrutura dos valores do formulário
export interface CreditCardFormValues {
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement: string;
    mobilePhone: string;
  };
}

// Valores iniciais
const initialValues: CreditCardFormValues = {
  creditCard: {
    holderName: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    ccv: "",
  },
  creditCardHolderInfo: {
    name: "",
    email: "",
    cpfCnpj: "",
    postalCode: "",
    addressNumber: "",
    addressComplement: "",
    mobilePhone: "",
  },
};

// Schema de validação com Yup
const validationSchema = Yup.object().shape({
  creditCard: Yup.object().shape({
    holderName: Yup.string().required("Nome do titular é obrigatório"),
    number: Yup.string()
      .matches(/^\d{16}$/, "O número do cartão deve ter 16 dígitos")
      .required("Número do cartão é obrigatório"),
    expiryMonth: Yup.string()
      .matches(/^(0?[1-9]|1[0-2])$/, "Mês de expiração inválido")
      .required("Mês de expiração é obrigatório"),
    expiryYear: Yup.string()
      .matches(/^\d{4}$/, "Ano de expiração deve ter 4 dígitos")
      .required("Ano de expiração é obrigatório"),
    ccv: Yup.string()
      .matches(/^\d{3,4}$/, "CCV inválido")
      .required("CCV é obrigatório"),
  }),
  creditCardHolderInfo: Yup.object().shape({
    name: Yup.string().required("Nome é obrigatório"),
    email: Yup.string().email("Email inválido").required("Email é obrigatório"),
    cpfCnpj: Yup.string().required("CPF/CNPJ é obrigatório"),
    postalCode: Yup.string().required("CEP é obrigatório"),
    addressNumber: Yup.string().required("Número do endereço é obrigatório"),
    addressComplement: Yup.string(),
    mobilePhone: Yup.string().required("Telefone é obrigatório"),
  }),
});

interface CreditCardFormProps {
  data: CreditCardFormValues;
  onSubmit: (values: CreditCardFormValues) => void;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({ data, onSubmit }) => {
  return (
    <div className="w-full max-w-md bg-gray-800 p-6 rounded-md">
      <h2 className="text-xl font-bold text-white mb-4">
        Pagamento com Cartão de Crédito
      </h2>
      <Formik
        initialValues={data || initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {() => (
          <Form className="flex flex-col gap-4">
            <h3 className="text-lg text-white">Dados do Cartão</h3>
            <CustomInput
              name="creditCard.holderName"
              placeholder="Nome do Titular"
              label="Titular do Cartão"
              required
            />
            <CustomInput
              name="creditCard.number"
              placeholder="Número do Cartão"
              label="Número do Cartão"
              required
              maxLength={16}
            />
            <div className="flex gap-2">
              <CustomInput
                name="creditCard.expiryMonth"
                placeholder="Mês"
                label="Mês de Expiração"
                required
                maxLength={2}
              />
              <CustomInput
                name="creditCard.expiryYear"
                placeholder="Ano"
                label="Ano de Expiração"
                required
                maxLength={4}
              />
              <CustomInput
                name="creditCard.ccv"
                placeholder="CCV"
                label="CCV"
                required
                maxLength={4}
              />
            </div>
            <h3 className="text-lg text-white">Dados do Titular</h3>
            <CustomInput
              name="creditCardHolderInfo.name"
              placeholder="Nome completo"
              label="Nome"
              required
            />
            <CustomInput
              name="creditCardHolderInfo.email"
              placeholder="exemplo@dominio.com"
              label="Email"
              required
            />
            <CustomInput
              name="creditCardHolderInfo.cpfCnpj"
              placeholder="CPF ou CNPJ"
              label="CPF/CNPJ"
              required
            />
            <CustomInput
              name="creditCardHolderInfo.postalCode"
              placeholder="CEP"
              label="CEP"
              required
              maxLength={8}
            />
            <CustomInput
              name="creditCardHolderInfo.addressNumber"
              placeholder="Número"
              label="Número do Endereço"
              required
            />
            <CustomInput
              name="creditCardHolderInfo.addressComplement"
              placeholder="Complemento (opcional)"
              label="Complemento"
            />
            <CustomInput
              name="creditCardHolderInfo.mobilePhone"
              placeholder="Telefone"
              label="Telefone"
              required
            />
            <Button type="submit" text="Pagar" color="bg-green-500" hoverColor="bg-green-700" />
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreditCardForm;
