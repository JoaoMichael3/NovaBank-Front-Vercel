import PeopleIcon from "@/assets/icons/users.svg";
import MagnifferIcon from "@/assets/icons/magniffer.png";
import AddIcon from "@/assets/icons/addPeson.png";
import ChargerIcon from "@/assets/icons/chargerIcon.png";
import PaperIcon from "@/assets/icons/billIcon.png";
import ListIcon from "@/assets/icons/listIcon.png";
import CreatePaymentIcon from "@/assets/icons/createBillIcon.png";
import SimulatePaymentIcon from "@/assets/icons/simulateBillIcon.png";
import TransferIcon from "@/assets/icons/transferenceIcon.png";
import ArrowsIcon from "@/assets/icons/arrowsIcon.png";
import HomeIcon from "@/assets/icons/homeIcon.png";

export const dashboardOption = {
  route: "/main",
  iconSrc: HomeIcon,
  alt: "Dashboard",
  title: "Início",
};

export const userData = {
  username: "John Doe",
  sobrename: "uabaladu",
  bank: "462-asaas I.P.S.A",
  agency: "0001",
  account: "3941043-3",
  pix: "1234567891011",
};

// ✅ Agora é uma função que recebe `isAdmin` e retorna os itens corretamente
export const clientMainSection = {
  title: "Clientes",
  iconSrc: PeopleIcon,
  alt: "Clientes",
  items: [
    {
      route: "/main/buscarCliente",
      iconSrc: MagnifferIcon,
      label: "Buscar",
      alt: "Buscar Cliente",
    },
    {
      route: "/main/addCliente",
      iconSrc: AddIcon,
      label: "Adicionar Subconta",
      alt: "Adicionar Subconta",
    },
    {
      route: "/main/addCustomer",
      iconSrc: AddIcon,
      label: "Adicionar Cliente",
      alt: "Adicionar Cliente",
    },
    {
      route: "/main/atualizarCustomer",
      iconSrc: AddIcon,
      label: "Editar Cliente",
      alt: "Editar Cliente",
    },
  ],
};

export const chargerMainSection = {
  title: "Cobranças",
  iconSrc: ChargerIcon,
  alt: "Cobranças",
  items: [
    {
      route: "/main/TodasCobrancas",
      iconSrc: ListIcon,
      label: "Todas as Cobranças",
      alt: "Listar Pagamentos",
    },
    {
      route: "/main/charges",
      iconSrc: CreatePaymentIcon,
      label: "Criar Cobrança",
      alt: "Simular Pagamento",
    },
  ],
};

export const billMainSection = {
  title: "Extrato",
  iconSrc: PaperIcon,
  alt: "Extrato",
  items: [
    {
      route: "/main/extract",
      iconSrc: ListIcon,
      label: "Lista de Extratos",
      alt: "Listar Extratos",
    },
  ],
};

export const transferenceMainSection = {
  title: "Transferências",
  iconSrc: TransferIcon,
  alt: "Transferências",
  items: [
    {
      route: "/main/Transactions",
      iconSrc: ArrowsIcon,
      label: "Pix | Boleto | Cartão",
      alt: "Listar Pagamentos",
    },
  ],
};



