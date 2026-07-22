import { CONFIG } from "./config.js"
import { loadingInit } from "./exportFunctions.js"
import { loadingEnd } from "./exportFunctions.js"

export const linkAPI_users = CONFIG.users
export const linkAPI_apostilas = CONFIG.apostilas
export const linkAPI_atividades = CONFIG.atividades
export const linkAPI_atividades_concluidas = CONFIG.atividadesConcluidas
export const chaveAPI = CONFIG.chaveAPI


export async function postAluno(linkAPI, chaveAPI, ctr, senha) {

    loadingInit(document.querySelector("button#cadastrar"), document.querySelector("div#cadastroLoad"))

    try {
        const resposta = await fetch(linkAPI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: chaveAPI,
                Authorization: `Bearer ${chaveAPI}`
            },
            body: JSON.stringify({
                CTR: ctr,
                Senha: senha,
                Kit1: false,
                Kit2: false
            })
        })

        if (!resposta.ok) {
            const erro = await resposta.json()

            if (erro.code === "23505") {
                alert("Aluno já cadastrado")
            } else {
                alert("Não foi possível cadastrar o aluno")
            }

            return
        }

        alert("Aluno cadastrado com sucesso!")

    } catch {
        alert("Não foi possível cadastrar o aluno")
    } finally {
        loadingEnd(document.querySelector("button#cadastrar"), document.querySelector("div#cadastroLoad"))
    }
}

export async function getAluno(linkAPI, chaveAPI, ctr) {

    loadingInit(document.querySelector("button#buscaCTR"), document.querySelector("div#buscaLoad"))

    try {
        const resposta = await fetch(`${linkAPI}?CTR=eq.${ctr}`, {
            headers: {
                apikey: chaveAPI,
                Authorization: `Bearer ${chaveAPI}`
            }
        })

        if (!resposta.ok) {
            alert("Não foi possível buscar o CTR")
            return null
        }

        const aluno = await resposta.json()

        return aluno;

    } catch {
        alert("Não foi possível buscar o CTR")
        return null
    } finally {
        loadingEnd(document.querySelector("button#buscaCTR"), document.querySelector("div#buscaLoad"))
    }
}

export async function editaCTR(linkAPI, chaveAPI, ctr, kit1Info, kit2Info) {

    loadingInit(document.querySelector("button#confirmaKits"), document.querySelector("div#confirmaKitLoad"))

    try {
        const resposta = await fetch(
            `${linkAPI}?CTR=eq.${ctr}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: chaveAPI,
                    Authorization: `Bearer ${chaveAPI}`
                },
                body: JSON.stringify({
                    Kit1: kit1Info,
                    Kit2: kit2Info
                })
            }
        )

        if (!resposta.ok) {
            alert("Não foi possível alterar os kits")
            return
        }

        alert("Kits alterados com sucesso!")
        location.reload()

    } catch {
        alert("Não foi possível alterar os kits")
    } finally {
        loadingEnd(document.querySelector("button#confirmaKits"), document.querySelector("div#confirmaKitLoad"))
    }
}


export async function login(linkAPI, chaveAPI, ctr) {

    loadingInit(document.querySelector("button#entrar"), document.querySelector("div#loginLoad"))

    try {
        const resposta = await fetch(`${linkAPI}?CTR=eq.${ctr}`, {
            headers: {
                apikey: chaveAPI,
                Authorization: `Bearer ${chaveAPI}`
            }
        })

        if (!resposta.ok) {
            alert("Não foi possível buscar o CTR")
            return null
        }

        const aluno = await resposta.json()

        return aluno;

    } catch {
        alert("Não foi possível buscar o CTR")
        return null
    } finally {
        loadingEnd(document.querySelector("button#entrar"), document.querySelector("div#loginLoad"))
    }
}


export async function getApostilas(linkAPI, chaveAPI, kit) {
    
    loadingInit(document.querySelector("section.apostila"), document.querySelector("div#indexLoad"))

    while(true) {
        try {
            const resposta = await fetch(`${linkAPI}?kit=eq.${kit}`, {
                headers: {
                    apikey: chaveAPI,
                    Authorization: `Bearer ${chaveAPI}`
                }
            })

            if(resposta.ok) {
                return resposta.json()
            }

            let tentarNovamente = confirm("Não foi possível carregar o conteúdo.\n\nDeseja tentar novamente?")

            if (tentarNovamente == false) {
                window.location.href = "login.html"
                return null
            }

        } catch {

            let tentarNovamente = confirm(
                "Erro de conexão.\n\nDeseja tentar novamente?"
            )

            if (tentarNovamente == false) {
                window.location.href = "login.html"
                return null
            }

        } finally {
            loadingEnd(document.querySelector("section.apostila"), document.querySelector("div#indexLoad"), "block")
        }
    }
}


export async function getAtividades(linkAPI, chaveAPI, apostila) {
    loadingInit(document.querySelector("section.atividadesContainer"), document.querySelector("div#apostilaLoad"))

    while(true) {
        try {
            const resposta = await fetch(`${linkAPI}?apostila=eq.${parseInt(apostila)}`, {
                headers: {
                    apikey: chaveAPI,
                    Authorization: `Bearer ${chaveAPI}`
                }
            })

            if (resposta.ok) {
                return resposta.json()
            }

            let tentarNovamente = confirm("Não foi possível carregar o conteúdo.\n\nDeseja tentar novamente?")

            if (tentarNovamente == false) {
                window.location.href = "index.html"
                return null
            }


        } catch {

            let tentarNovamente = confirm(
                "Erro de conexão.\n\nDeseja tentar novamente?"
            )

            if (tentarNovamente == false) {
                window.location.href = "index.html"
                return null
            }

        } finally {
            loadingEnd(document.querySelector("section.atividadesContainer"), document.querySelector("div#apostilaLoad"), "block")
        }
    }
}

export async function getAtividades_concluidas(linkAPI, chaveAPI, ctr, apostila) {

    try {

        const resposta = await fetch(`${linkAPI}?ctr=eq.${ctr}&apostila=eq.${parseInt(apostila)}`, {
            headers: {
                apikey: chaveAPI,
                Authorization: `Bearer ${chaveAPI}`
            }
        })

        if (resposta.ok) {
            return resposta.json()
        }

    } catch {
        return null
    }
}

export async function concluirAtividade(linkAPI, chaveAPI, ctr, atividade_id, apostila, concluida) {

    try {

        const busca = await fetch(`${linkAPI}?ctr=eq.${ctr}&atividade_id=eq.${parseInt(atividade_id)}`, {
            headers: {
                apikey: chaveAPI,
                Authorization: `Bearer ${chaveAPI}`
            }
        })

        const dados = await busca.json()

        console.log("Resultado da busca:", dados)

        if (dados.length > 0) {

            const id = dados[0].id

            const resposta = await fetch(`${linkAPI}?id=eq.${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    apikey: chaveAPI,
                    Authorization: `Bearer ${chaveAPI}`,
                    Prefer: "return=representation"
                },
                body: JSON.stringify({
                    concluida: concluida
                })
            })
            return await resposta.json()

        } else {

            const resposta = await fetch(linkAPI, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: chaveAPI,
                    Authorization: `Bearer ${chaveAPI}`,
                    Prefer: "return=representation"
                },
                body: JSON.stringify({
                    ctr: ctr,
                    atividade_id: parseInt(atividade_id),
                    concluida: concluida,
                    apostila: parseInt(apostila)
                })
            })

            return await resposta.json()
        }

    } catch (erro){

        console.log(erro)
    }
}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.