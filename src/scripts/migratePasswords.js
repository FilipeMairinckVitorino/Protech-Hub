require("dotenv").config();
const bcrypt = require("bcrypt");
const { supabase } = require("../config/supabase");

function jaEhHash(valor) {
  return /^\$2[aby]\$/.test(valor);
}

async function main() {
  const { data: alunos, error } = await supabase.from("alunos").select("cpf, senha");

  if (error) {
    console.error("Não foi possível buscar os alunos:", error);
    process.exit(1);
  }

  let migrados = 0;
  let ignorados = 0;

  for (const aluno of alunos) {
    if (jaEhHash(aluno.senha)) {
      ignorados++;
      continue;
    }

    const hash = await bcrypt.hash(aluno.senha, 12);

    const { error: erroUpdate } = await supabase
      .from("alunos")
      .update({ senha: hash })
      .eq("cpf", aluno.cpf);

    if (erroUpdate) {
      console.error(`Falha ao migrar CPF ${aluno.cpf}:`, erroUpdate);
      continue;
    }

    migrados++;
    console.log(`CPF ${aluno.cpf} migrado.`);
  }

  console.log(`\nConcluído. ${migrados} senha(s) migrada(s), ${ignorados} já estavam em hash.`);
}

main();
