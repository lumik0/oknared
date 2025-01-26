$('*').each(async (index, elem) => {
    if (elem.className.startsWith('Str_')) {
        let string = elem.className.split(' ')[0].split('_')[1]
        $(elem).html((await getResFromFile(dllPath, 'String/' + string)).replaceAll('&', '').replaceAll('\n', '<br/>'))
    } else if (String($(elem).attr('placeholder')).startsWith('Str_')) {
        let string = $(elem).attr('placeholder').split('_')[1]
        $(elem).attr('placeholder', (await getResFromFile(dllPath, 'String/' + string)).replaceAll('&', ''))
    }
})

let dialogmode = {}

let pathsHistory = []
let posInHistory = -1

function displayRibbon(ribbonId) {
    $('.ribbon > .select > .elem').removeClass('active')
    $('.ribbon > .select > .elem#ribbon_select_' + ribbonId).addClass('active')
    $('.ribbon > .content > section').removeClass('active')
    $('.ribbon > .content > section#ribbon_content_' + ribbonId).addClass('active')
}

document.addEventListener('click', (e) => {
    if (e.srcElement.id.startsWith('ribbon_select_')) {
        let ribbonId = e.srcElement.id.replace('ribbon_select_', '')
        if (ribbonId == 'file') return
        console.log('User selected "' + ribbonId + '" ribbon')
        displayRibbon(ribbonId)
    }
})

displayRibbon('main')

var currentPath = ''
var currentFileManagerPath = ''

//**********************************************************************************
/*
    Params example:
    {
        x: 631,                                             //  X относительно фрейма окна
        y: 267,                                             //  Y относительно фрейма окна
        pageX: 2677,                                        //  X относительно страницы
        pageY: 2023,                                        //  Y относительно страницы

        //                                                  Следует использовать ЛИБО X и Y, либо pageX или pageY

        content: [
            {
                type: "item",                               //  Тип "item" используется для обозначения обычного пункта меню
                text: "Название пункта",                    //  Обычная строка для имени пункта
                icon: "data:image/png;base64, ...",         //  Изображение, закодированное в data URI, используется для иноки. Рекомендуется 16х16. Опционально.
                result: "okna"                              //  Строка или число, которое будет возвращено в код
            },
            {
                type: "separator"                           //  Тип "separator" используется для обозначения разделителя (серой полоски)
            },
            {
                type: "itemcontainer",                      //  Тип "itemcontainer" используется для обозначения контейнера пунктов меню
                text: "Название пункта",                    //  Обычная строка для имени пункта
                icon: "data:image/png;base64, ...",         //  Изображение, закодированное в data URI, используется для иноки. Рекомендуется 16х16. Опционально.
                content: [
                    ...                                     //  Содержимое контейнера. Имеет такой же формат, как и "content" у параметров вызова меню.
                ]
            }
        ]
    }
*/
//**********************************************************************************

function setFolderView(type) {
    $('.explorerContent .twopanels .right').removeClass('view_tile')
    $('.explorerContent .twopanels .right').removeClass('view_table')

    if (type == 'tile') {
        $('.explorerContent .twopanels .right').addClass('view_tile')
    } else if (type == 'table') {
        $('.explorerContent .twopanels .right').addClass('view_table')
    }
}

function setCurrentPathIcon(icon) {
    $('.pathicon').attr('src', 'data:image/png;base64,' + getIcon(icon, '16x16'))
    setWindowIcon(icon)
}

async function setPathElems(elems) {
    $('.path .pathContent > div').html('')
    for await (let elem of elems) {
        if (elem.type == 'desktopContentMin') {
            $('.path .pathContent > div').append(`
                <div class="container">
                    <div class="contentButton"></div>
                </div>
            `)
        } else if (elem.type == 'computerContent') {
            $('.path .pathContent > div').append(`
                <div style="--path: 'computer'" class="container">
                    <p>${elem.text}</p>
                    <div class="contentButton"></div>
                </div>
            `)
        } else if (elem.type == 'directoryContent') {
            $('.path .pathContent > div').append(`
                <div style="--path: 'folder:${elem.path}'" class="container">
                    <p>${elem.text}</p>
                    <div class="contentButton"></div>
                </div>
            `)
        }
    }

    for (let i = 1; $('.path .pathContent > div')[0].offsetWidth > $('.path .pathContent')[0].offsetWidth; i++) {
        $('.path .pathContent > div > div:nth-child(' + i + ')').css('display', 'none')
    }
}

