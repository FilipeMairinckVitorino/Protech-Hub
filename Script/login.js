import { chaveAPI, linkAPI_users, login } from "./API.js"

const olho = document.querySelector("button#olho")
const inputSenha = document.querySelector("input#senha")
let verSenha = false
const inputCTR = document.querySelector("input#ctr")
const buttonEntrar = document.querySelector("button#entrar")

inputCTR.addEventListener("input", () => {
    inputCTR.value = inputCTR.value.replace(/\D/g, "");
})

olho.addEventListener("click", (event) => {
    event.preventDefault()

    if (verSenha == false) {
        inputSenha.type = "text"
        olho.classList.add("aberto")
        verSenha = true
    } else {
        inputSenha.type = "password"
        olho.classList.remove("aberto")
        verSenha = false
    }
})

buttonEntrar.addEventListener("click", async (event)=>{
    event.preventDefault()

    let aluno = await login(linkAPI_users, chaveAPI, parseInt(inputCTR.value))

    if (aluno.length > 0) {

        if(aluno[0].Senha == inputSenha.value) {

            sessionStorage.setItem("user", JSON.stringify(aluno[0]))

            if (aluno[0].userLv == "admin") {
                window.location.href = "cadastro.html"
            } else {
                window.location.href = "index.html"
            }

        } else {
            alert("Senha incorreta")
        }

    } else {
        alert("CTR incorreto")
    }
})

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.
