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

export function nomeViewHTML(nome) {
    const nomeSeguro = String(nome ?? "").trim()
    const inicial = nomeSeguro.charAt(0).toUpperCase()
    return `<span class="nomeCompleto">${nomeSeguro}</span><span class="nomeInicial">${inicial}</span>`
}

// © 2026 Filipe Mairinck Vitorino. Todos os direitos reservados.
