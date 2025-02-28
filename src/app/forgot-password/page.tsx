"use client";

import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import CustomInput from "@/components/input";
import { AiOutlineMail } from "react-icons/ai";
import Button from "@/components/button";
import { forgotPassword } from "@/utils/api";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Digite um email válido")
    .required("O email é obrigatório"),
});

const ForgotPage: React.FC = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: { email: string }) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await forgotPassword(values.email);

      if (response.status === 200) {
        setSuccessMessage(
          "O email foi enviado com sucesso, confira sua caixa de entrada!"
        );
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          "Erro ao enviar o email. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#151515] flex items-center justify-center">
      <div className="flex flex-col gap-y-4 items-center w-full max-w-md bg-[#202020] p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl text-white">Esqueci a senha</h1>
        <p className="text-sm text-gray-400">
          Insira seu email para receber instruções de redefinição de senha.
        </p>
        <Formik
          initialValues={{ email: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form className="flex flex-col gap-y-4 w-full">
              <article className="flex flex-col gap-3 mb-5">
                <div className="relative">
                  <CustomInput
                    name="email"
                    placeholder="Digite seu email"
                    ariaLabel="email"
                    required
                  />
                  <AiOutlineMail className="absolute right-3 top-3 text-gray-400" />
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                {successMessage && (
                  <p className="text-green-500 text-sm">{successMessage}</p>
                )}
                {errorMessage && (
                  <p className="text-red-500 text-sm">{errorMessage}</p>
                )}
              </article>

              <div className="flex items-end justify-start -mt-[20px] mb-10">
                <div>
                  <span className="text-xs mr-2 text-right text-white">
                    Para fazer Login,
                  </span>
                  <a className="text-[#A644CB]" href="/login">
                    Clique aqui!
                  </a>
                </div>
              </div>
              <Button
                type="submit"
                text={isLoading ? "Carregando..." : "Enviar"}
                color="bg-[#A644CB]"
                hoverColor={isLoading ? "" : "hover:bg-[#8E38A6]"}
                disabled={isLoading}
              />
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ForgotPage;
