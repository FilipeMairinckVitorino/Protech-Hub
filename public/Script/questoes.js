import { getMe, getQuestoes, responderAtividade } from "./API.js"

const atividade_id = new URLSearchParams(window.location.search).get("atividade_id")
const questoesContainer = document.querySelector("div#questoesContainer")
const userViewer = document.querySelector("span#nome_view")
const botaoEnviar = document.querySelector("button#enviar")
const formQuestoes = document.querySelector("form.questoes")

const usuario = await getMe()

if (!usuario) {
    window.location.href = "login.html"
} else if (!atividade_id) {
    window.location.href = "apostila.html"
} else {

    userViewer.innerHTML = usuario.nome

    criarPerguntas()
}

async function criarPerguntas() {

    let questoes = await getQuestoes(atividade_id)

    if (!questoes) return

    if (questoes.length > 0) {
        
        document.querySelector("section.questoes").style.display = 'block'
        
        questoes.forEach(element => {
            questoesContainer.innerHTML += `
                <fieldset class="questao" data-id="${element.id}">
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

    botaoEnviar.style.display = "inline-block"

    botaoEnviar.addEventListener("click", async (event) => {
        event.preventDefault()

        const fieldsets = document.querySelectorAll("fieldset.questao")

        const todasRespondidas = [...fieldsets].every(element => {
            return element.querySelector("input:checked") != null
        })

        if (!todasRespondidas) {
            alert("Responda todas as questões antes de enviar")
            return
        }

        const respostas = {}
        fieldsets.forEach(element => {
            respostas[element.dataset.id] = element.querySelector("input:checked").value
        })

        const resultado = await responderAtividade(atividade_id, respostas)

        if (!resultado) return

        mostrarResultado(resultado)
    })
}

function mostrarResultado(resultado) {

    const { acertos, total, detalhes } = resultado

    questoesContainer.innerHTML = ""

    detalhes.forEach(element => {
        const acertou = element.acertou

        const alternativas = ["a", "b", "c", "d"].map(letra => {
            let classe = ""
            let marcador = ""

            if (letra === element.respostaCorreta) {
                classe = "correta"
                marcador = " ✔"
            }
            if (letra === element.respostaUsuario && !acertou) {
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
        <h2>Resultado: ${acertos} de ${total} acertos</h2>
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
