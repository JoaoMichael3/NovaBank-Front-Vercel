"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { resetPassword } from "@/utils/api";
import Button from "@/components/button";
import { isStrongPassword } from "@/utils/validations";

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setErrorMessage(
        "A senha deve conter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um símbolo."
      );
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword(token, newPassword);
      setSuccessMessage("Senha redefinida com sucesso! Redirecionando para o login...");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Erro ao redefinir a senha. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#151515] text-white">
      <div className="flex flex-col items-center w-full max-w-md bg-[#202020] p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl text-white mb-4">Redefinir Senha</h1>
        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded-md"
            required
          />
          <input
            type="password"
            placeholder="Confirme a nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded-md"
            required
          />
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
          {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
          <Button
            type="submit"
            text={isLoading ? "Carregando..." : "Redefinir Senha"}
            color="bg-[#A644CB]"
            hoverColor="hover:bg-[#8E38A6]"
            disabled={isLoading}
          />
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
