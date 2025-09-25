const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar configurações e rotas
const { sequelize, testConnection } = require('./config/database');
const clientesRoutes = require('./routes/clientes');
const calcValoresRoutes = require('./routes/calcValores');
const orcamentosRoutes = require('./routes/orcamentos');
const setupAssociations = require('./config/associations');

// CRIAR APP EXPRESS PRIMEIRO
const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Iniciando servidor backend...');

// Middleware de segurança
app.use(helmet());

// Rate limiting (mais permissivo em desenvolvimento)
if (process.env.NODE_ENV === 'production') {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // máximo 100 requests por IP por janela
        message: {
            success: false,
            message: 'Muitas tentativas. Tente novamente em 15 minutos.'
        }
    });
    app.use('/api/', limiter);
    console.log('🛡️ Rate limiting ativado para produção');
} else {
    // Em desenvolvimento, rate limiting muito mais permissivo
    const devLimiter = rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minuto
        max: 1000, // 1000 requests por minuto em desenvolvimento
        message: {
            success: false,
            message: 'Limite de requisições excedido. Aguarde 1 minuto.'
        }
    });
    app.use('/api/', devLimiter);
    console.log('🛡️ Rate limiting permissivo ativado para desenvolvimento');
}

// CORS - Configuração definitiva para desenvolvimento
console.log('🌐 Configurando CORS para desenvolvimento...');

app.use(cors({
    origin: function (origin, callback) {
        console.log('🔍 CORS - Request de origem:', origin);
        // Permitir qualquer origem em desenvolvimento
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

// Middleware adicional para garantir headers CORS
app.use((req, res, next) => {
    const origin = req.headers.origin;
console.log(`📡 ${req.method} ${req.url} - Origin: ${origin}`);

// Definir headers CORS manualmente também
res.header('Access-Control-Allow-Origin', origin || '*');
res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
res.header('Access-Control-Allow-Credentials', 'true');

// Responder imediatamente para requests OPTIONS
if (req.method === 'OPTIONS') {
    console.log('✅ CORS: Respondendo preflight OPTIONS');
    return res.status(200).end();
}

next();
});

console.log('✅ CORS configurado para aceitar qualquer origem (desenvolvimento)');

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log das requisições em desenvolvimento
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
}

// Rotas
app.use('/api/clientes', clientesRoutes);
app.use('/api/calc-valores', calcValoresRoutes);
app.use('/api/orcamentos', orcamentosRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
    res.json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled'
});
});

// Rota 404
app.use('*', (req, res) => {
    res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
});
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
});
});

// Inicializar servidor
const startServer = async () => {
    try {
        console.log('📊 Testando conexão com banco de dados...');

        // Testar conexão com banco
        await testConnection();

        // Sincronizar modelos (apenas em desenvolvimento)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: false });
            console.log('📊 Modelos sincronizados com o banco');
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('🎉 ===================================');
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
        console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
        console.log(`👥 Clientes: http://localhost:${PORT}/api/clientes`);
        console.log('🎉 ===================================');
    });

    } catch (error) {
        console.error('❌ Erro ao inicializar servidor:', error);
        console.error('💡 Verifique se o MySQL está rodando e acessível');
        process.exit(1);
    }
};

// Tratar shutdowns graciosamente
process.on('SIGTERM', async () => {
    console.log('🔄 Recebido SIGTERM, fechando servidor...');
await sequelize.close();
process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 Recebido SIGINT, fechando servidor...');
await sequelize.close();
process.exit(0);
});

// Iniciar o servidor
startServer();