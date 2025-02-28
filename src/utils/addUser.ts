import * as fs from 'fs';
import * as path from 'path';

interface User {
  id: number;
  nome: string;
  email: string;
  email_login?: string;
  cnpj: string;
  cpf: string;
  data_nascimento: string;
  nome_empresa: string;
  telefone_fixo?: string;
  celular: string;
  site?: string;
  faturamento_mensal: string;
  cep: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  parseError?:string;
}


const filePath = path.join(__dirname, 'usuarios.json');


export function addUser(newUser: User): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(`Erro ao ler o arquivo: ${err.message}`);
        return;
      }

      try {
        

        const usuarios: User[] = JSON.parse(data);
        usuarios.push(newUser);

        fs.writeFile(filePath, JSON.stringify(usuarios, null, 2), (err) => {
          if (err) {
            reject(`Erro ao escrever no arquivo: ${err.message}`);
            return;
          }
          // console.log('Usuário adicionado com sucesso!');
          resolve();
        });
      } catch (parseError) {
        console.error('Erro ao parsear o JSON:')
      }
    });
  });
}
