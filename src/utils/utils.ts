export const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

export const formatCurrency = (value: string) => {
  let formattedValue = value.replace(/\D/g, "");

  if (formattedValue.length > 8) {
    formattedValue = formattedValue.slice(0, 8);
  }

  formattedValue = (parseFloat(formattedValue) / 100)
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return formattedValue;
};

export const formatToPercentage = (value: string) => {
  let formattedValue = value.replace(/\D/g, "");

  if (formattedValue.length > 4) {
    formattedValue = formattedValue.slice(0, 4);
  }

  formattedValue = (parseFloat(formattedValue) / 100)
    .toFixed(2)
    .replace(".", ",");

  return formattedValue;
};

export const generateInstallmentOptions = (value: string) => {
  const maxInstallments = 12;
  const valueNumber = parseFloat(value.replace(/\D/g, "")) / 100;
  const options: Record<string, string> = {};
  for (let i = 1; i <= maxInstallments; i++) {
    options[i.toString()] = `${i}x de R$ ${(valueNumber / i)
      .toFixed(2)
      .replace(".", ",")}`;
  }
  return options;
};
