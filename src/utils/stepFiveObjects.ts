import * as Yup from "yup";

export const notificationEvents = {
  PAYMENT_CREATED: "Aviso de cobrança criada",
  PAYMENT_DUEDATE_WARNING: "Aviso no dia do vencimento",
  PAYMENT_RECEIVED: "Aviso de cobrança recebida",
  SEND_LINHA_DIGITAVEL: "Linha digitável no dia do vencimento",
  PAYMENT_OVERDUE: "Aviso de cobrança vencida",
  PAYMENT_OVERDUE_REPEAT: "Aviso a cada 7 dias após vencimento",
  PAYMENT_DUEDATE_WARNING_OFFSET: "Aviso 10 dias antes do vencimento",
};

export const notificationOptions: Record<
  "whatsapp" | "email" | "sms" | "impresso" | "ligacao" | "correios",
  string
> = {
  whatsapp: "Whatsapp",
  email: "E-mail",
  sms: "SMS",
  impresso: "Impresso",
  ligacao: "Ligação",
  correios: "Correios",
};


const notificationMethods = ["emailEnabledForCustomer", "smsEnabledForCustomer", "phoneCallEnabledForCustomer", "whatsappEnabledForCustomer"];
