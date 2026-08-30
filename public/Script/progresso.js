import { getMe, getProgresso } from "./API.js"
import { nomeViewHTML } from "./exportFunctions.js"

const usuario = await getMe()

if (!usuario || (usuario.userLv != "professor" && usuario.userLv != "admin")) {
    window.location.href = "login.html"
} else {

    const nomeView = document.querySelector("span#nome_view")
    const form = document.querySelector("form.progresso")
    const inputCPF = document.querySelector("input#cpfProgresso")
    const buttonBusca = document.querySelector("button#buscaCPF")
    const loadBusca = document.querySelector("div#buscaLoad")
    const sectionResultado = document.querySelector("section#resultado")
    const tituloResultado = document.querySelector("h2#tituloResultado")
    const divApostilas = document.querySelector("div#apostilasConcluidas")
    const semApostilas = document.querySelector("span#semApostilas")

    nomeView.innerHTML = nomeViewHTML(usuario.nome)

    document.querySelector("span.logo").addEventListener("click", () => {
        location.href = "index.html"
    })

    form.addEventListener("submit", async (event) => {
        event.preventDefault()

        buttonBusca.style.display = 'none'
        loadBusca.style.display = 'block'

        const resultado = await getProgresso(inputCPF.value)

        buttonBusca.style.display = ''
        loadBusca.style.display = 'none'

        if (!resultado) return

        tituloResultado.innerHTML = `Progresso de ${resultado.nome}`
        divApostilas.innerHTML = ""

        // O backend (/api/professor/progresso/:cpf) já retorna somente as
        // apostilas em que o aluno concluiu pelo menos uma atividade,
        // incluindo tanto as que estão em andamento quanto as já concluídas.
        const apostilas = resultado.apostilas || []

        if (apostilas.length === 0) {
            semApostilas.style.display = 'block'
        } else {
            semApostilas.style.display = 'none'

            apostilas.forEach((apostila) => {
                const total = apostila.total || 0
                const feitas = apostila.feitas || 0
                const porcentagem = total > 0 ? Math.min(100, Math.round((feitas / total) * 100)) : 0
                const completa = !!apostila.completa

                divApostilas.innerHTML += `
                    <div class="apostilaConcluida">
                        <div class="infoApostila">
                            <span class="tituloApostila">${apostila.nome || `Apostila ${apostila.apostila}`}</span>
                            <div class="barraProgresso" role="progressbar" aria-valuenow="${porcentagem}" aria-valuemin="0" aria-valuemax="100" aria-label="Progresso da apostila ${apostila.apostila}">
                                <div class="barraProgressoFundo">
                                    <div class="barraProgressoPreenchida${completa ? ' completa' : ''}" style="width: ${porcentagem}%"></div>
                                </div>
                                <span class="barraProgressoTexto">${feitas} de ${total} atividades</span>
                            </div>
                            <span class="statusApostila${completa ? ' completa' : ''}">${completa ? 'Concluída' : 'Em andamento'}</span>
                        </div>
                    </div>
                `
            })
        }

        sectionResultado.style.display = 'block'
    })
}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.
