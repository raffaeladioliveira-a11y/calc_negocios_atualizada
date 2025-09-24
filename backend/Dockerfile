FROM node:18-alpine

# Instalar dependências do sistema necessárias para o MySQL
RUN apk add --no-cache mysql-client

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar todas as dependências (incluindo dev para nodemon)
RUN npm install

# Copiar código fonte
COPY . .

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Mudar proprietário dos arquivos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expor porta
EXPOSE 3001

# Aguardar MySQL ficar disponível e então iniciar
CMD ["npm", "run", "dev"]