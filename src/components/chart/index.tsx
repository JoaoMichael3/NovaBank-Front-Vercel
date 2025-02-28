"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import loadingSpinner from "@/assets/images/loading.svg";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface PaymentData {
  dateCreated: string;
  netValue: number;
  status: string;
}

const statusMapping: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendente", color: "rgba(255, 193, 7, 0.8)" },
  RECEIVED: { label: "Recebido", color: "rgba(54, 162, 235, 0.8)" },
  OVERDUE: { label: "Atrasado", color: "rgba(255, 152, 0, 0.8)" },
  CONFIRMED: { label: "Confirmado", color: "rgba(76, 175, 80, 0.8)" },
};

const CustomChart: React.FC = () => {
  const [barChartData, setBarChartData] = useState<any | null>(null);
  const [pieChartData, setPieChartData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const endpoint = process.env.NEXT_PUBLIC_CHARGES_URL!;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token de autenticação não encontrado. Faça login.");
          setLoading(false);
          return;
        }

        const response = await axios.get<{ data: { data: any[] } }>(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { data } = response.data;

        if (!data || !Array.isArray(data.data)) {
          setError("Estrutura de dados inválida.");
          setLoading(false);
          return;
        }

        const payments: PaymentData[] = data.data.map((payment: any) => ({
          dateCreated: payment.dateCreated,
          netValue: payment.netValue || 0,
          status: payment.status,
        }));

        const monthlyTotals: Record<string, number> = {};
        const months = Array.from({ length: 12 }, (_, i) =>
          new Date(
            new Date().setMonth(new Date().getMonth() - i)
          ).toLocaleString("default", { month: "long" })
        ).reverse();

        months.forEach((month) => {
          monthlyTotals[month] = 0;
        });

        payments.forEach((payment) => {
          const date = new Date(payment.dateCreated);
          if (!isNaN(date.getTime())) {
            const month = date.toLocaleString("default", { month: "long" });
            if (monthlyTotals[month] !== undefined) {
              monthlyTotals[month] += payment.netValue;
            }
          }
        });

        setBarChartData({
          labels: months,
          datasets: [
            {
              label: "Total Mensal (Net Value)",
              data: months.map((month) => monthlyTotals[month]),
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
            },
          ],
        });

        const statusCounts = payments.reduce(
          (acc: Record<string, number>, payment) => {
            acc[payment.status] = (acc[payment.status] || 0) + 1;
            return acc;
          },
          {}
        );

        const statusLabels = Object.keys(statusCounts).map(
          (status) => statusMapping[status]?.label || "Desconhecido"
        );
        const statusColors = Object.keys(statusCounts).map(
          (status) => statusMapping[status]?.color || "#808080"
        );

        setPieChartData({
          labels: statusLabels,
          datasets: [
            {
              label: "Status dos Pagamentos",
              data: Object.values(statusCounts),
              backgroundColor: statusColors,
            },
          ],
        });

        setError(null);
      } catch (err: any) {
        setError(`Erro ao buscar dados da API: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Image
          src={loadingSpinner}
          alt="Carregando..."
          className="w-[300px] h-[400px] animate-spin"
        />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {barChartData && (
        <div className="flex flex-col items-center justify-between p-4 bg-[#181B21] rounded-lg shadow-lg w-full h-[450px]">
          <div className="flex items-center w-full mb-3">
            <p className="border-l-4 pl-2 text-[30px] border-solid border-[#A644CB] ml-2 text-white text-lg">
              Total Mensal
            </p>
          </div>
          <div className="w-[90%] h-full">
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: "#FFFFFF",
                    },
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      color: "#FFFFFF",
                    },
                  },
                  y: {
                    ticks: {
                      color: "#FFFFFF",
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}
      {pieChartData && (
        <div className="flex flex-col lg:flex-row items-start justify-between p-4 bg-[#181B21] rounded-lg shadow-lg w-full h-[450px]">
          <div className="flex flex-col w-[70%] h-full">
            <div className="flex items-center w-full mb-3">
              <p className="border-l-4 pl-2 text-[30px] border-solid border-[#A644CB] ml-2 text-white text-lg sm:pl-15">
                Status dos Pagamentos
              </p>
            </div>
            <div className="w-full h-full">
              <Pie
                data={pieChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: "#FFFFFF",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="flex flex-col ml-4 space-y-2">
            {Object.keys(statusMapping).map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: statusMapping[status]?.color }}
                ></span>
                <p className="text-white text-sm">
                  {statusMapping[status]?.label || "Desconhecido"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomChart;
