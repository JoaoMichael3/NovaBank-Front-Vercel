import * as Yup from "yup";
import CepApi from "@/utils/Api/CepApi";
import validator from "validator";

export const isStrongPassword = (password: string): boolean => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
};

export function isValidCPF(cpf: string): boolean {
  if (typeof cpf !== "string") return false;
  cpf = cpf.replace(/[\s.-]*/gim, "");
  if (
    !cpf ||
    cpf.length != 11 ||
    cpf == "00000000000" ||
    cpf == "11111111111" ||
    cpf == "22222222222" ||
    cpf == "33333333333" ||
    cpf == "44444444444" ||
    cpf == "55555555555" ||
    cpf == "66666666666" ||
    cpf == "77777777777" ||
    cpf == "88888888888" ||
    cpf == "99999999999"
  ) {
    return false;
  }
  var soma = 0;
  var resto;
  for (var i = 1; i <= 9; i++)
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto == 10 || resto == 11) resto = 0;
  if (resto != parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (var i = 1; i <= 10; i++)
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto == 10 || resto == 11) resto = 0;
  if (resto != parseInt(cpf.substring(10, 11))) return false;
  return true;
}

export function isValidCNPJ(cnpj: string): boolean {
  if (!cnpj) {
    return false;
  }

  // Remove os caracteres '.', '/', '-' da string, deixando apenas os números
  const strCNPJ = cnpj.replace(/[.\-\/]/g, "");

  // Testa se todos os dígitos são iguais ou se não tem 14 dígitos
  if (/^(\d)\1{13}$/.test(strCNPJ) || strCNPJ.length !== 14) {
    return false;
  }

  // Função para calcular os dígitos verificadores
  const calcularDV = (cnpj: string, tamanho: number): number => {
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(cnpj.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    return soma % 11 < 2 ? 0 : 11 - (soma % 11);
  };

  // Separa os números e os dígitos verificadores
  const numeros = strCNPJ.substring(0, 12);
  const digitos = strCNPJ.substring(12);

  // Calcula o primeiro dígito verificador e verifica
  const primeiroDV = calcularDV(strCNPJ, 12);
  if (primeiroDV !== parseInt(digitos.charAt(0))) {
    return false;
  }

  const segundoDV = calcularDV(strCNPJ, 13);
  if (segundoDV !== parseInt(digitos.charAt(1))) {
    return false;
  }

  return true;
}

export const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
};

export const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
    .slice(0, 18);
};

export const formatCellphone = (value: string) => {
  value = value.replace(/\D/g, "");

  if (value.length > 11) {
    value = value.slice(0, 11);
  }

  if (value.length <= 10) {
    return value
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2")
      .slice(0, 14);
  } else {
    return value
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{1})(\d{4})(\d{4})$/, "$1$2-$3")
      .slice(0, 15);
  }
};

export const handleCpfCnpjChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
) => {
  let value = e.target.value.replace(/\D/g, "");

  if (value.length <= 11) {
    value = formatCPF(value);
  } else {
    value = formatCNPJ(value);
  }

  setFieldValue("cpfOrCnpj", value);
};

export const handleCellphoneChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
) => {
  let value = formatCellphone(e.target.value);
  setFieldValue("cellphone", value);
};

export const formatCep = (value: string) => {
  value = value.replace(/\D/g, "");
  return value.slice(0, 8).replace(/(\d{5})(\d{3})/, "$1-$2");
};

export const handleCepChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void,
  setFieldError: (field: string, message: string | undefined) => void
) => {
  let value = e.target.value.replace(/\D/g, "");

  if (value.length > 8) {
    value = value.slice(0, 8);
  }

  const formattedValue = value.replace(/(\d{5})(\d{3})/, "$1-$2");
  setFieldValue("cep", formattedValue);

  if (formattedValue.length === 9) {
    try {
      const cepApi = new CepApi();
      const address = await cepApi.getAddressByCep(value);

      if (address && address.street) {
        setFieldValue("street", address.street);
        setFieldValue("neighborhood", address.neighborhood);
        setFieldValue("city", address.city);
        setFieldValue("states", address.state);
        setFieldValue("countries", "Brasil");
        setFieldError("cep", undefined);
      } else {
        setFieldError("cep", "CEP não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar o endereço:", error);
      setFieldError("cep", "CEP não encontrado");
    }
  } else if (formattedValue.length < 9 && formattedValue.length > 0) {
    setFieldError("cep", "CEP incompleto");
  } else {
    setFieldError("cep", "CEP inválido");
  }
};

const cepValidation = async (value: string) => {
  const cepApi = new CepApi();
  const cep = value.replace(/\D/g, "");

  if (cep.length !== 8) {
    throw new Yup.ValidationError("CEP incompleto");
  }

  try {
    const address = await cepApi.getAddressByCep(cep);
    if (!address || !address.street) {
      throw new Yup.ValidationError("CEP não encontrado");
    }
    return true;
  } catch (error) {
    throw new Yup.ValidationError("CEP não encontrado");
  }
};

export const validationSchema = Yup.object({
  name: Yup.string().required("Nome é obrigatório").min(2, "Nome muito curto"),
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
  cellphone: Yup.string().required("Celular é obrigatório"),
  cep: Yup.string()
    .required("CEP é obrigatório")
    .matches(/^\d{5}-\d{3}$/, "CEP inválido")
    .test("valid-cep", "CEP inválido", cepValidation),
  countries: Yup.string().required("País é obrigatório"),
  states: Yup.string().required("Estado é obrigatório"),
});