var currentPathElems = []

function checkNavButtonsAvaibility() {
    if (!pathsHistory[posInHistory - 1]) {
        $('.navbtn_back').addClass('disabled')
    } else {
        $('.navbtn_back').removeClass('disabled')
    }
    if (!pathsHistory[posInHistory + 1]) {
        $('.navbtn_next').addClass('disabled')
    } else {
        $('.navbtn_next').removeClass('disabled')
    }
}

function pathhistoryBack() {
    if (pathsHistory[posInHistory - 1]) {
        posInHistory = posInHistory - 1
        displayRightPage(pathsHistory[posInHistory], true)
        checkNavButtonsAvaibility()
    }
}

function pathhistoryNext() {
    if (pathsHistory[posInHistory + 1]) {
        posInHistory = posInHistory + 1
        displayRightPage(pathsHistory[posInHistory], true)
        checkNavButtonsAvaibility()
    }
}

async function displayRightPage(path, doNotAddToHistory) {
    console.log('FileManager: Trying to display path "' + path + '"')

    let oldpath = path
    path = await parsePath(path)
    if(path.startsWith('/') || path.startsWith('root/')) {
        path = 'folder:' + path
    }

    function updateHistory() {
        if(posInHistory != pathsHistory.length - 1) {
            pathsHistory.splice(posInHistory + 1, pathsHistory.length - 1 - posInHistory)
        }
        pathsHistory.push(oldpath)
        posInHistory = pathsHistory.length - 1
        checkNavButtonsAvaibility()
    }

    if (path == 'computer') {
        if (!doNotAddToHistory) updateHistory()
        $('.explorerContent .twopanels .right').html('<div class="fileview"></div>')
        setFolderView('tile')
        setCurrentPathIcon(await getResFromFile('/Windows/system32/imageres.el', 'Icon/109'))
        setPathElems([
            {
                type: 'desktopContentMin',
            },
            {
                type: 'computerContent',
                text: await getResFromFile('/Windows/system32/shell32.el', 'String/9216'),
            },
        ])
        let iconFolder = `data:text/plain;base64,${await getIcon(await getResFromFile('/Windows/system32/imageres.el', 'Icon/3'), '48x48')}`
        $('.explorerContent .twopanels .right .fileview').append(`
            <div class="group named">
                <p class="header">${await getResFromFile('/Windows/system32/shell32.el', 'String/9338')} (6)</p>
                <div class="groupcontent">
                    <div class="rightPanelElem" style="--path: 'folder:%userprofile%/Desktop'"><img src="${iconFolder}"><p>Desktop</p></div>
                    <div class="rightPanelElem" style="--path: 'folder:%userprofile%/Documents'"><img src="${iconFolder}"><p>Documents</p></div>
                    <div class="rightPanelElem" style="--path: 'folder:%userprofile%/Downloads'"><img src="${iconFolder}"><p>Downloads</p></div>
                    <div class="rightPanelElem" style="--path: 'folder:%userprofile%/Pictures'"><img src="${iconFolder}"><p>Pictures</p></div>
                    <div class="rightPanelElem" style="--path: 'folder:%userprofile%/Videos'"><img src="${iconFolder}"><p>Video</p></div>
                    <div class="rightPanelElem" style="--path: 'folder:%userprofile%/Music'"><img src="${iconFolder}"><p>Music</p></div>
                </div>
            </div>
            <div class="group named">
                <p class="header">${await getResFromFile('/Windows/system32/shell32.el', 'String/9339')} (1)</p>
                <div class="groupcontent">
                    <div class="rightPanelElem" style="--path: 'folder:/'"><img src="${iconFolder}"><p>Root directory</p></div>
                </div>
            </div>
        `)
    } else if (path.startsWith('folder:')) {
        path = path.replace('folder:', '')
        if (path.startsWith('root/')) path = path.replace('root/', '/')
        if (path.endsWith('/')) path = path.slice(0, path.length - 1)
        let dirContent
        let error
        try {
            dirContent = await fs.readDirectory('root' + path)
        } catch (err) {
            error = err
        }
        if (error) {
            console.log(error)
            return
        } else {
            if (!doNotAddToHistory) updateHistory()
            $('.explorerContent .twopanels .right').html('')
            setFolderView('table')
            setCurrentPathIcon(await getResFromFile('/Windows/system32/imageres.el', 'Icon/3'))
            let patharr = path.split('/')
            let pathElems = [
                {
                    type: 'desktopContentMin',
                },
                {
                    type: 'computerContent',
                    text: await getResFromFile('/Windows/system32/shell32.el', 'String/9216'),
                },
            ]
            let path2 = ''
            for (let i = 0; i < patharr.length; i++) {
                if (patharr[i] == '') {
                    pathElems.push({
                        type: 'directoryContent',
                        text: 'Root directory',
                        path: '/',
                    })
                } else {
                    path2 += '/' + patharr[i]
                    pathElems.push({
                        type: 'directoryContent',
                        text: patharr[i],
                        path: path2,
                    })
                }
            }
            currentPathElems = pathElems
            setPathElems(pathElems)
            $('.explorerContent .twopanels .right').html(`
                <div class="tableheader">
                    <table>
                        <tr>
                            <td style="--width: 250px">${await getResFromFile('/Windows/system32/shell32.el', 'String/8976')}</td>
                            <td style="--width: 110px">${await getResFromFile('/Windows/system32/shell32.el', 'String/37545')}</td>
                            <td style="--width: 110px">${await getResFromFile('/Windows/system32/shell32.el', 'String/37547')}</td>
                            <td style="--width: 70px">${await getResFromFile('/Windows/system32/shell32.el', 'String/37549')}</td>
                        </tr>
                    </table>
                </div>
                <div class="fileview"></div>
            `)
            currentPath = 'folder:' + path
            currentFileManagerPath = path
            $('.explorerContent .twopanels .right .fileview').append(`
                <div class="group" style="display: none">
                    <div class="groupcontent">
                        <table></table>
                    </div>
                </div>
            `)

            let currentPathDesktopIni = {}
            if (await fs.exists(currentFileManagerPath + '/desktop.ini')) {
                currentPathDesktopIni = parseIni(await fs.readFile(currentFileManagerPath + '/desktop.ini'))
            }
            if (currentPathDesktopIni['LocalizedFileNames'] == null) currentPathDesktopIni['LocalizedFileNames'] = {}

            for await (let elem of dirContent.directories) {
                let modifyDate = new Date(elem.createdAt)
                let modifyDateString = `${modifyDate.getDate()}.${String(modifyDate.getMonth() + 1).padStart(2, '0')}.${modifyDate.getFullYear()} ${modifyDate.getHours()}:${String(modifyDate.getMinutes()).padStart(2, '0')}`
                let icon = 'data:text/plain;base64,' + (await getIcon(await getResFromFile('/Windows/system32/imageres.el', 'Icon/3'), '16x16'))
                let elemName = elem.name
                try {
                    if (await fs.exists(elem.fullPath + '/desktop.ini')) {
                        let desktopIni = parseIni(await fs.readFile(elem.fullPath + '/desktop.ini'))
                        if (desktopIni['.ShellClassInfo'] && desktopIni['.ShellClassInfo']['LocalizedResourceName']) {
                            let nameres = desktopIni['.ShellClassInfo']['LocalizedResourceName']
                            if (nameres.startsWith('@')) {
                                nameres = nameres.replace('@', '')
                                nameres = nameres.split(',')
                                let newname = await getResFromFile(await parsePath(nameres[0]), 'String/' + nameres[1].replace('-', ''))
                                console.log('FileManager: Directory "' + elem.name + '" displayed as "' + newname + '"')
                                elemName = newname
                            }
                        }
                    }
                } catch (e) {
                    console.log('FileManager: Error with desktop.ini file loading for directory "' + elem.fullPath + '".\n' + e)
                }
                $('.explorerContent .twopanels .right .fileview .group .groupcontent table').append(`
                    <tr class="rightPanelElem" style="--path: 'folder:${elem.fullPath}'">
                        <td style="--width: 250px"><img src="${icon}" class="fileicon">${elemName}</td>
                        <td style="--width: 110px">${modifyDateString}</td>
                        <td style="--width: 110px">${await getResFromFile('/Windows/system32/shell32.el', 'String/10152')}</td>
                        <td style="--width: 70px"></td>
                    </tr>
                `)
            }
            for await (let elem of dirContent.files) {
                if (elem.name != 'desktop.ini') {
                    let modifyDate = new Date(elem.createdAt)
                    let modifyDateString = `${modifyDate.getDate()}.${String(modifyDate.getMonth() + 1).padStart(2, '0')}.${modifyDate.getFullYear()} ${modifyDate.getHours()}:${String(modifyDate.getMinutes()).padStart(2, '0')}`
                    let fileext = 'File'
                    let filenamearray = elem.name.split('.')
                    let icon = 'data:text/plain;base64,' + (await getIcon(await getResFromFile('/Windows/system32/imageres.el', 'Icon/2'), '16x16'))
                    let elemName = elem.name
                    try {
                        if (currentPathDesktopIni['LocalizedFileNames'][elemName]) {
                            newname = currentPathDesktopIni['LocalizedFileNames'][elemName]
                            if (newname.startsWith('@')) {
                                newname = newname.replace('@', '')
                                newname = newname.split(',')
                                newname = await getResFromFile(await parsePath(newname[0]), 'String/' + newname[1].replace('-', ''))
                                console.log('FileManager: File "' + elem.name + '" displayed as "' + newname + '"')
                                elemName = newname
                            }
                        }
                    } catch (e) {
                        console.log('FileManager: Error with localized name loading for file "' + elem.fullPath + '".\n' + e)
                    }
                    fileext = filenamearray[filenamearray.length - 1]
                    $('.explorerContent .twopanels .right .fileview .group .groupcontent table').append(`
                        <tr class="rightPanelElem" style="--path: 'file:${elem.fullPath}'">
                            <td style="width: 250px"><img src="${icon}" class="fileicon">${elemName}</td>
                            <td style="width: 110px">${modifyDateString}</td>
                            <td style="width: 110px">${(await getResFromFile('/Windows/system32/shell32.el', 'String/10112')).replace('%s', fileext)}</td>
                            <td style="width: 70px">N/A</td>
                        </tr>
                    `)
                }
            }
            $('.explorerContent .twopanels .right .fileview .group').css('display', 'block')
        }
    } else if (path.startsWith('file:')) {
        if (dialogmode.dialogtype && dialogmode.dialogtype == 'fileopen') {
            window.parent.postMessage({
                message: 'eval',
                eval: `
                    try {
                        $('#WindowFrame_${dialogmode.wid}')[0].contentWindow.postMessage({
                            message: 'dialogresult',
                            canceled: false,
                            filepath: '${path.replace('file:', '')}'
                        })
                    }
                    catch (e) {}
                `,
            })
            close()
        } else {
            cmdexec('"' + path.replace('file:', '') + '"')
        }
    }
}

