import * as Yup from "yup";
import { isValidCPF, isValidCNPJ } from "./validations";
import { fileTypeOptions, visibilityOptions } from "./StepThreeObjects";

export const paymentOptions = Array.from({ length: 12 }, (_, i) => i + 1);

export const frequencyOptions = [
  "Semanal",
  "Quinzenal",
  "Mensal",
  "Bimestral",
  "Trimestral",
  "Semestral",
  "Anual",
];

export const endOptions = {
  sem_data_definida: "Sem data definida",
  escolher_data: "Escolher data",
  escolher_numero_de_cobrancas: "Escolher número de cobranças",
};

export const discountDeadlineOptions = {
  dia_vencimento: "Até o dia do vencimento",
  um_dia: "Até 1 dia antes do vencimento",
  dois_dias: "Até 2 dias antes do vencimento",
  tres_dias: "Até 3 dias antes do vencimento",
  quatro_dias: "Até 4 dias antes do vencimento",
  cinco_dias: "Até 5 dias antes do vencimento",
  seis_dias: "Até 6 dias antes do vencimento",
  sete_dias: "Até 7 dias antes do vencimento",
  oito_dias: "Até 8 dias antes do vencimento",
  nove_dias: "Até 9 dias antes do vencimento",
  dez_dias: "Até 10 dias antes do vencimento",
};

export const formatCurrency = (value: string): string => {
  const numberValue = Number(value.replace(/\D/g, "")) / 100;
  return numberValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const validationSchemaStepOne = Yup.object({
  value: Yup.string()
    .required("Valor da Cobrança é obrigatório")
    .test(
      "max-value",
      "O valor da cobrança não pode ser superior a R$ 5.000,00",
      (value) => {
        const numericValue = parseFloat(value?.replace(/\D/g, "")) / 100;
        return numericValue <= 5000;
      }
    )
    .test(
      "min-value",
      "O valor da cobrança não pode ser inferior a R$ 5,00",
      (value) => {
        const numericValue = parseFloat(value?.replace(/\D/g, "")) / 100;
        return numericValue >= 5;
      }
    ),
  paymentType: Yup.string().required(
    "É necessário selecionar um tipo de pagamento"
  ),
  description: Yup.string().min(2, "Descrição muito curta"),

  installments: Yup.string().when("paymentType", {
    is: "parcelado",
    then: (schema) => schema.required("O parcelamento é obrigatório"),
  }),
  firstPaymentDate: Yup.date().when("paymentType", {
    is: "parcelado",
    then: (schema) =>
      schema
        .required("O vencimento da cobrança é obrigatório")
        .min(
          new Date(),
          "A data de vencimento não pode ser anterior ao dia atual"
        ),
  }),

  frequency: Yup.string().when("paymentType", {
    is: "assinatura",
    then: (schema) => schema.required("A frequência da cobrança é obrigatória"),
  }),
  endType: Yup.string().when("paymentType", {
    is: "assinatura",
    then: (schema) =>
      schema.required("O tipo de fim da assinatura é obrigatório"),
  }),
  endDate: Yup.date()
    .nullable()
    .when(["paymentType", "endType"], {
      is: (paymentType: string, endType: string) =>
        paymentType === "assinatura" && endType === "escolher_data",
      then: (schema) =>
        schema
          .required("A data de fim da assinatura é obrigatória")
          .min(
            new Date(),
            "A data de fim da assinatura não pode ser anterior ao dia atual"
          ),
    }),
  endInstallments: Yup.string()
    .nullable()
    .when(["paymentType", "endType"], {
      is: (paymentType: string, endType: string) =>
        paymentType === "assinatura" &&
        endType === "escolher_numero_de_cobrancas",
      then: (schema) => schema.required("O número de cobranças é obrigatório"),
    }),
});

export const validationSchemaStepTwo = Yup.object({
  interestRate: Yup.string()
    .required("A taxa de juros é obrigatória")
    .test("valid-interest", "O valor do juros deve ser válido", (value) => {
      const numericValue = parseFloat(value?.replace(/\D/g, "")) / 100;
      return numericValue <= 100;
    }),
  fineRate: Yup.string()
    .required("A multa é obrigatória")
    .test("valid-fine", "O valor da multa deve ser válido", function (value) {
      const { fineType } = this.parent;
      if (fineType === "fixed") {
        const numericValue = parseFloat(value?.replace(/\D/g, "")) / 100;
        return numericValue <= 999999999.99;
      } else if (fineType === "percent") {
        const numericValue = parseFloat(value?.replace(/\D/g, "")) / 100;
        return numericValue <= 100;
      }
      return true;
    }),
  discountFixed: Yup.string().when("discountType", {
    is: "fixed",
    then: (schema) =>
      schema
        .required("O desconto fixo é obrigatório")
        .test(
          "valid-discount",
          "O valor do desconto deve ser válido",
          function (value) {
            const numericValue = parseFloat(value?.replace(/\D/g, "")) / 100;
            return numericValue <= 999999999.99;
          }
        ),
  }),
  discountPercent: Yup.string().when("discountType", {
    is: "percent",
    then: (schema) =>
      schema
        .required("O desconto percentual é obrigatório")
        .test(
          "valid-discount",
          "O valor do desconto deve ser válido",
          function (value) {
            const numericValue = parseFloat(value?.replace(/\D/g, "")) / 100;
            return numericValue <= 100;
          }
        ),
  }),
  discountDeadline: Yup.string().required(
    "O prazo máximo do desconto é obrigatório"
  ),
});

const fileTypeValues = Object.keys(fileTypeOptions);
const visibilityValues = Object.keys(visibilityOptions);

export const validationSchemaStepThree = Yup.object({
  files: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .required("O nome do arquivo é obrigatório")
          .min(3, "O nome do arquivo deve ter pelo menos 3 caracteres"),
        type: Yup.string().required("O tipo de arquivo é obrigatório"),
        fileType: Yup.string()
          .oneOf(fileTypeValues, "Selecione uma categoria válida")
          .required("A categoria do arquivo é obrigatória"),
        visibility: Yup.string()
          .oneOf(visibilityValues, "Selecione uma opção válida")
          .required("A visibilidade do arquivo é obrigatória"),
      })
    )
    .min(1, "É necessário adicionar pelo menos um arquivo"),
});

