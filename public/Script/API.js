import { BACKEND_URL } from "./config.js"
import { loadingInit, loadingEnd, normalizarCPF } from "./exportFunctions.js"

async function chamarAPI(caminho, opcoes = {}) {
    const resposta = await fetch(`${BACKEND_URL}${caminho}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(opcoes.headers || {})
        },
        ...opcoes
    })

    return resposta
}

export async function login(usuario, senha) {

    loadingInit(document.querySelector("button#entrar"), document.querySelector("div#loginLoad"))

    try {
        // O login aceita CPF (alunos) ou qualquer outro identificador
        // (nome, número específico etc. para admins/professores), então
        // aqui NÃO normalizamos/removemos caracteres do valor digitado.
        const resposta = await chamarAPI("/auth/login", {
            method: "POST",
            body: JSON.stringify({ cpf: usuario, senha })
        })

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}))
            alert(erro.erro || "CPF ou senha incorretos")
            return null
        }

        return await resposta.json()

    } catch {
        alert("Erro de conexão com o servidor")
        return null
    } finally {
        loadingEnd(document.querySelector("button#entrar"), document.querySelector("div#loginLoad"))
    }
}

export async function logout() {
    try {
        await chamarAPI("/auth/logout", { method: "POST" })
    } catch {}
}

export async function getMe() {
    try {
        const resposta = await chamarAPI("/auth/me")
        if (!resposta.ok) return null
        return await resposta.json()
    } catch {
        return null
    }
}

export async function postAluno(nome, cpf, senha) {

    loadingInit(document.querySelector("button#cadastrar"), document.querySelector("div#cadastroLoad"))

    try {
        const resposta = await chamarAPI("/api/alunos", {
            method: "POST",
            body: JSON.stringify({ nome, cpf: normalizarCPF(cpf), senha })
        })

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}))
            alert(erro.erro || "Não foi possível cadastrar o aluno")
            return null
        }

        const aluno = await resposta.json()
        alert("Aluno cadastrado com sucesso!")
        return aluno

    } catch {
        alert("Não foi possível cadastrar o aluno")
        return null
    } finally {
        loadingEnd(document.querySelector("button#cadastrar"), document.querySelector("div#cadastroLoad"))
    }
}

export async function getAluno(cpf) {

    loadingInit(document.querySelector("button#buscaCPF"), document.querySelector("div#buscaLoad"))

    try {
        const resposta = await chamarAPI(`/api/alunos/${normalizarCPF(cpf)}`)

        if (!resposta.ok) {
            if (resposta.status === 404) {
                alert("CPF não encontrado")
            } else {
                alert("Não foi possível buscar o CPF")
            }
            return null
        }

        return await resposta.json()

    } catch {
        alert("Não foi possível buscar o CPF")
        return null
    } finally {
        loadingEnd(document.querySelector("button#buscaCPF"), document.querySelector("div#buscaLoad"))
    }
}

export async function editaAluno(cpf, kit1Info, kit2Info, nome) {

    loadingInit(document.querySelector("button#confirmaKits"), document.querySelector("div#confirmaKitLoad"))

    try {
        const corpo = { kit1: kit1Info, kit2: kit2Info }
        if (nome !== undefined) corpo.nome = nome

        const resposta = await chamarAPI(`/api/alunos/${normalizarCPF(cpf)}`, {
            method: "PATCH",
            body: JSON.stringify(corpo)
        })

        if (!resposta.ok) {
            alert("Não foi possível alterar o aluno")
            return
        }

        alert("Aluno atualizado com sucesso!")
        location.reload()

    } catch {
        alert("Não foi possível alterar o aluno")
    } finally {
        loadingEnd(document.querySelector("button#confirmaKits"), document.querySelector("div#confirmaKitLoad"))
    }
}

export async function getApostilas() {

    loadingInit(document.querySelector("section.apostila"), document.querySelector("div#indexLoad"))

    try {
        const resposta = await chamarAPI("/api/apostilas")

        if (!resposta.ok) {
            alert("Não foi possível carregar o conteúdo")
            return null
        }

        return await resposta.json()

    } catch {
        alert("Erro de conexão")
        return null
    } finally {
        loadingEnd(document.querySelector("section.apostila"), document.querySelector("div#indexLoad"), "block")
    }
}

export async function getAtividades(apostilaId) {
    loadingInit(document.querySelector("section.atividadesContainer"), document.querySelector("div#apostilaLoad"))

    try {
        const resposta = await chamarAPI(`/api/apostilas/${parseInt(apostilaId)}/atividades`)

        if (!resposta.ok) {
            alert("Não foi possível carregar o conteúdo")
            return null
        }

        return await resposta.json()

    } catch {
        alert("Erro de conexão")
        return null
    } finally {
        loadingEnd(document.querySelector("section.atividadesContainer"), document.querySelector("div#apostilaLoad"), "block")
    }
}

export async function getQuestoes(atividadeId) {

    loadingInit(document.querySelector("section.questoes"), document.querySelector("div#questoesLoad"))

    try {
        const resposta = await chamarAPI(`/api/atividades/${atividadeId}/questoes`)

        if (!resposta.ok) {
            alert("Não foi possível carregar as questões")
            return null
        }

        return await resposta.json()

    } catch {
        alert("Erro de conexão")
        return null
    } finally {
        loadingEnd(document.querySelector("section.questoes"), document.querySelector("div#questoesLoad"), "block")
    }
}

export async function responderAtividade(atividadeId, respostas) {

    loadingInit(document.querySelector("button#enviar"), document.querySelector("div#enviarLoad"))

    try {
        const resposta = await chamarAPI(`/api/atividades/${atividadeId}/responder`, {
            method: "POST",
            body: JSON.stringify({ respostas })
        })

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}))
            alert(erro.erro || "Não foi possível salvar sua conclusão")
            return null
        }

        return await resposta.json()

    } catch {
        alert("Não foi possível salvar sua conclusão")
        return null
    } finally {
        loadingEnd(document.querySelector("button#enviar"), document.querySelector("div#enviarLoad"))
    }
}

export async function getProgresso(cpf) {
    try {
        const resposta = await chamarAPI(`/api/professor/progresso/${normalizarCPF(cpf)}`)

        if (!resposta.ok) {
            if (resposta.status === 404) {
                alert("CPF não encontrado")
            } else {
                alert("Não foi possível buscar o progresso do CPF")
            }
            return null
        }

        return await resposta.json()

    } catch {
        alert("Erro de conexão")
        return null
    }
}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.
