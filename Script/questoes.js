import { chaveAPI, concluirAtividade, getQuestoes, linkAPI_atividades_concluidas, linkAPI_questoes } from "./API.js"

const atividade_id = new URLSearchParams(window.location.search).get("atividade_id")
const questoesContainer = document.querySelector("div#questoesContainer")
const user = JSON.parse(localStorage.getItem("user")).CTR
const apostila = localStorage.getItem("apostila")
const userViewer = document.querySelector("span#ctr_view")
const botaoEnviar = document.querySelector("button#enviar")
const formQuestoes = document.querySelector("form.questoes")


if (!user || !atividade_id) {
    window.location.href = "apostila.html"
} else {

    userViewer.innerHTML = user
    
    criarPerguntas()
}

async function criarPerguntas() {

    let questoes = await getQuestoes(linkAPI_questoes, chaveAPI, atividade_id)

    if (questoes.length > 0) {
            questoes.forEach(element => {
            questoesContainer.innerHTML += `
                <fieldset class="questao" id=${element.id}>
                    <legend>${element.Pergunta}</legend>
                    <label>
                        <input type="radio" name="q_${element.id}" value="a">
                        ${element.a}
                    </label>
                    <label>
                        <input type="radio" name="q_${element.id}" value="b">
                        ${element.b}
                    </label>
                    <label>
                        <input type="radio" name="q_${element.id}" value="c">
                        ${element.c}
                    </label>
                    <label>
                        <input type="radio" name="q_${element.id}" value="d">
                        ${element.d}
                    </label>
                </fieldset>
            `
        })
    } else {
        window.location.href = "apostila.html"
    }

    botaoEnviar.addEventListener("click", async(event) => {
        event.preventDefault()

        const fieldsets = document.querySelectorAll("fieldset.questao")

        const todasRespondidas = [...fieldsets].every(element => {
            return element.querySelector("input:checked") != null
        })

        if (!todasRespondidas) {
            alert("Responda todas as questões antes de enviar")
            return
        }

        const respostasUsuario = {}
        fieldsets.forEach(element => {
            respostasUsuario[element.id] = element.querySelector("input:checked").value
        })

        let enviado = await concluirAtividade(linkAPI_atividades_concluidas, chaveAPI, user, atividade_id, apostila)

        if (!enviado) {
            return
        } else {
            mostrarResultado(questoes, respostasUsuario)
        }
        
    })
}


function mostrarResultado(questoes, respostasUsuario) {

    let acertos = 0

    questoesContainer.innerHTML = ""

    questoes.forEach(element => {
        const respostaUsuario = respostasUsuario[element.id]
        const respostaCorreta = element.resp
        const acertou = respostaUsuario === respostaCorreta

        if (acertou) acertos++

        const alternativas = ["a", "b", "c", "d"].map(letra => {
            let classe = ""
            let marcador = ""

            if (letra === respostaCorreta) {
                classe = "correta"
                marcador = " ✔"
            }
            if (letra === respostaUsuario && !acertou) {
                classe = "incorreta"
                marcador = " ✖"
            }

            return `
                <div class="alternativa ${classe}">
                    <strong>${letra.toUpperCase()})</strong> ${element[letra]}${marcador}
                </div>
            `
        }).join("")

        questoesContainer.innerHTML += `
            <fieldset class="questao resultado ${acertou ? "acerto" : "erro"}">
                <legend>${element.Pergunta}</legend>
                ${alternativas}
            </fieldset>
        `
    })

    botaoEnviar.remove()

    const aviso = document.createElement("div")
    aviso.className = "aviso-respostas"
    aviso.innerHTML = `
        <h2>Resultado: ${acertos} de ${questoes.length} acertos</h2>
        <p><strong>Atenção:</strong> esta é a única vez que você verá as respostas corretas desta atividade. Ao sair ou atualizar a página, elas não estarão mais disponíveis.</p>
        <button type="button" id="voltarApostila">Voltar para a apostila</button>
    `
    formQuestoes.insertBefore(aviso, questoesContainer)

    document.querySelector("button#voltarApostila").addEventListener("click", () => {
        window.location.href = "apostila.html"
    })

    window.scrollTo({ top: 0, behavior: "smooth" })
}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.
