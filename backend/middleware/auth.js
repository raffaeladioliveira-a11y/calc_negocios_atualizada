// Middleware de autenticação permissivo para desenvolvimento
// Permite todas as requisições seguirem adiante
module.exports = function authMiddleware(req, res, next) {
    return next();
};


