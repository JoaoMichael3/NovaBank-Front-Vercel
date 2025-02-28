import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import notify from "@/assets/icons/notification.svg";
import foto from "@/assets/icons/user.svg";
import olhoAberto from "@/assets/icons/eyes.svg";
import olhoFechado from "@/assets/icons/eye-closed.svg";
import usuariosData from "@/utils/data/usuarios.json";
import notificationsData from "@/utils/data/notifications.json";

const Navbar: React.FC<{ onEmpresaChange: (empresa: any) => void }> = ({
  onEmpresaChange,
}) => {
  const [mostrarValor, setMostrarValor] = useState(true);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(
    usuariosData[0].nome_empresa
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [erroSaldo, setErroSaldo] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(notificationsData);

  const toggleMostrarValor = () => {
    setMostrarValor(!mostrarValor);
  };

  useEffect(() => {
    async function fetchSaldo() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado");

        const res = await fetch(`${process.env.NEXT_PUBLIC_Balance}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erro ao buscar o saldo");

        const data = await res.json();
        setSaldo(data.data.balance);
      } catch (error) {
        console.error("Erro ao buscar o saldo:", error);
        setErroSaldo("Erro ao carregar saldo");
      }
    }

    fetchSaldo();
  }, []);

  useEffect(() => {
    async function fetchEmpresas() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado");

        const res = await fetch(`${process.env.NEXT_PUBLIC_Balance}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erro ao buscar empresas");

        const data = await res.json();
        const empresas = data.data || [];

        const nomesEmpresas = empresas.map(
          (empresa: { name: string }) => empresa.name
        );
        setEmpresas(nomesEmpresas);
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
      }
    }

    fetchEmpresas();
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const removeNotification = (index: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((_, i) => i !== index)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "in_progress":
        return "bg-yellow-500";
      case "failure":
        return "bg-red-500";
      case "system_error":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="w-full h-20 bg-[#1A202C] flex items-center justify-between px-6 lg:px-8 relative sm:mt-[4rem] lg:mt-0">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <p className="text-[#DDD] font-roboto font-semibold text-sm lg:text-base">
            <span className="text-xs lg:text-sm block">Saldo em conta</span>
            {erroSaldo ? (
              <span className="text-red-500 text-sm">{erroSaldo}</span>
            ) : (
              <span className="text-md lg:text-md">
                R$ {mostrarValor ? saldo?.toFixed(2) || "Carregando..." : "*****"}
              </span>
            )}
          </p>
          <button onClick={toggleMostrarValor} className="focus:outline-none">
            <Image
              src={mostrarValor ? olhoAberto : olhoFechado}
              alt="Mostrar/Ocultar"
              className="w-5 h-5 lg:w-6 lg:h-6"
            />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <button onClick={toggleNotifications} className="focus:outline-none">
            <Image src={notify} alt="Notificação" className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>
          {showNotifications && (
            <div className="absolute top-12 right-0 w-80 bg-white shadow-lg rounded-lg p-4 z-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-800 text-lg font-semibold">Notificações</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  &times;
                </button>
              </div>
              <ul className="max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <li className="text-gray-500 text-center py-2">Nenhuma notificação</li>
                ) : (
                  notifications.map((notif, index) => (
                    <li
                      key={index}
                      className="py-2 border-b border-gray-200 flex items-start justify-between"
                    >
                      <div className="flex items-start">
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${getStatusColor(
                            notif.status
                          )} mr-2 mt-1`}
                        ></span>
                        <div>
                          <p className="text-gray-700">{notif.message}</p>
                          <small className="text-gray-500">
                            {new Date(notif.date).toLocaleString()}
                          </small>
                        </div>
                      </div>
                      <button
                        onClick={() => removeNotification(index)}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        &times;
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="relative">
          <Link href="/main/profile">
              <Image src={foto} alt="Usuário" className="w-6 h-6 lg:w-8 lg:h-8" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;