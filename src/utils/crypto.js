const crypto = require("crypto");

const ALGORITMO = "aes-256-gcm";
const TAMANHO_IV = 12;
const TAMANHO_TAG = 16;

function obterChave() {
  const chaveHex = process.env.ENCRYPTION_KEY;

  if (!chaveHex) {
    throw new Error("ENCRYPTION_KEY precisa estar definido no .env");
  }

  const chave = Buffer.from(chaveHex, "hex");

  if (chave.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY precisa ter 32 bytes (64 caracteres em hex). Gere uma nova com: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }

  return chave;
}

function encrypt(texto) {
  const chave = obterChave();
  const iv = crypto.randomBytes(TAMANHO_IV);
  const cifrador = crypto.createCipheriv(ALGORITMO, chave, iv);

  const cifrado = Buffer.concat([cifrador.update(texto, "utf8"), cifrador.final()]);
  const tag = cifrador.getAuthTag();

  return Buffer.concat([iv, tag, cifrado]).toString("base64");
}

function decrypt(valorBase64) {
  const chave = obterChave();
  const dados = Buffer.from(valorBase64, "base64");

  const iv = dados.subarray(0, TAMANHO_IV);
  const tag = dados.subarray(TAMANHO_IV, TAMANHO_IV + TAMANHO_TAG);
  const cifrado = dados.subarray(TAMANHO_IV + TAMANHO_TAG);

  const decifrador = crypto.createDecipheriv(ALGORITMO, chave, iv);
  decifrador.setAuthTag(tag);

  const original = Buffer.concat([decifrador.update(cifrado), decifrador.final()]);
  return original.toString("utf8");
}

function compararSeguro(a, b) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");

  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = { encrypt, decrypt, compararSeguro };
