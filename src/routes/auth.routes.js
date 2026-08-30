const express = require("express");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");
const { supabase } = require("../config/supabase");
const { assinarToken } = require("../utils/jwt");
const { NOME_COOKIE, opcoesCookie } = require("../utils/cookie");
const { requireAuth } = require("../middleware/auth");
const { decrypt, compararSeguro } = require("../utils/crypto");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: "Muitas tentativas de login. Tente novamente mais tarde." },
});

// No login, o campo "cpf" funciona como identificador de usuário genérico:
// alunos usam o CPF, mas admins e professores podem usar nome ou qualquer
// outro valor cadastrado diretamente no banco. Por isso, aqui não fazemos
// nenhuma validação de formato de CPF — só garantimos que não veio vazio.
const loginSchema = z.object({
  cpf: z
    .string()
    .trim()
    .min(1, { message: "Informe seu usuário" }),
  senha: z.string().min(1),
});

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { cpf, senha } = loginSchema.parse(req.body);

    const { data: aluno, error } = await supabase
      .from("alunos")
      .select("id, nome, cpf, senha, kit1, kit2, userlv")
      .eq("cpf", cpf)
      .maybeSingle();

    if (error) throw error;

    if (!aluno) {
      return res.status(401).json({ erro: "CPF ou senha incorretos" });
    }

    const senhaConfere = (() => {
      try {
        const senhaSalva = decrypt(aluno.senha);
        return compararSeguro(senha, senhaSalva);
      } catch {
        return false;
      }
    })();

    if (!senhaConfere) {
      return res.status(401).json({ erro: "CPF ou senha incorretos" });
    }

    const token = assinarToken({ id: aluno.id, userLv: aluno.userlv || "aluno" });

    res.cookie(NOME_COOKIE, token, opcoesCookie());

    res.json({
      nome: aluno.nome,
      cpf: aluno.cpf,
      userLv: aluno.userlv || "aluno",
      kit1: aluno.kit1,
      kit2: aluno.kit2,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie(NOME_COOKIE, opcoesCookie());
  res.status(204).end();
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { data: aluno, error } = await supabase
      .from("alunos")
      .select("nome, cpf, kit1, kit2, userlv")
      .eq("id", req.user.id)
      .maybeSingle();

    if (error) throw error;

    if (!aluno) {
      return res.status(401).json({ erro: "Usuário não encontrado" });
    }

    res.json({
      nome: aluno.nome,
      cpf: aluno.cpf,
      userLv: aluno.userlv || "aluno",
      kit1: aluno.kit1,
      kit2: aluno.kit2,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
