"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { verifyEmail } from "@/utils/api";

const VerifyEmailPage = () => {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [timer, setTimer] = useState(5);

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        if (!token) return;
        await verifyEmail(token);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    };

    verifyUserEmail();
  }, [token]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (status === "success") {
      intervalId = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            router.push("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#151515] text-white">
        <h2 className="mb-4 text-2xl">Verificando seu email...</h2>
        <p>Aguarde enquanto verificamos sua conta.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#151515] text-white">
        <h2 className="mb-4 text-2xl">Falha na verificação</h2>
        <p>Não foi possível verificar seu email. Tente novamente ou entre em contato com o suporte.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#151515] text-white">
      <h2 className="mb-2 text-2xl">Email verificado com sucesso!</h2>
      <p className="mb-4">
        Você será redirecionado para a página de login em {timer} segundo{timer !== 1 && "s"}.
      </p>
      <p>
        Ou clique{" "}
        <button
          className="text-[#A644CB] underline"
          onClick={() => router.push("/login")}
        >
          aqui
        </button>{" "}
        para ir ao login agora.
      </p>
    </div>
  );
};

export default VerifyEmailPage;
