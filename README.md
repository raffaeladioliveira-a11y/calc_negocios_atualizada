# Sistema de Gestão de Clientes

Sistema completo para gestão de clientes com frontend React e backend Node.js conectado ao MySQL.

## 📋 Requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)
- Git

## 🚀 Como executar

### 1. Clone o repositório e organize os arquivos

```bash
git clone seu-repositorio
cd meu-projeto
```

Estrutura esperada:
```
meu-projeto/
├── backend/              # API Node.js
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── Dockerfile
├── frontend/            # React app
│   ├── src/
│   └── .env
├── docker-compose.yml
├── .env
└── init-scripts/
    └── 01-create-tables.sql
```

### 2. Iniciar todos os serviços com Docker

```bash
# Construir e iniciar todos os containers
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar todos os serviços
docker-compose down
```

### 3. Verificar se tudo está funcionando

- **MySQL**: `localhost:3306`
- **Backend API**: `http://localhost:3001/api/health`
- **phpMyAdmin**: `http://localhost:8080`
- **Frontend React**: `http://localhost:3000` (se rodando localmente)

## 📡 Endpoints da API

### Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Obter cliente específico
- `POST /api/clientes` - Criar novo cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Deletar cliente
- `GET /api/clientes/stats` - Estatísticas dos clientes

### Exemplo de uso da API:

```bash
# Listar todos os clientes
curl http://localhost:3001/api/clientes

# Criar novo cliente
curl -X POST http://localhost:3001/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Cliente",
    "email": "cliente@email.com",
    "phone": "(11) 99999-9999",
    "empresa": "Empresa LTDA",
    "cargo": "Gerente"
  }'

# Buscar clientes
curl "http://localhost:3001/api/clientes?search=joão"
```

## 🗄️ Estrutura do Banco de Dados

### Tabela `clientes`
- `id` - Chave primária
- `name` - Nome completo
- `email` - Email único
- `phone` - Telefone
- `empresa` - Nome da empresa
- `cargo` - Cargo na empresa
- `status` - Ativo/Inativo
- `calculations` - Número de cálculos realizados
- `avatar` - Iniciais do nome
- `last_activity` - Data da última atividade
- `created_at` - Data de criação
- `updated_at` - Data de atualização

## 🔧 Desenvolvimento Local

### Backend
```bash
cd backend
npm install
npm run dev  # Usa nodemon para hot reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 🐳 Comandos úteis do Docker

```bash
# Ver containers rodando
docker ps

# Logs do backend
docker-compose logs backend

# Logs do MySQL
docker-compose logs mysql

# Conectar no MySQL
docker exec -it mysql_db mysql -u app_user -p

# Backup do banco
docker exec mysql_db mysqldump -u root -p meu_projeto_db > backup.sql

# Restaurar backup
docker exec -i mysql_db mysql -u root -p meu_projeto_db < backup.sql

# Resetar volumes (CUIDADO: apaga dados)
docker-compose down -v
```

## 🔒 Configurações de Segurança

### Para produção, altere:

1. **Senhas do MySQL** no `docker-compose.yml`
2. **JWT_SECRET** no backend/.env
3. **CORS settings** no backend
4. **Rate limiting** se necessário

## 🐛 Troubleshooting

### Backend não conecta no MySQL
1. Verifique se o MySQL iniciou completamente
2. Confirme as credenciais no `.env`
3. Aguarde o healthcheck do MySQL

### Erro de CORS no frontend
1. Verifique se `FRONTEND_URL` está correto no backend/.env
2. Confirme se `REACT_APP_API_URL` aponta para o backend

### Dados não aparecem no frontend
1. Teste a API diretamente: `curl http://localhost:3001/api/clientes`
2. Verifique o console do navegador para erros
3. Confirme se os dados existem no banco via phpMyAdmin

## 📈 Próximos passos

- [ ] Implementar autenticação JWT
- [ ] Adicionar paginação na listagem
- [ ] Sistema de upload de avatar
- [ ] Relatórios e gráficos
- [ ] Notificações em tempo real
- [ ] Testes automatizados
- [ ] Deploy com Docker Swarm/Kubernetes

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request