document.addEventListener('click', (e) => {
    let elem = e.srcElement
    if (e.srcElement.parentElement.className.startsWith('rightPanelElem')) elem = e.srcElement.parentElement

    if (elem.className == 'rightPanelElem' && e.ctrlKey) {
        $(elem).addClass('focus')
    } else if (elem.className == 'rightPanelElem') {
        $('.rightPanelElem').removeClass('focus')
        $(elem).addClass('focus')
    } else if (elem.className == 'rightPanelElem focus' && e.ctrlKey) {
        $(elem).removeClass('focus')
    } else if (elem.className == 'rightPanelElem focus') {
        $('.rightPanelElem').removeClass('focus')
        $(elem).addClass('focus')
    } else {
        $('.rightPanelElem').removeClass('focus')
    }
    if (elem.className == 'container' && elem.parentElement.parentElement.className == 'pathContent') {
        let path = $(elem).css('--path').replaceAll("'", '')
        console.log('FileManager: User clicked on "' + path + '" path in pathContainer')
        displayRightPage(path)
    }
})

document.addEventListener('dblclick', (e) => {
    let elem = e.srcElement
    if (e.srcElement.parentElement.className.startsWith('rightPanelElem')) elem = e.srcElement.parentElement
    if (elem.className == 'rightPanelElem' || elem.className == 'rightPanelElem focus') {
        let path = $(elem).css('--path').replaceAll("'", '')
        console.log('FileManager: User dblclicked on "' + path + '"')
        displayRightPage(path)
    }
})

