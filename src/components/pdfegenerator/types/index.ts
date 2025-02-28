import { number } from "yup";

export interface UserDetails {
    id: string;
    
    name: string;
    email: string;
    status: string;
    value: string;
    billingType: string;
    originalDueDate: string;
    paymentDate: string | null;  
    clientPaymentDate?: string | null;
    creditDate?: string | null;
    estimatedCreditDate?: string | null;
    dueDate: string;
    dateCreated:string;
    invoiceNumber:string
  fine: {
    value: number;
    type: string;
  };
    customer: string;
    interest: {
      value: number;
      type: string;
    };
    description: string;
    discount: {
      value: number;
      type: string;
    };
  }  

