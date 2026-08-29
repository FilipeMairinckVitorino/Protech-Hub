const express = require("express");
const { supabase } = require("../config/supabase");
const { requireAuth, requireRole } = require("../middleware/auth");
const { normalizarCPF, cpfValido } = require("../utils/cpf");

const router = express.Router();

router.use(requireAuth, requireRole("professor", "admin"));

router.get("/progresso/:cpf", async (req, res, next) => {
  try {
    const cpf = normalizarCPF(req.params.cpf);
    if (!cpfValido(cpf)) {
      return res.status(400).json({ erro: "CPF inválido" });
    }

    const { data: aluno, error: erroAluno } = await supabase
      .from("alunos")
      .select("id, nome, cpf")
      .eq("cpf", cpf)
      .maybeSingle();

    if (erroAluno) throw erroAluno;
    if (!aluno) return res.status(404).json({ erro: "CPF não encontrado" });

    const { data: atividades, error: erroAtividades } = await supabase
      .from("atividades")
      .select("id, kit, apostila");

    if (erroAtividades) throw erroAtividades;

    const { data: concluidas, error: erroConcluidas } = await supabase
      .from("atividades_concluidas")
      .select("atividade_id, apostila")
      .eq("aluno_id", aluno.id)
      .eq("concluida", true);

    if (erroConcluidas) throw erroConcluidas;

    const totalPorApostila = {};
    atividades.forEach((atividade) => {
      const apostila = atividade.apostila;
      if (!totalPorApostila[apostila]) {
        totalPorApostila[apostila] = { kit: atividade.kit, total: 0 };
      }
      totalPorApostila[apostila].total++;
    });

    const feitasPorApostila = {};
    const idsContados = new Set();

    (concluidas || []).forEach((c) => {
      if (idsContados.has(c.atividade_id)) return;
      idsContados.add(c.atividade_id);

      const atividade = atividades.find((a) => a.id === c.atividade_id);
      if (!atividade) return;

      const apostila = atividade.apostila;
      feitasPorApostila[apostila] = (feitasPorApostila[apostila] || 0) + 1;
    });

    const completas = Object.keys(totalPorApostila)
      .map((apostila) => {
        const apostilaNum = Number(apostila);
        const total = totalPorApostila[apostila].total;
        const feitas = feitasPorApostila[apostila] || 0;
        return {
          apostila: apostilaNum,
          kit: totalPorApostila[apostila].kit,
          total,
          feitas,
          completa: total > 0 && feitas >= total,
        };
      })
      .filter((item) => item.completa)
      .sort((a, b) => a.apostila - b.apostila);

    res.json({ nome: aluno.nome, cpf: aluno.cpf, completas });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
