const express = require("express");
const { supabase } = require("../config/supabase");
const { requireAuth, requireRole } = require("../middleware/auth");
const { normalizarCPF, cpfValido } = require("../utils/cpf");
const { calcularProgressoPorApostila } = require("../utils/progresso");

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

    const { data: apostilasInfo, error: erroApostilasInfo } = await supabase
      .from("apostilas")
      .select("id, nome");

    if (erroApostilasInfo) throw erroApostilasInfo;

    const nomesPorApostila = new Map((apostilasInfo || []).map((a) => [a.id, a.nome]));
    const kitsPorApostila = new Map(atividades.map((a) => [a.apostila, a.kit]));

    const progresso = calcularProgressoPorApostila(atividades, concluidas);

    const apostilasComProgresso = Object.keys(progresso)
      .map((apostila) => {
        const apostilaNum = Number(apostila);
        const { total, feitas } = progresso[apostila];
        return {
          apostila: apostilaNum,
          nome: nomesPorApostila.get(apostilaNum) || null,
          kit: kitsPorApostila.get(apostilaNum) ?? null,
          total,
          feitas,
          completa: total > 0 && feitas >= total,
        };
      })
      .filter((item) => item.feitas > 0)
      .sort((a, b) => a.apostila - b.apostila);

    res.json({ nome: aluno.nome, cpf: aluno.cpf, apostilas: apostilasComProgresso });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
