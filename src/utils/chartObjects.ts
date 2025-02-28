export const lineChartData = {
  labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun","Jul","Ago","Set","Out","Nov","Dez"],
  datasets: [
    {
      label: "PROGRESSÃO DE MARKUPS",
      data: [12, 19, 3, 5, 2, 3],
      borderColor: "rgba(75, 192, 192, 1)",
      backgroundColor: "rgba(75, 192, 192, 0.2)",
    },
  ],
};

export const barChartData = {
  labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun","Jul","Ago","Set","Out","Nov","Dez"],
  datasets: [
    {
      label: "Revenue",
      data: [18, 12, 6, 9, 12, 15],
      backgroundColor: "rgba(54, 162, 235, 0.2)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 1,
    },
  ],
};

export const doughnutChartData = {
  labels: ["Red", "Blue", "Yellow"],
  datasets: [
    {
      label: "PROGRESSÃO GERAL DE VENDAS",
      data: [300, 50, 100],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

export const pieChartData = {
  labels: ["Red", "Blue", "Yellow"],
  datasets: [
    {
      label: "HISTÓRICO POR TIPO DE PAGAMENTO",
      data: [300, 50, 100],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

export const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "",
    },
  },
};
