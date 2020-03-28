//funcao para criar elementos
function novoElemento (tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

//funcao que representa uma barreira
function Barreira(reversa=false) {
    this.elemento = novoElemento('div', 'barreira')
    
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)
    
    //funcao definindo altura da barreira
    this.setAltura = altura => corpo.style.height = `${altura}px`
}

//Criação dos pares de barreiras
function parDeBarreiras (altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')
    
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)
    
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)
    
    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
    
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth
    
    this.sortearAbertura()
    this.setX(x)
}

// 4 pares de barreiras
function Barreiras (altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new parDeBarreiras(altura, abertura, largura),
        new parDeBarreiras(altura, abertura, largura + espaco),
        new parDeBarreiras(altura, abertura, largura + espaco * 2),
        new parDeBarreiras(altura, abertura, largura + espaco * 3)
    ]
    //animacao dos pares de barreiras
    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX()-deslocamento)
            //quando a barreira sair da área do jogo
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                //sortear aberturas diferentes entre as colunas
                par.sortearAbertura()
            }
            const meio = largura / 2
            const meioFoiCruzado = par.getX() + deslocamento >= meio
            && par.getX() < meio
            if (meioFoiCruzado) notificarPonto()
        })
    }
}

function Dog(alturaJogo) {
    let voando = false
    this.elemento = novoElemento('img', 'dog')
    this.elemento.src = 'imgs/dog.png'
    
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`
    
    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false
    
    this.animar = () => {
        const novoY = this.getY() + (voando ? 4 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight
        
        if(novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }
    
    this.setY(alturaJogo / 2)
}

//função do progresso

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

//funcao checar sobreposicao
function sobreposicao(elemA, elemB) {
    const a = elemA.getBoundingClientRect()
    const b = elemB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

//funcao determinar clisao
function colisao (dog, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = sobreposicao(dog.elemento, superior)
                || sobreposicao(dog.elemento, inferior)
        }
    })
    return colidiu
}


//Instanciando os objetos

function FlappyPissDog() {
    let pontos = 0
    
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth
    
    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 243, 400, () => progresso.atualizarPontos(++pontos))
    const dog = new Dog(altura)
    
    areaDoJogo.appendChild(progresso.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
    areaDoJogo.appendChild(dog.elemento)
    
    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            dog.animar()

            if(colisao(dog, barreiras)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyPissDog().start()