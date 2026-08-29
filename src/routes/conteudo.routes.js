const express = require("express");
const { z } = require("zod");
const { supabase } = require("../config/supabase");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/apostilas", async (req, res, next) => {
  try {
    const { data: aluno, error: erroAluno } = await supabase
      .from("alunos")
      .select("kit1, kit2")
      .eq("id", req.user.id)
      .maybeSingle();

    if (erroAluno) throw erroAluno;
    if (!aluno) return res.status(404).json({ erro: "Usuário não encontrado" });

    const kits = [];
    if (aluno.kit1) kits.push(1);
    if (aluno.kit2) kits.push(2);

    if (kits.length === 0) return res.json([]);

    const { data: apostilas, error } = await supabase
      .from("apostilas")
      .select("id, nome, kit")
      .in("kit", kits);

    if (error) throw error;

    res.json(apostilas);
  } catch (err) {
    next(err);
  }
});

async function alunoTemAcessoApostila(alunoId, apostilaId) {
  const { data: aluno } = await supabase
    .from("alunos")
    .select("kit1, kit2")
    .eq("id", alunoId)
    .maybeSingle();

  const { data: apostila } = await supabase
    .from("apostilas")
    .select("id, kit")
    .eq("id", apostilaId)
    .maybeSingle();

  if (!aluno || !apostila) return false;
  if (apostila.kit === 1) return !!aluno.kit1;
  if (apostila.kit === 2) return !!aluno.kit2;
  return false;
}

router.get("/apostilas/:id/atividades", async (req, res, next) => {
  try {
    const apostilaId = Number(req.params.id);

    const temAcesso = await alunoTemAcessoApostila(req.user.id, apostilaId);
    if (!temAcesso) return res.status(403).json({ erro: "Sem acesso a essa apostila" });

    const { data: atividades, error } = await supabase
      .from("atividades")
      .select("id, kit, apostila, paginas")
      .eq("apostila", apostilaId);

    if (error) throw error;

    const { data: concluidas, error: erroConcluidas } = await supabase
      .from("atividades_concluidas")
      .select("atividade_id, concluida")
      .eq("aluno_id", req.user.id)
      .eq("apostila", apostilaId);

    if (erroConcluidas) throw erroConcluidas;

    const mapaConcluidas = new Map(
      (concluidas || []).map((c) => [c.atividade_id, c.concluida])
    );

    res.json(
      atividades.map((a) => ({
        ...a,
        concluida: mapaConcluidas.get(a.id) === true,
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.get("/atividades/:id/questoes", async (req, res, next) => {
  try {
    const atividadeId = Number(req.params.id);

    const { data: atividade } = await supabase
      .from("atividades")
      .select("id, apostila")
      .eq("id", atividadeId)
      .maybeSingle();

    if (!atividade) return res.status(404).json({ erro: "Atividade não encontrada" });

    const temAcesso = await alunoTemAcessoApostila(req.user.id, atividade.apostila);
    if (!temAcesso) return res.status(403).json({ erro: "Sem acesso a essa atividade" });

    const { data: questoes, error } = await supabase
      .from("questoes")
      .select("id, Pergunta:pergunta, a, b, c, d")
      .eq("atividade_id", atividadeId);

    if (error) throw error;

    res.json(questoes);
  } catch (err) {
    next(err);
  }
});

const respostasSchema = z.object({
  respostas: z.record(z.string(), z.enum(["a", "b", "c", "d"])),
});

router.post("/atividades/:id/responder", async (req, res, next) => {
  try {
    const atividadeId = Number(req.params.id);
    const { respostas } = respostasSchema.parse(req.body);

    const { data: atividade } = await supabase
      .from("atividades")
      .select("id, apostila")
      .eq("id", atividadeId)
      .maybeSingle();

    if (!atividade) return res.status(404).json({ erro: "Atividade não encontrada" });

    const temAcesso = await alunoTemAcessoApostila(req.user.id, atividade.apostila);
    if (!temAcesso) return res.status(403).json({ erro: "Sem acesso a essa atividade" });

    const { data: questoes, error: erroQuestoes } = await supabase
      .from("questoes")
      .select("id, Pergunta:pergunta, a, b, c, d, resp")
      .eq("atividade_id", atividadeId);

    if (erroQuestoes) throw erroQuestoes;
    if (!questoes || questoes.length === 0) {
      return res.status(404).json({ erro: "Atividade sem questões" });
    }

    const todasRespondidas = questoes.every((q) => respostas[q.id] !== undefined);
    if (!todasRespondidas) {
      return res.status(400).json({ erro: "Responda todas as questões antes de enviar" });
    }

    let acertos = 0;
    const detalhes = questoes.map((q) => {
      const respostaUsuario = respostas[q.id];
      const acertou = respostaUsuario === q.resp;
      if (acertou) acertos++;
      return {
        id: q.id,
        Pergunta: q.Pergunta,
        a: q.a,
        b: q.b,
        c: q.c,
        d: q.d,
        respostaUsuario,
        respostaCorreta: q.resp,
        acertou,
      };
    });

    const { data: existente } = await supabase
      .from("atividades_concluidas")
      .select("id")
      .eq("aluno_id", req.user.id)
      .eq("atividade_id", atividadeId)
      .maybeSingle();

    if (existente) {
      const { error } = await supabase
        .from("atividades_concluidas")
        .update({ concluida: true })
        .eq("id", existente.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("atividades_concluidas").insert({
        aluno_id: req.user.id,
        atividade_id: atividadeId,
        apostila: atividade.apostila,
        concluida: true,
      });
      if (error) throw error;
    }

    res.json({ acertos, total: questoes.length, detalhes });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
