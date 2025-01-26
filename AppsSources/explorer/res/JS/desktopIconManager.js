var dragElem
var visibleElem

var MouseStartX
var MouseStartY
var ElemStartX
var ElemStartY

var ElemsContainer = document.getElementById('desktopIcons')

var nowDragActive = false

var ScreenWidth
var ScreenHeight

function SetSize() {
    ScreenWidth = Math.floor(window.innerWidth / 88) * 88
    ScreenHeight = Math.floor(window.innerHeight / 98) * 98
}

window.addEventListener('resize', SetSize)
SetSize()

var ElemMouseMove = (event) => {
    if (event.pageX == MouseStartX && event.pageY == MouseStartY) return
    dragElem.style.display = 'block'
    $(dragElem).css('left', event.pageX - ElemStartX + 'px')
    $(dragElem).css('top', event.pageY - ElemStartY + 'px')
}

document.addEventListener('mousedown', (event) => {
    if (!$(event.target).hasClass('visible')) return

    dragElem = event.target.parentElement.children[1]
    visibleElem = event.target

    ElemStartX = event.offsetX
    ElemStartY = event.offsetY
    MouseStartX = event.pageX
    MouseStartY = event.pageY

    nowDragActive = true

    document.addEventListener('mousemove', ElemMouseMove)
})

document.addEventListener('mouseup', event => {
    if (nowDragActive) {
        document.removeEventListener('mousemove', ElemMouseMove)

        let NewPosX = Math.floor(event.pageX / 88) * 88
        let NewPosY = Math.floor(event.pageY / 98) * 98

        if (NewPosX < 0) {
            NewPosX = '0'
        }
        if (NewPosY < 0) {
            NewPosY = '0'
        }

        dragElem.style.display = 'none'
        nowDragActive = false

        SetElemPos(dragElem, visibleElem, NewPosX, NewPosY)

        WriteNewDIC()
    }
})

function SetElemPos(elem1, elem2, x, y) {
    let ElemsList = []
    for (let i = 0; i < ElemsContainer.children.length; i++) {
        ElemsList.push({
            elem: ElemsContainer.children[i],
            x: $(ElemsContainer.children[i].children[0]).offset().left,
            y: $(ElemsContainer.children[i].children[0]).offset().top,
        })
    }
    for (let i = false; i == false;) {
        let cant = false
        for (let q = 0; q < ElemsList.length; q++) {
            if (ElemsList[q].x == x && ElemsList[q].y == y && ElemsList[q].elem.children[0] != elem1 && ElemsList[q].elem.children[0] != elem2) {
                cant = true
            }
        }
        if (cant) {
            if (ScreenHeight < y + 98) {
                x = x + 88
                y = 0
            } else {
                y = y + 98
            }
        } else {
            i = true
            $(elem1).css('left', x + 'px')
            $(elem1).css('top', y + 'px')
            $(elem2).css('left', x + 'px')
            $(elem2).css('top', y + 'px')
        }
    }
}