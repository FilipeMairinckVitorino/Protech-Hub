import { getMe, getProgresso } from "./API.js"

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

    nomeView.innerHTML = usuario.nome

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

        tituloResultado.innerHTML = `Apostilas concluídas de ${resultado.nome}`
        divApostilas.innerHTML = ""

        const apostilasCompletas = (resultado.apostilas || []).filter((a) => a.completa)

        if (apostilasCompletas.length === 0) {
            semApostilas.style.display = 'block'
        } else {
            semApostilas.style.display = 'none'

            apostilasCompletas.forEach((apostila) => {
                divApostilas.innerHTML += `
                    <div class="apostilaConcluida">
                        <div class="infoApostila">
                            <span class="tituloApostila">${apostila.nome || `Apostila ${apostila.apostila}`}</span>
                            <span class="detalheApostila">Kit ${apostila.kit ?? "-"} — <strong>${apostila.feitas}/${apostila.total}</strong> atividades concluídas</span>
                        </div>
                    </div>
                `
            })
        }

        sectionResultado.style.display = 'block'
    })
}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.
