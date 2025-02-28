export interface CreatePaymentFormValues {
    customer: string;
    billingType: string;
    value: string;
    dueDate: string;
    description: string;
    daysAfterDueDateToRegistrationCancellation?: number;
    externalReference?: string;
    installmentCount?: number;
    totalValue?: string;
    installmentValue?: string;
    discount?: {
      value: string;
      dueDateLimitDays: number;
      type: string;
    };
    interest?: {
      value: string;
    };
    fine?: {
      value: string;
      type: string;
    };
    postalService: boolean;
    printInvoice: boolean;
  }