document.addEventListener('contextmenu', async (e) => {
    e.preventDefault()

    let elem = e.srcElement
    if (e.srcElement.parentElement.className.startsWith('rightPanelElem')) elem = e.srcElement.parentElement
    if (elem.className == 'rightPanelElem' || elem.className == 'rightPanelElem focus') {
        let elemPath = eval($(elem).css('--path'))
        if (elemPath.startsWith('folder:')) {
            let result = await contextMenu({
                x: e.x,
                y: e.y,
                content: [
                    {
                        type: 'item',
                        text: await getResFromFile('/Windows/system32/shell32.el', 'String/8496'),
                        result: 'open',
                    },
                    {
                        type: 'item',
                        text: await getResFromFile('/Windows/system32/shell32.el', 'String/8517'),
                        result: 'openInNewWindow',
                    },
                    {
                        type: 'separator',
                    },
                    {
                        type: 'item',
                        text: await getResFromFile('/Windows/system32/shell32.el', 'String/51201'),
                        result: 'pinOnStartScreen',
                    },
                    {
                        type: 'separator',
                    },
                    {
                        type: 'item',
                        text: await getResFromFile('/Windows/system32/shell32.el', 'String/33560'),
                        result: 'cut',
                    },
                    {
                        type: 'item',
                        text: await getResFromFile('/Windows/system32/shell32.el', 'String/33561'),
                        result: 'copy',
                    },
                    {
                        type: 'separator',
                    },
                    {
                        type: 'item',
                        text: await getResFromFile('/Windows/system32/shell32.el', 'String/29699'),
                        result: 'createShortcut',
                    },
                    {
                        type: 'item',
                        text: await getResFromFile('/Windows/system32/shell32.el', 'String/33553'),
                        result: 'delete',
                    },
                    {
                        type: 'item',
                        text: await getResFromFile('/Windows/system32/shell32.el', 'String/31242'),
                        result: 'rename',
                    },
                    {
                        type: 'separator',
                    },
                    {
                        type: 'item',
                        text: await getResFromFile('/Windows/system32/shell32.el', 'String/16534'),
                        result: 'properties',
                    },
                ],
            })
            if (!result.canceled) {
                console.log('Explorer: Got "' + result.result + '" result from ContextMenu')
                if (result.result == 'open') {
                    displayRightPage(elemPath)
                } else if (result.result == 'openInNewWindow') {
                    cmdexec('/Windows/explorer.ore "' + elemPath + '"')
                }
            }
        }
    }
})

