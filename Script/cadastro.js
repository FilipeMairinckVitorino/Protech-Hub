import { editaCTR, postAluno, getAluno, linkAPI_users, chaveAPI } from "./API.js"
import { loadingInit } from "./exportFunctions.js"

const inputSenha = document.querySelector("input#senha")
const cadastroInputCTR = document.querySelector("form.cadastro input.ctr")
const buttonGerarSenha = document.querySelector("button#gerarSenha")
const buttonCadastrar = document.querySelector("button#cadastrar")
const buttonAtivaCadastro = document.querySelector("button#ativaCadastro")
const buttonAtivaKits = document.querySelector("button#ativaKits")
const kitsInputCTR = document.querySelector("form.kits input.ctr")
const buttonBusca = document.querySelector("button#buscaCTR")
const checkboxKit1 = document.querySelector('input#kit1')
const checkboxKit2 = document.querySelector('input#kit2')
const buttonConfirmaKits = document.querySelector("button#confirmaKits")
const spanMostraSenha = document.querySelector("span#mostraSenha")
const userSalvo = JSON.parse(sessionStorage.getItem("user"))

if(userSalvo == null || userSalvo.CTR != 0) {
    window.location.href = "login.html"
} else {

    buttonGerarSenha.addEventListener("click", (event)=>{
        event.preventDefault()

        inputSenha.value = gerarSenha(10)

        buttonGerarSenha.style.display = 'none'
        buttonCadastrar.style.display = 'initial'
    })

    buttonCadastrar.addEventListener("click", async (event)=>{
        event.preventDefault()

        if (cadastroInputCTR.value == ""){

            alert("Digite o CTR")

        } else if (inputSenha.value == ""){

            alert("Gere uma senha")
            location.reload()

        } else {

            await postAluno(linkAPI_users, chaveAPI, cadastroInputCTR.value, inputSenha.value, false, false)

        }
    })

    function gerarSenha(tamanho) {

        const caracteres = "abcdefghijklmnopqrstuvwxyz0123456789#$&";
        let senha = ""

        for (let i = 0; i < tamanho; i++) {
            const indice = Math.floor(Math.random() * caracteres.length)
            senha += caracteres[indice]
        }

        return senha
    }

    let ativo = "cadastro"

    buttonAtivaKits.addEventListener("click", (event) => {
        event.preventDefault()

        if (ativo === "kits") return

        document.querySelector("form.cadastro").style.display = "none"
        document.querySelector("form.kits").style.display = "initial"

        buttonAtivaCadastro.style.cssText = `
            box-shadow: none;
            color: white;
            cursor: pointer;
        `

        buttonAtivaKits.style.cssText = `
            box-shadow: inset 0px 2px 6px rgba(0, 0, 0, 0.356);
            color: rgba(247, 246, 246, 0.596);
            cursor: auto;
        `

        ativo = "kits"
    })

    buttonAtivaCadastro.addEventListener("click", (event) => {
        event.preventDefault()

        if (ativo === "cadastro") return

        document.querySelector("form.kits").style.display = "none";
        document.querySelector("form.cadastro").style.display = "initial"

        buttonAtivaKits.style.cssText = `
            box-shadow: none;
            color: white;
            cursor: pointer;
        `

        buttonAtivaCadastro.style.cssText = `
            box-shadow: inset 0px 2px 6px rgba(0, 0, 0, 0.356);
            color: rgba(247, 246, 246, 0.596);
            cursor: auto;
        `

        ativo = "cadastro"
    })

    buttonBusca.addEventListener("click", async(event)=>{
        event.preventDefault()

        let aluno = await getAluno(linkAPI_users, chaveAPI, kitsInputCTR.value)

        if (!aluno || aluno.length == 0) {
            alert("CTR não encontrado.")
            return
        }

        if (aluno[0].Kit1 == true) {
            checkboxKit1.checked = true
        } else {
            checkboxKit1.checked = false
        }

        if (aluno[0].Kit2 == true) {
            checkboxKit2.checked = true
        } else {
            checkboxKit2.checked = false
        }

        spanMostraSenha.innerHTML = `Senha: ${aluno[0].Senha}`

        document.querySelector("div#kitOcult").style.display = 'block'
    })

    buttonConfirmaKits.addEventListener("click", async (event)=>{
        event.preventDefault()

        editaCTR(linkAPI_users, chaveAPI, kitsInputCTR.value, checkboxKit1.checked, checkboxKit2.checked)
    })
}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.