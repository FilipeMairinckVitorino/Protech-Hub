// Calcula, a partir da lista de atividades de uma ou mais apostilas e da lista
// de atividades já concluídas por um aluno, quantas atividades cada apostila
// tem no total e quantas dessas já foram concluídas.
//
// atividades: [{ id, apostila, ... }]
// concluidas: [{ atividade_id, apostila, ... }] (já filtradas por aluno_id e concluida = true)
//
// Retorna: { [apostilaId]: { total: number, feitas: number } }
function calcularProgressoPorApostila(atividades, concluidas) {
  const progresso = {};

  (atividades || []).forEach((atividade) => {
    const apostila = atividade.apostila;
    if (!progresso[apostila]) {
      progresso[apostila] = { total: 0, feitas: 0 };
    }
    progresso[apostila].total++;
  });

  const idsContados = new Set();

  (concluidas || []).forEach((concluida) => {
    if (idsContados.has(concluida.atividade_id)) return;
    idsContados.add(concluida.atividade_id);

    const apostila = concluida.apostila;
    if (!progresso[apostila]) {
      progresso[apostila] = { total: 0, feitas: 0 };
    }
    progresso[apostila].feitas++;
  });

  return progresso;
}

module.exports = { calcularProgressoPorApostila };
