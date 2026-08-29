const NOME_COOKIE = "protech_token";

function opcoesCookie() {
  const producao = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: producao,
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  };
}

module.exports = { NOME_COOKIE, opcoesCookie };
