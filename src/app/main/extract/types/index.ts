export interface DataItem {
  DATA: string;
  "ID Transação": string;
  Status: string;
  Tipo: string;
  "Valor Venda": string;
  "Nome do Estabelecimento": string;
  CNPJ: string;
}

export type SortBy = keyof DataItem;
export type Order = "asc" | "desc";
