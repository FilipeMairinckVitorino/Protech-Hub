import { getMe, getAtividades } from "./API.js"

const apostila = localStorage.getItem("apostila")
const userViewer = document.querySelector("span#nome_view")
const sectionAtividades = document.querySelector("section.atividades")

document.querySelector("span.logo").addEventListener("click", () => {
    location.href = "index.html"
})

const usuario = await getMe()

if (!usuario) {
    location.href = "login.html"
} else if (apostila == null) {
    location.href = "index.html"
} else {

    userViewer.innerHTML = usuario.nome

    const conteudo = await getAtividades(apostila)

    if (conteudo) {
        
        conteudo.forEach(element => {

            if (element.concluida == true) {
                sectionAtividades.innerHTML += `
                    <div class="atividade">
                        <span class="atividade">${element.paginas}</span>
                        <a href="questoes.html?atividade_id=${element.id}" target="_blank" rel="external" class="atividade">Responder as questões
                            <span></span>
                        </a>
                        <span class="atividadeConcluida concluida" aria-label="Atividade concluída">Concluída ✓</span>
                    </div>
                `
            } else {
                sectionAtividades.innerHTML += `
                    <div class="atividade">
                        <span class="atividade">${element.paginas}</span>
                        <a href="questoes.html?atividade_id=${element.id}" target="_blank" rel="external" class="atividade">Responder as questões
                            <span></span>
                        </a>
                        <span class="atividadeConcluida" aria-label="Atividade não concluída">Não concluída</span>
                    </div>
                `
            }
        })
    }
}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.
