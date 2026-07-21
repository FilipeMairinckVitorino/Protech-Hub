import { chaveAPI, concluirAtividade, getAtividades, getAtividades_concluidas, linkAPI_atividades, linkAPI_atividades_concluidas } from "./API.js"

const apostila = sessionStorage.getItem("apostila")
const userSalvo = sessionStorage.getItem("user")
const userViewer = document.querySelector("span#ctr_view")
const sectionAtividades = document.querySelector("section.atividades")

document.querySelector("span.logo").addEventListener("click", ()=>{
    location.href = "index.html"
})

if (apostila == null && userSalvo == null) {
    location.href = "login.html"
} else if (userSalvo != null && apostila == null){
    location.href = "index.html"
} else {

    const user = JSON.parse(userSalvo)

    userViewer.innerHTML = user.CTR

    let conteudo = await getAtividades(linkAPI_atividades, chaveAPI, apostila)

    let atividadesConcluidas = await getAtividades_concluidas(linkAPI_atividades_concluidas, chaveAPI, user.CTR, apostila) || []

    conteudo.forEach(element => {

        let conluida = atividadesConcluidas.find(item => item.atividade_id == element.id)?.concluida

        if (conluida == true) {
            sectionAtividades.innerHTML += `
                <div class="atividade">
                    <span class="atividade">${element.paginas}</span>
                    <a href="${element.link}" target="_blank" rel="external" class="atividade">Responder as questões
                        <span></span>
                    </a>
                    <input type="checkbox" id="atividade-${element.id}" name="atividadeConcluida" class="atividadeConcluida" checked>
                    <label for="atividade-${element.id}" class="atividadeConcluida"></label>
                </div>
            `
        } else {
            sectionAtividades.innerHTML += `
                <div class="atividade">
                    <span class="atividade">${element.paginas}</span>
                    <a href="${element.link}" target="_blank" rel="external" class="atividade">Responder as questões
                        <span></span>
                    </a>
                    <input type="checkbox" id="atividade-${element.id}" name="atividadeConcluida" class="atividadeConcluida">
                    <label for="atividade-${element.id}" class="atividadeConcluida"></label>
                </div>
            `
        }
    })

    document.querySelectorAll("input.atividadeConcluida").forEach(element => {
        element.addEventListener("change", async ()=>{

            await concluirAtividade(linkAPI_atividades_concluidas, chaveAPI, user.CTR, element.id.replace("atividade-",""), apostila, element.checked)
        })
    })
}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.