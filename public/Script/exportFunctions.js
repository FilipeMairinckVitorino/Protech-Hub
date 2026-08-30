export function loadingInit(botaoSumir, load) {
    botaoSumir.style.display = 'none'
    load.style.display = 'block'
}

export function loadingEnd(botaoAparecer, load, display = null) {
    if (display == null){
        load.style.display = 'none'
        botaoAparecer.style.display = ''
    } else {
        load.style.display = 'none'
        botaoAparecer.style.display = display
    }
}

export function normalizarCPF(valor) {
    return String(valor ?? "").replace(/\D/g, "")
}

export function primeiroNome(valor) {
    return String(valor ?? "").trim().split(/\s+/)[0] || ""
}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.
