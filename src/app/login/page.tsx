"use client";
import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CustomInput from "@/components/input";
import PersonIcon from "@/assets/icons/Profile.png";
import KeyLockIcon from "@/assets/icons/keyLock.png";
import Logo from "@/assets/images/logo.png";
import Apresentation from "@/components/apresentation";
import Button from "@/components/button";
import { login, verify2FA } from "@/utils/api";

const validationSchema = Yup.object({
  username: Yup.string()
    .min(4, "Username must be at least 4 characters long")
    .required("Username is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters long")
    .required("Password is required"),
});
const LoginPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"login" | "verify">("login");
  const [hash, setHash] = useState<string[]>(Array(8).fill(""));
  const [timer, setTimer] = useState(600);
  const router = useRouter();
  useEffect(() => {
    if (step === "verify") {
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setErrorMessage(
              "O tempo de verificação expirou. Faça login novamente."
            );
            setStep("login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [step]);
  const handleLoginSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    setIsLoading(true);
    setErrorMessage("");
    localStorage.clear();
    Cookies.remove("token");
    try {
      await login(values.username, values.password);
      setStep("verify");
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };
  const handleVerifySubmit = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const verificationHash = hash.join("");
      const data = await verify2FA(verificationHash);
      localStorage.setItem("token", data.accessToken);
      Cookies.set("token", data.accessToken, {
        path: "/",
        expires: 1,
        secure: true,
      });
      router.push("/main");
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };
  const handleHashChange = (
    index: number,
    value: string,
    inputs: HTMLInputElement[]
  ) => {
    const newHash = [...hash];
    const lastValue = value.slice(-1);
    if (lastValue.match(/[a-zA-Z0-9]/)) {
      newHash[index] = lastValue;
      setHash(newHash);
      if (inputs[index + 1]) inputs[index + 1].focus();
    } else if (!value) {
      newHash[index] = "";
      setHash(newHash);
      if (inputs[index - 1]) inputs[index - 1].focus();
    }
  };
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    inputs: NodeListOf<HTMLInputElement>
  ) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 8).split("");
    const newHash = [...hash];
    pasteData.forEach((char, i) => {
      if (char.match(/[a-zA-Z0-9]/) && i < newHash.length) {
        newHash[i] = char;
        if (inputs[i + 1]) inputs[i + 1].focus();
      }
    });
    setHash(newHash);
  };
  if (step === "verify") {
    return (
      <div className="min-h-screen w-full bg-[#151515] flex items-center justify-center">
        <div className="flex flex-col items-center w-full max-w-md bg-[#202020] p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl text-white">
            Digite o código de verificação
          </h1>
          <p className="text-sm text-gray-400 mb-4">
            Verifique sua caixa de entrada para o código de 8 caracteres. O
            tempo restante é {Math.floor(timer / 60)}:
            {timer % 60 < 10 ? `0${timer % 60}` : timer % 60}.
          </p>
          <div className="flex gap-1 sm:gap-2 mb-4">
            {hash.map((char, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={char}
                onChange={(e) =>
                  handleHashChange(
                    index,
                    e.target.value,
                    Array.from(
                      e.currentTarget.parentNode!.children
                    ) as HTMLInputElement[]
                  )
                }
                onPaste={(e) =>
                  handlePaste(
                    e,
                    e.currentTarget.parentNode!.querySelectorAll("input")
                  )
                }
                className="w-8 h-8 sm:w-10 sm:h-10 text-center bg-gray-700 text-white rounded-md"
              />
            ))}
          </div>
          <Button
            text={isLoading ? "Verificando..." : "Confirmar"}
            color="bg-[#A644CB]"
            hoverColor="hover:bg-[#8E38A6]"
            onClick={handleVerifySubmit}
            disabled={isLoading || hash.some((char) => !char)}
          />
          {errorMessage && (
            <p className="text-red-500 text-xs mt-4">{errorMessage}</p>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full bg-[#151515] flex">
      <div className="hidden lg:block lg:w-3/5">
        <Apresentation />
      </div>
      <article className="flex flex-col gap-y-4 items-center justify-center w-full lg:w-2/5 bg-[#151515]">
        <div className="max-w-[20%]">
          <Image src={Logo} alt="Logo" priority />
        </div>
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleLoginSubmit}
        >
          {() => (
            <Form className="flex flex-col gap-y-2 w-[80%] md:max-w-md lg:max-w-auto">
              <h2 className="text-sm text-left text-[#8A8A8A]">
                Use os campos para efetuar o login:
              </h2>
              <div className="flex flex-col gap-y-1">
                <CustomInput
                  name="username"
                  imageSrc={PersonIcon}
                  imageAlt="User Icon"
                  placeholder="Username"
                  ariaLabel="username"
                  required
                />
                <CustomInput
                  name="password"
                  imageSrc={KeyLockIcon}
                  imageAlt="Lock Icon"
                  type="password"
                  placeholder="Password"
                  ariaLabel="password"
                  required
                />
              </div>
              {errorMessage && (
                <div className="text-red-500 text-xs mt-2">{errorMessage}</div>
              )}
              <div className="flex items-end justify-end -mt-[20px] mb-10">
                <span className="text-xs mr-2 text-right text-white">
                  Esqueceu a senha?
                </span>
                <a className="text-[#A644CB]" href="/forgot-password">
                  Clique aqui!
                </a>
              </div>
              <Button
                type="submit"
                text={isLoading ? "Carregando..." : "Login"}
                color="bg-[#A644CB]"
                hoverColor="hover:bg-[#8E38A6]"
                disabled={isLoading}
              />
            </Form>
          )}
        </Formik>
      </article>
    </div>
  );
};
export default LoginPage;
