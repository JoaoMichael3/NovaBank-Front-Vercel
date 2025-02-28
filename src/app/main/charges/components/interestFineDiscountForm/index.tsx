"use client";

import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import CustomInput from "@/components/input";
import CustomSelect from "@/components/select";
import { formatToPercentage, formatCurrency } from "@/utils/utils";

const discountDeadlineOptions = {
  "7 dias": "7 dias",
  "15 dias": "15 dias",
  "30 dias": "30 dias",
};

const validationSchema = Yup.object({
  interest: Yup.object({
    value: Yup.string().required("O valor do juros é obrigatório"),
  }),
  fine: Yup.object({
    type: Yup.string().required("O tipo de multa é obrigatório"),
    value: Yup.string().required("O valor da multa é obrigatório"),
  }),
  discount: Yup.object({
    type: Yup.string().required("O tipo de desconto é obrigatório"),
    value: Yup.string().required("O valor do desconto é obrigatório"),
  }),
  discountDeadline: Yup.string().required(
    "O prazo máximo do desconto é obrigatório"
  ),
});

const InterestFineDiscountForm: React.FC = () => {
  return (
    <Formik
      initialValues={{
        interest: { value: "" },
        fine: { type: "fixed", value: "" },
        discount: { type: "fixed", value: "" },
        discountDeadline: "",
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        ;
      }}
    >
      {({ setFieldValue, values }) => {
        const interestValue = values.interest?.value
          ? (parseFloat(values.interest.value.replace(",", ".")) / 100).toFixed(2)
          : "0,00";

        const fineValue = values.fine?.value
          ? values.fine.type === "percent"
            ? (parseFloat(values.fine.value.replace(",", ".")) / 100).toFixed(2)
            : parseFloat(values.fine.value.replace(/\D/g, ""))
          : "0,00";

        const discountValue = values.discount?.value
          ? values.discount.type === "percent"
            ? (parseFloat(values.discount.value.replace(",", ".")) / 100).toFixed(2)
            : parseFloat(values.discount.value.replace(/\D/g, ""))
          : "0,00";

        return (
          <div className="flex justify-center items-center">
            <Form className="w-full py-5 gap-x-10 rounded-md shadow-md">
              <div className="w-full flex justify-start mb-6 h-10 border-l-8 items-center border-[#9D54BD] border-solid">
                <p className="text-[#ddd] font-roboto text-[26px] ml-3 font-semibold">Juros, multa e desconto</p>
              </div>
              <div className="grid gap-x-8 gap-y-2 ">
                <div className="col-span-1">
                  {/* Juros */}
                  <div className="flex flex-col w-full">
                    <CustomInput
                      name="interest.value"
                      type="text"
                      label="Juros (%)"
                      placeholder="0,00"
                      aria-label="Juros"
                      required
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFieldValue("interest.value", formatToPercentage(e.target.value))
                      }
                      value={values.interest?.value || ""}
                    />
                    <span className="text-[#9D54BD] text-sm font-roboto -mt-5">{`R$ ${interestValue}`}</span>
                  </div>

                  {/* Tipo de Multa */}
                  <div className="flex flex-col w-full mt-4">
                    <CustomSelect
                      name="fine.type"
                      label="Tipo de Multa"
                      ariaLabel="Tipo de Multa"
                      options={{ fixed: "Fixo", percent: "Percentual" }}
                      required
                      value={values.fine?.type}
                      onChange={(e) => {
                        setFieldValue("fine.type", e.target.value);
                      }}
                    />
                  </div>

                  {/* Multa (Valor Fixo) */}
                  <div className="flex flex-col w-full mt-4">
                    {values.fine?.type === "fixed" && (
                      <CustomInput
                        name="fine.value"
                        type="text"
                        label="Multa (Valor Fixo)"
                        placeholder="0,00"
                        aria-label="Multa Fixa"
                        required
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFieldValue("fine.value", formatCurrency(e.target.value))
                        }
                        value={values.fine?.value || ""}
                        prefix="R$"
                      />
                    )}
                    {values.fine?.type === "percent" && (
                      <CustomInput
                        name="fine.value"
                        type="text"
                        label="Multa (%)"
                        placeholder="0,00"
                        aria-label="Multa Percentual"
                        required
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFieldValue("fine.value", formatToPercentage(e.target.value))
                        }
                        value={values.fine?.value || ""}
                        suffix="%"
                      />
                    )}
                    <span className="text-[#9D54BD] font-roboto text-sm -mt-5">{`R$ ${fineValue}`}</span>
                  </div>

                  {/* Desconto (Valor Fixo) */}
                  <div className="flex flex-col w-full mt-4">
                    <CustomSelect
                      name="discount.type"
                      ariaLabel="Tipo de Desconto"
                      options={{ fixed: "Fixo", percent: "Percentual" }}
                      required
                      value={values.discount?.type}
                      onChange={(e) => {
                        setFieldValue("discount.type", e.target.value);
                      }}
                    />
                    {values.discount?.type === "fixed" && (
                      <CustomInput
                        name="discount.value"
                        type="text"
                        label="Desconto (Valor Fixo)"
                        placeholder="0,00"
                        aria-label="Desconto Fixo"
                        required
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFieldValue("discount.value", formatCurrency(e.target.value))
                        }
                        value={values.discount?.value || ""}
                        prefix="R$"
                      />
                    )}
                    {values.discount?.type === "percent" && (
                      <CustomInput
                        name="discount.value"
                        type="text"
                        label="Desconto (%)"
                        placeholder="0,00"
                        aria-label="Desconto Percentual"
                        required
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFieldValue("discount.value", formatToPercentage(e.target.value))
                        }
                        value={values.discount?.value || ""}
                        suffix="%"
                      />
                    )}
                    <span className="text-[#9D54BD] font-roboto text-sm -mt-5">{`R$ ${discountValue}`}</span>
                  </div>
                </div>
              </div>

            </Form>
          </div>
        );
      }}
    </Formik>
  );
};

export default InterestFineDiscountForm;
