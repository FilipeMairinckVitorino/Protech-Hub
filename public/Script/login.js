import { login } from "./API.js"

const olho = document.querySelector("button#olho")
const inputSenha = document.querySelector("input#senha")
let verSenha = false
const inputCPF = document.querySelector("input#cpf")
const buttonEntrar = document.querySelector("button#entrar")

olho.addEventListener("click", (event) => {
    event.preventDefault();

    if (verSenha == false) {
        inputSenha.type = "text";
        olho.classList.add("aberto");
        verSenha = true;
    } else {
        inputSenha.type = "password";
        olho.classList.remove("aberto");
        verSenha = false;
    }
});

buttonEntrar.addEventListener("click", async (event) => {
    event.preventDefault()

    const usuario = await login(inputCPF.value, inputSenha.value)

    if (!usuario) return

    if (usuario.userLv == "admin") {
        window.location.href = "cadastro.html"
    } else if (usuario.userLv == "professor") {
        window.location.href = "progresso.html"
    } else {
        window.location.href = "index.html"
    }
})

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.
