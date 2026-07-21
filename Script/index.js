import { chaveAPI, getApostilas, linkAPI_apostilas } from "./API.js"

const userViewer = document.querySelector("span#ctr_view")
const sectionApostilas = document.querySelector("section.apostila")
const userSalvo = sessionStorage.getItem("user")

if (userSalvo == null){
    window.location.href = "login.html"
} else {
    const user = JSON.parse(userSalvo)

    userViewer.innerHTML = user.CTR

    if (user.Kit1 == true) {
        let conteudo = await getApostilas(linkAPI_apostilas, chaveAPI, 1)

        conteudo.forEach(element => {
            sectionApostilas.innerHTML += `
                <div class="apostila">
                    <img src="Image/apostila_example.png" alt="apostila" class="apostila">
                    <a href="#" class="apostila">${element.id} - ${element.nome}</a>
                </div>
            ` 
        })
    }

    if (user.Kit2 == true) {
        let conteudo = await getApostilas(linkAPI_apostilas, chaveAPI, 2)

        conteudo.forEach(element => {
            sectionApostilas.innerHTML += `
                <div class="apostila">
                    <img src="Image/apostila_example.png" alt="apostila" class="apostila">
                    <a href="#" class="apostila">${element.id} - ${element.nome}</a>
                </div>
            ` 
        })
    }

    if (user.Kit1 == false && user.Kit2 == false) {
        sectionApostilas.style.display = 'none'
        document.querySelector("span#semApostilas").style.display = 'block'
    }

    const divsApostilas = document.querySelectorAll("div.apostila")

    divsApostilas.forEach((element)=>{
        element.querySelector("a.apostila").addEventListener("click", (event)=>{
            event.preventDefault()

            let numApostila = element.querySelector("a.apostila").innerHTML.slice(0,2)

            sessionStorage.setItem("apostila", numApostila)

            location.href = "apostila.html"
        })
    })

}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.