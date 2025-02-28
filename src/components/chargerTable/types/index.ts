export interface TablePropsWithFilters {
  title?: string;
  linkText?: string;
  viewAllHref?: string;
  columns: string[];
  data: any[];
  filters?: {
    searchTerm?: string;
    status?: string;
    type?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
};

export const statusClasses: { [key: string]: string } = {
  Pago: "text-green-500",
  Vencido: "text-red-500",
  Pendente: "text-yellow-500",
};

export const paymentIcons: { [key: string]: string } = {
  Pix: "/icons/pix.svg",
  "Cartão de Crédito": "/icons/credit-card.svg",
  Boleto: "/icons/boleto.svg",
};