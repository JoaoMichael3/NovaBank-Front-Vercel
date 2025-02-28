export const columns = [
  "Nome",
  "Valor",
  "Descrição",
  "Forma de pagamento",
  "Data de vencimento",
  "Ações",
];

export type DataItem = {
  Nome: string;
  Valor: string;
  Descrição: string;
  "Forma de pagamento": string;
  "Data de vencimento": string;
  Ações: JSX.Element;
  Status: string;
};

export const initialData: DataItem[] = [
  {
    Nome: "Othmar Garithos",
    Valor: "R$ 100,00",
    Descrição: "Descrição não informada",
    "Forma de pagamento": "Pix",
    "Data de vencimento": "2024-08-04",
    Ações: (
      <>
        <button className="text-blue-500">Editar cobrança</button>
        <button className="text-blue-500">Imprimir</button>
        <button className="text-blue-500">Reenviar notificação</button>
        <button className="text-red-500">Remover cobrança</button>
      </>
    ),
    Status: "Vencido",
  },
  {
    Nome: "Jaina Proudmoore",
    Valor: "R$ 200,00",
    Descrição: "Cobrança de serviço",
    "Forma de pagamento": "Cartão de Crédito",
    "Data de vencimento": "2024-09-01",
    Ações: (
      <>
        <button className="text-blue-500" ><a href="main/charges/edit">Editar cobrança</a></button>
        <button className="text-blue-500">Imprimir</button>
        <button className="text-blue-500">Reenviar notificação</button>
        <button className="text-red-500">Remover cobrança</button>
      </>
    ),
    Status: "Pago",
  },
];

export type SortBy = keyof DataItem;

export const sortData = (
  data: DataItem[],
  sortBy: SortBy,
  order: "asc" | "desc"
): DataItem[] => {
  return data.sort((a, b) => {
    if (order === "asc") {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    } else {
      return a[sortBy] < b[sortBy] ? 1 : -1;
    }
  });
};