export const validationSchemaStepFour = Yup.object({
  clientId: Yup.string().min(8).required("Id do Cliente é obrigatório"),
  name: Yup.string()
    .required("Nome do Cliente é obrigatório")
    .min(2, "Nome muito curto"),

  cpfOrCnpj: Yup.string()
    .required("CPF/CNPJ é obrigatório")
    .test("valid-cpf-cnpj", "CPF/CNPJ inválido", (value) =>
      value
        ? value.replace(/\D/g, "").length <= 11
          ? isValidCPF(value)
          : isValidCNPJ(value)
        : false
    ),

  email: Yup.string().email("E-mail inválido").required("E-mail é obrigatório"),

  cellphone: Yup.string()
    .required("Celular é obrigatório")
    .matches(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Número de celular inválido"),

  cep: Yup.string()
    .matches(/^\d{5}-\d{3}$/, "CEP inválido")
    .test("valid-cep", "CEP inválido", (value) =>
      value ? value.length === 9 : false
    ),

  countries: Yup.string(),

  states: Yup.string().required("Estado é obrigatório"),

  city: Yup.string().min(2, "Cidade muito curta"),

  neighborhood: Yup.string().min(2, "Bairro muito curto"),

  street: Yup.string().min(2, "Rua muito curta"),

  number: Yup.string().matches(/^\d+$/, "Número inválido"),

  complement: Yup.string(),

  scheduleOffset: Yup.string().required(
    "Selecione o período antes do vencimento"
  ),
  notificationMethods: Yup.array()
    .of(
      Yup.string().oneOf([
        "whatsapp",
        "email",
        "sms",
        "impresso",
        "ligacao",
        "correios",
      ])
    )
    .min(1, "Selecione pelo menos um método de envio")
    .required("Pelo menos um método de envio é obrigatório"),
});

export const validationSchemaStepFive = Yup.object().shape({
  PAYMENT_CREATED: Yup.object().shape({
    emailEnabledForCustomer: Yup.boolean(),
    smsEnabledForCustomer: Yup.boolean(),
    phoneCallEnabledForCustomer: Yup.boolean(),
    whatsappEnabledForCustomer: Yup.boolean(),
    enabled: Yup.boolean().test(
      "at-least-one-method",
      "At least one notification method should be enabled for PAYMENT_CREATED.",
      function (value) {
        return (
          this.parent.emailEnabledForCustomer ||
          this.parent.smsEnabledForCustomer ||
          this.parent.phoneCallEnabledForCustomer ||
          this.parent.whatsappEnabledForCustomer
        );
      }
    ),
  }),

  PAYMENT_DUEDATE_WARNING: Yup.object().shape({
    emailEnabledForCustomer: Yup.boolean(),
    smsEnabledForCustomer: Yup.boolean(),
    phoneCallEnabledForCustomer: Yup.boolean(),
    whatsappEnabledForCustomer: Yup.boolean(),
    scheduleOffset: Yup.number()
      .required("A schedule offset is required for PAYMENT_DUEDATE_WARNING.")
      .oneOf(
        [0, 5, 10, 15, 30],
        "Invalid schedule offset for PAYMENT_DUEDATE_WARNING."
      ),
  }),

  PAYMENT_RECEIVED: Yup.object().shape({
    emailEnabledForCustomer: Yup.boolean(),
    smsEnabledForCustomer: Yup.boolean(),
    phoneCallEnabledForCustomer: Yup.boolean(),
    whatsappEnabledForCustomer: Yup.boolean(),
    enabled: Yup.boolean().test(
      "at-least-one-method",
      "At least one notification method should be enabled for PAYMENT_RECEIVED.",
      function (value) {
        return (
          this.parent.emailEnabledForCustomer ||
          this.parent.smsEnabledForCustomer ||
          this.parent.phoneCallEnabledForCustomer ||
          this.parent.whatsappEnabledForCustomer
        );
      }
    ),
  }),

  SEND_LINHA_DIGITAVEL: Yup.object().shape({
    emailEnabledForCustomer: Yup.boolean(),
    smsEnabledForCustomer: Yup.boolean(),
    phoneCallEnabledForCustomer: Yup.boolean(),
    whatsappEnabledForCustomer: Yup.boolean(),
    enabled: Yup.boolean().test(
      "at-least-one-method",
      "At least one notification method should be enabled for SEND_LINHA_DIGITAVEL.",
      function (value) {
        return (
          this.parent.emailEnabledForCustomer ||
          this.parent.smsEnabledForCustomer ||
          this.parent.phoneCallEnabledForCustomer ||
          this.parent.whatsappEnabledForCustomer
        );
      }
    ),
  }),

  PAYMENT_OVERDUE: Yup.object().shape({
    emailEnabledForCustomer: Yup.boolean(),
    smsEnabledForCustomer: Yup.boolean(),
    phoneCallEnabledForCustomer: Yup.boolean(),
    whatsappEnabledForCustomer: Yup.boolean(),
    scheduleOffset: Yup.number()
      .oneOf([0, 1, 7, 15, 30], "Invalid schedule offset for PAYMENT_OVERDUE.")
      .required("A schedule offset is required for PAYMENT_OVERDUE."),
  }),

  PAYMENT_OVERDUE_REPEAT: Yup.object().shape({
    emailEnabledForCustomer: Yup.boolean(),
    smsEnabledForCustomer: Yup.boolean(),
    phoneCallEnabledForCustomer: Yup.boolean(),
    whatsappEnabledForCustomer: Yup.boolean(),
    scheduleOffset: Yup.number()
      .oneOf(
        [0, 1, 5, 7, 10, 15, 30],
        "Invalid schedule offset for PAYMENT_OVERDUE_REPEAT."
      )
      .required("A schedule offset is required for PAYMENT_OVERDUE_REPEAT."),
  }),

  PAYMENT_DUEDATE_WARNING_OFFSET: Yup.object().shape({
    emailEnabledForCustomer: Yup.boolean(),
    smsEnabledForCustomer: Yup.boolean(),
    phoneCallEnabledForCustomer: Yup.boolean(),
    whatsappEnabledForCustomer: Yup.boolean(),
    scheduleOffset: Yup.number()
      .oneOf(
        [0, 1, 5, 7, 10, 15, 30],
        "Invalid schedule offset for PAYMENT_DUEDATE_WARNING_OFFSET."
      )
      .required(
        "A schedule offset is required for PAYMENT_DUEDATE_WARNING_OFFSET."
      ),
  }),
});

interface ValidationContext {
  totalValue: string;
}

export const validationSchemaCreateCharge = Yup.object({
  customer: Yup.string().required("Identificador do cliente é obrigatório"),
  billingType: Yup.string().required("Forma de pagamento é obrigatória"),
  value: Yup.string()
    .required("Valor da Cobrança é obrigatório")
    .test(
      "max-value",
      "O valor da cobrança não pode ser superior a R$ 999.999,99",
      function (value) {
        if (!value) return false;
        const numericValue = parseFloat(value.replace(/\D/g, "")) / 100;
        return numericValue <= 999999.99;
      }
    )
    .test(
      "min-value",
      "O valor da cobrança não pode ser inferior a R$ 5,00",
      function (value) {
        if (!value) return false;
        const numericValue = parseFloat(value.replace(/\D/g, "")) / 100;
        return numericValue >= 5;
      }
    ),
  dueDate: Yup.date()
    .required("Data de vencimento é obrigatória")
    .min(new Date(), "A data de vencimento não pode ser anterior ao dia atual"),
  description: Yup.string()
    .max(500, "Máximo de 500 caracteres")
    .min(2, "Descrição muito curta"),
  installmentCount: Yup.number().required("Número de parcelas é obrigatório"),
  fine: Yup.object().shape({
    value: Yup.string().test("max-fine", function (value, context) {
      const totalValue = context?.options.context?.totalValue;
      const type = this.parent.type;

      if (!totalValue || !value) return true;

      const numericValue = parseFloat(totalValue.replace(/\D/g, "")) / 100;
      const fineValue = parseFloat(value.replace(/\D/g, "")) / 100;

      if (type === "fixed") {
        const message = `O valor máximo de multa para esta cobrança é de R$ ${numericValue
          .toFixed(2)
          .replace(".", ",")}`;
        return fineValue > numericValue ? this.createError({ message }) : true;
      } else if (type === "percent") {
        const maxFinePercent = 100;
        const message = `O valor máximo de multa para esta cobrança é de ${maxFinePercent.toFixed(
          2
        )}%`;
        return fineValue > maxFinePercent
          ? this.createError({ message })
          : true;
      }
      return true;
    }),
    type: Yup.string(),
  }),
  discount: Yup.object().shape({
    value: Yup.string().test("max-discount", function (value, context) {
      const totalValue = context?.options.context?.totalValue;
      const type = this.parent.type;

      if (!totalValue || !value) return true;

      const numericValue = parseFloat(totalValue.replace(/\D/g, "")) / 100;
      const discountValue = parseFloat(value.replace(/\D/g, "")) / 100;

      if (type === "fixed") {
        const maxDiscount = Math.max(numericValue - 5, 0);
        const message = `O valor máximo de desconto para esta cobrança é de R$ ${maxDiscount
          .toFixed(2)
          .replace(".", ",")}`;
        return discountValue > maxDiscount
          ? this.createError({ message })
          : true;
      } else if (type === "percent") {
        const maxDiscountPercent = Math.max((1 - 5 / numericValue) * 100, 0);
        const message = `O valor máximo de desconto para esta cobrança é de ${maxDiscountPercent.toFixed(
          2
        )}%`;
        return discountValue > maxDiscountPercent
          ? this.createError({ message })
          : true;
      }
      return true;
    }),
    dueDateLimitDays: Yup.number(),
    type: Yup.string(),
  }),
  interest: Yup.object().shape({
    value: Yup.string()
      .required("O valor dos juros é obrigatório")
      .test("max-interest", function (value) {
        if (!value) return true;
        const interestValue = parseFloat(value.replace(/\D/g, "")) / 100;
        if (interestValue > 10) {
          return this.createError({
            message: `O valor máximo de juros é de 10% ao mês.`,
          });
        }
        return true;
      }),
  }),
  postalService: Yup.boolean(),
  printInvoice: Yup.boolean(),
});