window.addEventListener('resize', (e) => {
    setPathElems(currentPathElems)
})

async function prepareDialog(dialogtype) {
    $('body').addClass('filedialog')
    $('body').addClass('filedialogOpenFile')
    if (dialogtype == 'openfile') {
        $('#dialogFile_filetype').html('')
        for (let i = 0; i < args[1].length; i++) {
            let elemtext
            if (args[1][i].displayName) elemtext = args[1][i].displayName
            else elemtext = `${args[1][i].name} (${args[1][i].fileext})`
            $('#dialogFile_filetype').append(`<option value="${i}">${elemtext}</option>`)
        }
        $('#dialog_selectButton').html(await getResFromFile('/Windows/system32/twinui.el', 'String/1030'))
        $('#dialog_cancelButton').html(await getResFromFile('/Windows/system32/twinui.el', 'String/1035'))
        dialogmode = {
            wid: args[3],
            dialogtype: 'fileopen',
        }
        window.parent.postMessage({
            message: 'eval',
            eval: `
                dwm.windows['${wid}'].onclose = \`
                    try {
                        $('#WindowFrame_${dialogmode.wid}')[0].contentWindow.postMessage({
                            message: 'dialogresult',
                            canceled: true
                        })
                    }
                    catch (e) {}
                \`
            `,
        })
    }
}

