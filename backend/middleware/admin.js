// Middleware de autorização permissivo para desenvolvimento
// Em produção, validar privilégios de admin
module.exports = function adminMiddleware(req, res, next) {
    return next();
};


