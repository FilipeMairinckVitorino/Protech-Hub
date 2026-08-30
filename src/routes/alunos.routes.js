const express = require("express");
const crypto = require("crypto");
const { z } = require("zod");
const { supabase } = require("../config/supabase");
const { requireAuth, requireRole } = require("../middleware/auth");
const { encrypt, decrypt } = require("../utils/crypto");
const { normalizarCPF, cpfValido } = require("../utils/cpf");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

function gerarSenhaAleatoria(tamanho = 10) {
  const caracteres = "abcdefghijkmnpqrstuvwxyz23456789#$&";
  return Array.from(crypto.randomFillSync(new Uint32Array(tamanho)))
    .map((n) => caracteres[n % caracteres.length])
    .join("");
}

const cpfSchema = z
  .string()
  .transform(normalizarCPF)
  .refine(cpfValido, { message: "CPF precisa ter 11 dígitos" });

const nomeSchema = z
  .string()
  .trim()
  .min(1, "Informe o nome do aluno")
  .transform((valor) => valor.split(/\s+/)[0]);

const cadastroSchema = z.object({
  nome: nomeSchema,
  cpf: cpfSchema,
  senha: z.string().min(4, "Senha muito curta"),
});

router.post("/", async (req, res, next) => {
  try {
    const { nome, cpf, senha } = cadastroSchema.parse(req.body);

    const senhaCriptografada = encrypt(senha);

    const { data, error } = await supabase
      .from("alunos")
      .insert({
        nome: nome,
        cpf: cpf,
        senha: senhaCriptografada,
        kit1: false,
        kit2: false,
      })
      .select("id, nome, cpf")
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({ erro: "Esse CPF já está cadastrado" });
      }
      throw error;
    }

    res.status(201).json({ id: data.id, nome: data.nome, cpf: data.cpf });
  } catch (err) {
    next(err);
  }
});

router.get("/:cpf", async (req, res, next) => {
  try {
    // Aqui só normalizamos (removemos pontuação) para casar com o formato
    // salvo no banco. Não exigimos 11 dígitos: a busca de kits deve poder
    // ser feita com qualquer valor, retornando 404 se não encontrar.
    const cpf = normalizarCPF(req.params.cpf);

    const { data: aluno, error } = await supabase
      .from("alunos")
      .select("id, nome, cpf, senha, kit1, kit2, userlv")
      .eq("cpf", cpf)
      .maybeSingle();

    if (error) throw error;
    if (!aluno) return res.status(404).json({ erro: "CPF não encontrado" });

    let senhaVisivel;
    try {
      senhaVisivel = decrypt(aluno.senha);
    } catch {
      senhaVisivel = "(senha antiga em hash — gere uma nova para poder visualizá-la)";
    }

    res.json({
      Nome: aluno.nome,
      CPF: aluno.cpf,
      Senha: senhaVisivel,
      Kit1: aluno.kit1,
      Kit2: aluno.kit2,
      userLv: aluno.userlv,
    });
  } catch (err) {
    next(err);
  }
});

// Diferente do cadastro (que guarda só o primeiro nome), a edição aceita
// o nome completo digitado, sem cortar para a primeira palavra.
const nomeEdicaoSchema = z
  .string()
  .trim()
  .min(1, "Informe o nome do aluno");

const atualizaSchema = z.object({
  kit1: z.boolean().optional(),
  kit2: z.boolean().optional(),
  nome: nomeEdicaoSchema.optional(),
});

router.patch("/:cpf", async (req, res, next) => {
  try {
    // Mesma lógica do GET acima: só normaliza, sem exigir 11 dígitos.
    const cpf = normalizarCPF(req.params.cpf);

    const { kit1, kit2, nome } = atualizaSchema.parse(req.body);

    const dadosAtualizados = {};
    if (kit1 !== undefined) dadosAtualizados.kit1 = kit1;
    if (kit2 !== undefined) dadosAtualizados.kit2 = kit2;
    if (nome !== undefined) dadosAtualizados.nome = nome;

    if (Object.keys(dadosAtualizados).length === 0) {
      return res.status(400).json({ erro: "Nada para atualizar" });
    }

    const { data, error } = await supabase
      .from("alunos")
      .update(dadosAtualizados)
      .eq("cpf", cpf)
      .select("cpf");

    if (error) throw error;
    // Checamos pelos dados retornados (não por "count"): o supabase-js nem
    // sempre preenche "count" de forma confiável em updates, o que fazia
    // esse endpoint responder 404 mesmo quando o aluno existia.
    if (!data || data.length === 0) {
      return res.status(404).json({ erro: "CPF não encontrado" });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.post("/:cpf/reset-senha", async (req, res, next) => {
  try {
    const cpf = normalizarCPF(req.params.cpf);
    if (!cpfValido(cpf)) {
      return res.status(400).json({ erro: "CPF inválido" });
    }

    const senhaPlana = gerarSenhaAleatoria(10);
    const senhaCriptografada = encrypt(senhaPlana);

    const { data, error } = await supabase
      .from("alunos")
      .update({ senha: senhaCriptografada })
      .eq("cpf", cpf)
      .select("cpf");

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ erro: "CPF não encontrado" });
    }

    res.json({ cpf, senha: senhaPlana });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
