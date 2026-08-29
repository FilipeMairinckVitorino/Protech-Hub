// Normaliza um CPF removendo qualquer caractere que não seja dígito.
function normalizarCPF(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

// Garante que, após normalizado, o CPF tenha exatamente 11 dígitos.
// (Não verifica os dígitos verificadores, só a quantidade de números.)
function cpfValido(cpfNormalizado) {
  return /^\d{11}$/.test(cpfNormalizado);
}

module.exports = { normalizarCPF, cpfValido };