async function init() {
    $('.navbtn_back').css('background-image', `url(data:image/png;base64,${await getResFromFile('/Windows/Resources/Themes/aero/aero.el', 'IMAGE/1261')})`)
    $('.navbtn_next').css('background-image', `url(data:image/png;base64,${await getResFromFile('/Windows/Resources/Themes/aero/aero.el', 'IMAGE/1266')})`)

    if (args[0]) {
        if (args[0] == 'openFileDialog') {
            prepareDialog('openfile')
            displayRightPage('folder:' + args[2])
        } else {
            displayRightPage(args[0])
        }
    } else {
        displayRightPage('computer')
    }
}

init()

//******************************  LEFT PANEL  **************************************

async function initLeftpanel() {
    $('body').append(`
        <style>
            .twopanels .left .elem > .expand {
                background-image: url('data:image/png;base64,${await getResFromFile('/Windows/Resources/Themes/aero/aero.el', 'IMAGE/1003')}')
            }
            .twopanels .left .elem > .expand:hover {
                background-image: url('data:image/png;base64,${await getResFromFile('/Windows/Resources/Themes/aero/aero.el', 'IMAGE/1008')}')
            }
        </style>
    `)

    document.addEventListener('click', async (e) => {
        if (e.target.className == 'expand') {
            if (e.target.parentElement.className == 'elem expanded') {
                $(e.target.parentElement).removeClass('expanded')
            } else {
                expand(e)
            }
        } else if (e.target.className == 'name') {
            displayRightPage($(e.target.parentElement).css('--path').replaceAll("'", ''))
        }
    })

    document.addEventListener('dblclick', async (e) => {
        if (e.target.className == 'name') {
            if (e.target.parentElement.className == 'elem expanded') {
                $(e.target.parentElement).removeClass('expanded')
            } else {
                expand(e)
            }
        }
    })

    async function expand(e) {
        $(e.target.parentElement).addClass('expanded')
        let path = eval($(e.target.parentElement).css('--path'))
        if (path == 'computer') {
            $(e.target.parentElement.children[2]).html('')
            $(e.target.parentElement.children[2]).append(`
                <div class="elem" style="--path: 'folder:/'">
                    <div class="expand"></div>
                    <button class="name"><img src="data:image/png;base64,${getIcon(await getResFromFile('/Windows/system32/imageres.el', 'Icon/3'), '16x16')}">Root directory</button>
                    <div class="children">
                
                    </div>
                </div>
            `)
        } else if (path.startsWith('folder:')) {
            $(e.target.parentElement.children[2]).html('')
            let realpath = path.replace('folder:', '')
            if (realpath == '/') realpath = 'root'
            let cont = ''
            for await (let elem of (await fs.readDirectory(realpath)).directories) {
                cont+= `
                    <div class="elem" style="--path: 'folder:${elem.fullPath.replace('root/', '/')}'">
                        <div class="expand"></div>
                        <button class="name"><img src="data:image/png;base64,${getIcon(await getResFromFile('/Windows/system32/imageres.el', 'Icon/3'), '16x16')}">${elem.name}</button>
                        <div class="children">
                    
                        </div>
                    </div>
                `
            }
            $(e.target.parentElement.children[2]).html(cont)
        }
    }

    $('.twopanels .left').html('')
    $('.twopanels .left').append(`
        <div class="elem" style="--path: 'computer'">
            <div class="expand"></div>
            <button class="name"><img src="data:image/png;base64,${getIcon(await getResFromFile('/Windows/system32/imageres.el', 'Icon/109'), '16x16')}">${await getResFromFile('/Windows/system32/shell32.el', 'String/9216')}</button>
            <div class="children">
                
            </div>
        </div>
    `)
}
initLeftpanel()