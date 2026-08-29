import { logout } from "./API.js"

const botaoLogout = document.querySelector("button#logout")

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
