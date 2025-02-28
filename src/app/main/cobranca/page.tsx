"use client";

import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import CustomInput from "@/components/input";
import CustomSelect from "@/components/select";
import CustomTextarea from "@/components/textArea";
import Button from "@/components/button";
import Credito from "@/app/main/cobranca/credito";
import Pix from "@/app/main/cobranca/pix";
import Boleto from "@/app/main/cobranca/boleto";

// Validação do formulário com Yup
const validationSchema = Yup.object().shape({
  paymentMethod: Yup.string().required("Selecione uma forma de pagamento"),
  value: Yup.number().required("Insira um valor válido"),
  dueDate: Yup.date().required("Insira uma data válida"),
  interest: Yup.number().required("Insira um valor de juros"),
  fineValue: Yup.number().required("Insira um valor de multa"),
  discountValue: Yup.number().required("Insira um valor de desconto"),
});

const billingTypeOptions = {
  CREDIT_CARD: "Cartão de Crédito",
  PIX: "Pix",
  BOLETO: "Boleto",
};

const fineTypeOptions = {
  fixed: "Fixo",
  percent: "Percentual",
};

const discountTypeOptions = {
  fixed: "Fixo",
  percent: "Percentual",
};

const Cobranca: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fineType, setFineType] = useState<"fixed" | "percent">("percent");
  const [discountType, setDiscountType] = useState<"fixed" | "percent">(
    "percent"
  );

  const handleButtonClick = (option: string) => {
    setSelectedOption(option);
  };

  const handleFineTypeChange = (type: "fixed" | "percent") => {
    setFineType(type);
  };

  const handleDiscountTypeChange = (type: "fixed" | "percent") => {
    setDiscountType(type);
  };

  return (
    <div className="flex justify-center items-center ">
      <div className="w-full max-w-3xl p-8 rounded-lg shadow-md">
        <div className="mt-16 flex items-center mb-10">
          <span className="lg:h-10 h-8 text-transparent flex items-center bg-[#A644CB]">
            |
          </span>
          <p className="text-white lg:text-[1.5rem] text-[1.2rem] flex justify-center mt-2 ml-2">
            Criar cobrança
          </p>
        </div>
        <Formik
          initialValues={{
            paymentMethod: "",
            value: "",
            dueDate: "",
            interest: "",
            fineValue: "",
            fineType: "percent",
            discountValue: "",
            discountType: "percent",
            description: "",
            printInvoice: false,
            postalService: false,
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            
          }}
        >
          {({ setFieldValue, values }) => (
            <Form>
              <div className="flex flex-wrap text-xs md:flex-nowrap w-full gap-x-6 justify-between">
                <CustomSelect
                  name="paymentMethod"
                  label="Forma de Pagamento"
                  options={billingTypeOptions}
                  required
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const value = e.target.value;
                    setFieldValue("paymentMethod", value);
                    handleButtonClick(value.toLowerCase());
                  }}
                />

                <CustomInput
                  name="value"
                  label="Valor da Cobrança"
                  placeholder="Digite o valor"
                  required
                />

                <CustomInput
                  name="dueDate"
                  label="Data de Vencimento"
                  type="date"
                  required
                />
              </div>

              {/* Juros ao Mês */}
              <div className="flex flex-col flex-wrap text-xs md:flex-nowrap w-full gap-x-6 mt-4">
                <CustomInput
                  name="interest"
                  label="Juros ao mês (%)"
                  placeholder="Digite o valor de juros"
                  required
                />
              </div>

              {/* Multa */}
              <div className="flex flex-col gap-y-3 mt-4">
                <div className="flex flex-wrap text-xs md:flex-nowrap w-full gap-x-6 justify-between">
                  <CustomSelect
                    name="fineType"
                    label="Tipo de Multa"
                    options={fineTypeOptions}
                    required
                    value={fineType}
                    onChange={(e) => {
                      handleFineTypeChange(
                        e.target.value as "fixed" | "percent"
                      );
                      setFieldValue("fineType", e.target.value);
                    }}
                  />

                  {fineType === "fixed" && (
                    <CustomInput
                      name="fineValue"
                      label="Multa (Valor Fixo)"
                      placeholder="Digite o valor da multa"
                      required
                    />
                  )}
                  {fineType === "percent" && (
                    <CustomInput
                      name="fineValue"
                      label="Multa (%)"
                      placeholder="Digite o valor da multa"
                      required
                    />
                  )}
                </div>
              </div>

              {/* Desconto */}
              <div className="flex flex-col gap-y-3 mt-4">
                <div className="flex flex-wrap text-xs md:flex-nowrap w-full gap-x-6 justify-between">
                  <CustomSelect
                    name="discountType"
                    label="Tipo de Desconto"
                    options={discountTypeOptions}
                    required
                    value={discountType}
                    onChange={(e) => {
                      handleDiscountTypeChange(
                        e.target.value as "fixed" | "percent"
                      );
                      setFieldValue("discountType", e.target.value);
                    }}
                  />

                  {discountType === "fixed" && (
                    <CustomInput
                      name="discountValue"
                      label="Desconto (Valor Fixo)"
                      placeholder="Digite o valor do desconto"
                      required
                    />
                  )}
                  {discountType === "percent" && (
                    <CustomInput
                      name="discountValue"
                      label="Desconto (%)"
                      placeholder="Digite o valor do desconto"
                      required
                    />
                  )}
                </div>
              </div>

              {/* Descrição */}
              <div className="mt-4">
                <CustomTextarea
                  name="description"
                  label="Descrição da Cobrança (Opcional)"
                  placeholder="A descrição será impressa na fatura"
                  ariaLabel="Descrição da Cobrança"
                />
              </div>

              {/* Checkboxes para Impressão e Correios */}
              <div className="flex flex-wrap gap-x-6 mt-4">
                <CustomInput
                  name="printInvoice"
                  type="checkbox"
                  label="Quero imprimir esta cobrança"
                />
                <CustomInput
                  name="postalService"
                  type="checkbox"
                  label="Quero enviar esta cobrança via Correios"
                />
              </div>

              {/* Exibição dos campos de pagamento específicos
              <div className="mt-8">
                {selectedOption === "credito" && <Credito />}
                {selectedOption === "pix" && <Pix />}
                {selectedOption === "boleto" && <Boleto />}
              </div> */}

              {/* Botão para submeter */}
              <div className="mt-6">
                <Button
                  type="submit"
                  text="Criar Cobrança"
                  color="bg-purple-600"
                  hoverColor="hover:bg-purple-700"
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Cobranca;
