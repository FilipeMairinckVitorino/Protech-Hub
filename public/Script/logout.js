import { logout } from "./API.js"

const botaoLogout = document.querySelector("button#logout")
const nomeView = document.querySelector("span#nome_view")
const secaoUser = document.querySelector("section.user")

// No mobile, o nome vira um círculo com a inicial; tocar nele abre um
// pequeno menu com o botão "Sair" (ver CSS: section.user.aberto button.logout)
if (nomeView && secaoUser) {
    nomeView.setAttribute("role", "button")
    nomeView.setAttribute("aria-haspopup", "true")
    nomeView.setAttribute("aria-expanded", "false")

    nomeView.addEventListener("click", (event) => {
        event.stopPropagation()
        const aberto = secaoUser.classList.toggle("aberto")
        nomeView.setAttribute("aria-expanded", String(aberto))
    })

    document.addEventListener("click", (event) => {
        if (!secaoUser.contains(event.target)) {
            secaoUser.classList.remove("aberto")
            nomeView.setAttribute("aria-expanded", "false")
        }
    })
}

if (botaoLogout) {
    botaoLogout.addEventListener("click", async () => {
        const confirmar = confirm("Deseja realmente sair?")
        if (!confirmar) return

        await logout()
        localStorage.removeItem("apostila")
        window.location.href = "login.html"
    })
}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.
