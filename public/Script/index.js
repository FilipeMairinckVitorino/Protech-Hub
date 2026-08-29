import { getMe, getApostilas } from "./API.js"

const userViewer = document.querySelector("span#nome_view")
const sectionApostilas = document.querySelector("section.apostila")

const usuario = await getMe()

if (!usuario) {
    window.location.href = "login.html"
} else if (usuario.userLv == "admin") {
    window.location.href = "cadastro.html"
} else if (usuario.userLv == "professor") {
    window.location.href = "progresso.html"
} else {

    userViewer.innerHTML = usuario.nome

    const conteudo = await getApostilas()

    if (conteudo) {
        conteudo.forEach(element => {
            sectionApostilas.innerHTML += `
                <div class="apostila" data-id="${element.id}">
                    <img src="Image/Apostilas/${element.id}.png" alt="apostila" class="apostila">
                    <a href="apostila.html" class="apostila">${element.id} - ${element.nome}</a>
                </div>
            `
        })
    }

    if (usuario.kit1 == false && usuario.kit2 == false) {
        sectionApostilas.style.display = 'none'
        document.querySelector("span#semApostilas").style.display = 'block'
    }

    const divsApostilas = document.querySelectorAll("div.apostila")

    divsApostilas.forEach((element) => {
        element.querySelector("a.apostila").addEventListener("click", (event) => {
            event.preventDefault()

            localStorage.setItem("apostila", element.dataset.id)

            location.href = "apostila.html"
        })
    })

    document.querySelectorAll("img.apostila").forEach(element => {
        element.addEventListener("click", () => {
            element.nextElementSibling.click()
        })
    })

}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.