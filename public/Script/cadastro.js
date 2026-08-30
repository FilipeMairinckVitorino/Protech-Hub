import { getMe, postAluno, getAluno, editaAluno } from "./API.js"
import { primeiroNome } from "./exportFunctions.js"

const inputNomeCadastro = document.querySelector("input#nomeCadastro")
const inputCPFCadastro = document.querySelector("input#cpfCadastro")
const inputSenha = document.querySelector("input#senha")
const buttonGerarSenha = document.querySelector("button#gerarSenha")
const buttonCadastrar = document.querySelector("button#cadastrar")
const buttonAtivaCadastro = document.querySelector("button#ativaCadastro")
const buttonAtivaKits = document.querySelector("button#ativaKits")
const kitsInputCPF = document.querySelector("input#cpfKits")
const inputNomeAluno = document.querySelector("input#nomeAluno")
const buttonBusca = document.querySelector("button#buscaCPF")
const checkboxKit1 = document.querySelector('input#kit1')
const checkboxKit2 = document.querySelector('input#kit2')
const buttonConfirmaKits = document.querySelector("button#confirmaKits")
const spanMostraSenha = document.querySelector("span#mostraSenha")

let cpfEncontrado = null

document.querySelectorAll("form").forEach(form => {
    form.addEventListener("submit", (event) => {
        event.preventDefault()
    })
})

const usuario = await getMe()

if (!usuario || usuario.userLv != "admin") {
    window.location.href = "login.html"
} else {

    buttonGerarSenha.addEventListener("click", (event) => {
        event.preventDefault()

        inputSenha.value = gerarSenha(10)

        buttonGerarSenha.style.display = 'none'
        buttonCadastrar.style.display = 'initial'
    })

    buttonCadastrar.addEventListener("click", async (event) => {
        event.preventDefault()

        if (inputNomeCadastro.value.trim() == "") {
            alert("Digite o nome do aluno")
            return
        } else if (inputCPFCadastro.value == "") {
            alert("Digite o CPF")
            return
        } else if (inputSenha.value == "") {
            alert("Gere uma senha")
            return
        }

        const resultado = await postAluno(primeiroNome(inputNomeCadastro.value), inputCPFCadastro.value, inputSenha.value)

        if (resultado) {
            inputNomeCadastro.value = ""
            inputCPFCadastro.value = ""
            inputSenha.value = ""
            buttonCadastrar.style.display = 'none'
            buttonGerarSenha.style.display = 'initial'
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

    buttonBusca.addEventListener("click", async (event) => {
        event.preventDefault()

        const aluno = await getAluno(kitsInputCPF.value)

        if (!aluno) return

        cpfEncontrado = aluno.CPF

        inputNomeAluno.value = aluno.Nome
        checkboxKit1.checked = aluno.Kit1 == true
        checkboxKit2.checked = aluno.Kit2 == true

        spanMostraSenha.innerHTML = `Senha: ${aluno.Senha}`

        document.querySelector("div#kitOcult").style.display = 'block'
    })

    buttonConfirmaKits.addEventListener("click", async (event) => {
        event.preventDefault()

        if (cpfEncontrado == null) return

        if (inputNomeAluno.value.trim() == "") {
            alert("O nome do aluno não pode ficar em branco")
            return
        }

        editaAluno(cpfEncontrado, checkboxKit1.checked, checkboxKit2.checked, primeiroNome(inputNomeAluno.value))
    })
}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.
