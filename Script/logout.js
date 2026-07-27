const botaoLogout = document.querySelector("button#logout")

if (botaoLogout) {
    botaoLogout.addEventListener("click", () => {
        const confirmar = confirm("Deseja realmente sair?")
        if (!confirmar) return

        localStorage.removeItem("user")
        localStorage.removeItem("apostila")
        window.location.href = "login.html"
    })
}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.
