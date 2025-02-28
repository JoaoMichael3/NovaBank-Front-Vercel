import axios from "axios";

interface Address {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  erro?: boolean;
}

class CepApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_CEP_API_BASE_URL || "";
  }

  private async get<T>(endpoint: string): Promise<{ data: T }> {
    const response = await axios.get<T>(`${this.baseUrl}/${endpoint}`);
    return response;
  }

  public async getAddressByCep(cep: string): Promise<Address> {
    try {
      const response = await this.get<Address>(`${cep}`);
      if (response.data.erro) {
        throw new Error("CEP não encontrado");
      }
      return response.data;
    } catch (error) {
      throw new Error("Erro ao buscar o endereço: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    }
  }
}

export default CepApi;
