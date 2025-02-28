# NovaBank Front

Esse é o front-end do Gateway de pagamentos NovaBank-front e a base do projeto é o Next.Js, tailwind e Typescript.

## Funcionalidades

- Logar
- Transferir
- Continue a lista posteriormente

## Variáveis de ambiente

Para executar o projeto é necessário ter as variáveis de ambientes devidamente configuradas de acordo com o .env.example:

    NEXT_PUBLIC_CEP_API_BASE_URL=


## Iniciar Iniciando

### Método 1

Para rodar o projeto localmente é simples, certifique-se de ter [Git](https://git-scm.com/downloads) e o [Docker e Docker-compose](https://www.docker.com/products/docker-desktop/) instalados em seu computador local.

Siga para o diretório em que deseja instalar o projeto e digite o comando:

    git clone https://github.com/Contabilize-Empresarial/NovaBank-Front.git

Em seguida, navegue até o diretório do projeto e digite o comando:

    docker-compose up --build

Após o build, acesse o seguinte link e poderá utilizar o projeto:

    http://localhost:3000

### Método 2

Certiqui-se de ter o [Git](https://git-scm.com/downloads) e o [Node](https://nodejs.org/en/download/package-manager) instalados em seu computador.

Siga para o diretório em que deseja instalar o projeto e digite o comando:

    git clone https://github.com/Contabilize-Empresarial/NovaBank-Front.git

Em seguida, navegue até o diretório do projeto e digite o comando:

    npm i

Após a instalação das dependências, digite o comando:

    npm run dev

Após o build, acesse o seguinte link e poderá utilizar o projeto:

    http://localhost:3000

## Licença

Todo projeto pertence a contabilize e todo aquele que não estiver autorizado acessar, produzir, executar ou repassar isso vai democraticamente ir jogar no vasco.