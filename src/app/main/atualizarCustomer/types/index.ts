export interface ClientFormData {
    id: string;
    name: string;
    email: string;
    personType: "CPF" | "CNPJ";
    cpfCnpj: string;
    mobilePhone: string;
    postalCode?: string;
    address?: string;
    addressNumber?: string;
    province?: string;
    notificationDisabled: boolean;
    additionalEmails: string;
    municipalInscription: string;
    stateInscription: string;
    observations: string;
    groupName: string;
    company: string;
    foreignCustomer: boolean;
  }