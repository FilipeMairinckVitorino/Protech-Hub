import { getMe, getProgresso } from "./API.js"
import { loadingInit, loadingEnd } from "./exportFunctions.js"

const inputCPF = document.querySelector("input#cpfProgresso")
const buttonBusca = document.querySelector("button#buscaCPF")
const sectionResultado = document.querySelector("section#resultado")
const divApostilas = document.querySelector("div#apostilasConcluidas")
const spanSemApostilas = document.querySelector("span#semApostilas")
const tituloResultado = document.querySelector("h2#tituloResultado")

const usuario = await getMe()

if (!usuario || (usuario.userLv != "professor" && usuario.userLv != "admin")) {
    window.location.href = "login.html"
} else {

    buttonBusca.addEventListener("click", async (event) => {
        event.preventDefault()

        const cpf = inputCPF.value

        if (cpf == "") {
            alert("Digite o CPF")
            return
        }

        loadingInit(buttonBusca, document.querySelector("div#buscaLoad"))

        try {
            const resultado = await getProgresso(cpf)

            if (resultado == null) return

            mostraResultado(resultado)

        } finally {
            loadingEnd(buttonBusca, document.querySelector("div#buscaLoad"))
        }
    })
}

function mostraResultado(resultado) {

    const { nome, cpf, completas } = resultado

    divApostilas.innerHTML = ""
    sectionResultado.style.display = "block"
    tituloResultado.innerHTML = `Módulos concluídos - ${nome} — ${cpf}`

    if (completas.length == 0) {
        divApostilas.style.display = "none"
        spanSemApostilas.style.display = "block"
        return
    }

    spanSemApostilas.style.display = "none"
    divApostilas.style.display = "flex"

    completas.forEach(element => {
        divApostilas.innerHTML += `
            <div class="apostilaConcluida">
                <img src="Image/Apostilas/${element.apostila}.png" alt="apostila">
                <div class="infoApostila">
                    <span class="tituloApostila">Apostila ${String(element.apostila).padStart(2, "0")} <strong>✔</strong></span>
                    <span class="detalheApostila">${element.total} atividades concluídas</span>
                </div>
            </div>
        `
    })
}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.
