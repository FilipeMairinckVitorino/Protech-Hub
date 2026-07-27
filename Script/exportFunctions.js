export function loadingInit(botaoSumir, load) {
    botaoSumir.style.display = 'none'
    load.style.display = 'block'
}

export function loadingEnd(botaoAparecer, load, display = null) {
    if (display == null){
        load.style.display = 'none'
        botaoAparecer.style.display = 'initial'
    } else {
        load.style.display = 'none'
        botaoAparecer.style.display = display
    }
}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.