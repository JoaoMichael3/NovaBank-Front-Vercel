import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Button from "@/components/button";
import CustomInput from "@/components/input";
import CustomTextarea from "@/components/textArea";
import CustomSelect from "@/components/select";
import Link from "next/link";
import { formatCurrency } from "@/utils/utils";

const paymentOptions = {
  Pix: "PIX",
  Boleto: "BOLETO",
  "Cartão de Crédito": "CREDIT_CARD",
};

const validationSchema = Yup.object({
  value: Yup.string().required("O valor da cobrança é obrigatório"),
  firstPaymentDate: Yup.date().required("A data de vencimento é obrigatória"),
  paymentMethod: Yup.string().required("A forma de pagamento é obrigatória"),
  description: Yup.string(),
});

const ChargeDetailsSection: React.FC = () => {
  return (
    <section className="border border-solid border-[#858585] m-5 p-5 rounded-lg ">
      <div className="w-full flex flex-col ">
        <div className="w-full flex justify-start mb-6 h-10 border-l-8 items-center border-[#9D54BD] border-solid">
          <p className="text-[#ddd] font-roboto text-[26px] ml-3 font-semibold">Dados da Cobrança</p>
        </div>
        <ul className="flex flex-col gap-3 items-start w-full md:flex-row md:justify-center md:gap-4 border-b border-solid border-gray-500  pb-5">
          <li className="w-full ">
            <Button
              text="Editar"
              color="bg-gray-600"
              hoverColor="hover:bg-gray-500"
              type="button"
              
            />
          </li>
          <li className="w-full">
            <Button
              text="Compartilhar"
              color="bg-gray-600"
              hoverColor="hover:bg-gray-500"
              type="button"
            />
          </li>
          <li className="w-full">
            <Button
              text="Estornar cobrança"
              color="bg-gray-600"
              hoverColor="hover:bg-gray-500"
              type="button"
            />
          </li>
          <li className="w-full">
            <Button
              text="Visualizar fatura"
              color="bg-gray-600"
              hoverColor="hover:bg-gray-500"
              type="button"
            />
          </li>
        </ul>
      </div>

      <div className="flex flex-col items-center justify-center  gap-3">
       
          <div className="flex flex-col items-center justify-center gap-6 my-5">
            <ul className="grid  grid-cols-2 lg:grid-cols-4 gap-6  w-full">
              <li className="w-auto">
                <h2 className="font-roboto mb-1  text-[12px] text-[#ddd]">Situação</h2>
                <p className="font-roboto  text-[13px]  text-yellow-400">Aguardando Pagamento</p>
              </li>
              <li className="w-auto">
                <h2 className="font-roboto mb-1  text-[12px] text-[#9D54BD]">Criada em</h2>
                <p className="font-roboto  text-[12px] text-[#ddd]">29/08/2024</p>
              </li>
              <li className="w-auto">
                <h2 className="font-roboto mb-1  text-[13px] text-[#9D54BD]">Cliente</h2>
                <p className="font-roboto  text-[13px] text-[#ddd]">John Doe Updated</p>
              </li>
              <li className="w-auto">
                <h2 className="font-roboto mb-1  text-[13px] text-[#9D54BD]">Número da fatura</h2>
                <p className="font-roboto  text-[13px] text-[#ddd]">
                  06386230 -{" "}
                  <span className="text-blue-500 text-[12px]">
                    <Link href="#">Visualizar fatura</Link>
                  </span>
                </p>
              </li>
            </ul>
          </div>
          <ul className="flex flex-col lg:flex-row gap-4 items-center w-full justify-center my-8">
            <li className="w-full lg:w-auto">
              <Button
                text="Ativar Negativação"
                color="bg-gray-600"
                hoverColor="hover:bg-gray-500"
                type="button"
              />
            </li>
            <li className="w-full lg:w-auto">
              <Button
                text="Ativar Antecipação"
                color="bg-gray-600"
                hoverColor="hover:bg-gray-500"
                type="button"
              />
            </li>
            <li className="w-full lg:w-auto">
              <Button
                text="Enviar por Correios"
                color="bg-gray-600"
                hoverColor="hover:bg-gray-500"
                type="button"
              />
            </li>
          </ul>
       
        <div className="w-full">
          <Formik
            initialValues={{
              value: "",
              firstPaymentDate: "",
              paymentMethod: "",
              description: "",
              installmentCount: 1,
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
           
            }}
          >
            {({ setFieldValue }) => (
              <Form className="flex flex-col lg:grid lg:grid-cols-2 gap-5">
                <div className="flex flex-col w-full">
                  <CustomInput
                    name="value"
                    type="text"
                    label="Valor da Cobrança"
                    placeholder="100,00"
                    aria-label="Valor da Cobrança"
                    required
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const formattedValue = formatCurrency(e.target.value);
                      setFieldValue("value", formattedValue);
                    }}
                  />
                </div>

                <div className="flex flex-col w-full">
                  <CustomInput
                    name="firstPaymentDate"
                    label="Vencimento da 1ª parcela"
                    type="date"
                    aria-label="Vencimento da 1ª parcela"
                    required
                  />
                </div>

                <div className="flex flex-col w-full">
                  <CustomSelect
                    name="paymentMethod"
                    label="Forma de Pagamento"
                    options={paymentOptions}
                    required
                  />
                </div>


                <div className="flex flex-col w-full">
                  <CustomTextarea
                    name="description"
                    label="Descrição da cobrança (Opcional)"
                    placeholder="A descrição informada será impressa na fatura."
                    ariaLabel="Descrição da cobrança (Opcional)"
                  />
                </div>

                <div className="flex justify-center gap-3 col-span-2 mt-4">
                  <button
                    type="submit"
                    className="bg-[#9D54BD] text-white font-roboto text-xs px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    className="bg-[#9D54BD] text-white font-roboto text-xs px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="bg-[#bf0808dd] text-white font-roboto text-xs px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Excluir
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

      </div>
    </section>
  );
};

export default ChargeDetailsSection;
