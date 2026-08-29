const { verificarToken } = require("../utils/jwt");
const { NOME_COOKIE } = require("../utils/cookie");

function requireAuth(req, res, next) {
  const token = req.cookies?.[NOME_COOKIE];

  if (!token) {
    return res.status(401).json({ erro: "Não autenticado" });
  }

  try {
    const payload = verificarToken(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ erro: "Sessão inválida ou expirada" });
  }
}

function requireRole(...papeisPermitidos) {
  return (req, res, next) => {
    if (!req.user || !papeisPermitidos.includes(req.user.userLv)) {
      return res.status(403).json({ erro: "Sem permissão para essa ação" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
