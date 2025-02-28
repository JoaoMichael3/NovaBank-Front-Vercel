# Etapa 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copia package.json e package-lock.json (se você tiver)
COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "start"]
