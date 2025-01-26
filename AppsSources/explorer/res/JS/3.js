async function UpdateDesktop() {
    DesktopFolderContent = await fs.readDirectory(desktoppath)
    let DIC = await fs.readFile(configpath)
    DIC = JSON.parse(DIC)
    let id = 0
    $('#desktopIcons').html('')
    let iconsize = 48

    //let assoc = JSON.parse(await fs.readFile('/system/assoc.json'))

    async function displayShellFolder(clsid, cmdline) {
        let a = await reg.readKey('HKEY_CURRENT_USER/Software/Microsoft/Windows/CurrentVersion/Explorer/HideDesktopIcons/NewStartPanel/' + clsid)
        if (typeof a == "object" && a.data == "0x00000000") {
            let label = (await reg.readKey('HKEY_CLASSES_ROOT/CLSID/' + clsid + '/@')).data
            let icon = ''
            if (typeof (await reg.readKey('HKEY_CLASSES_ROOT/CLSID/' + clsid + '/LocalizedString')) != 'string') {
                nameres = (await reg.readKey('HKEY_CLASSES_ROOT/CLSID/' + clsid + '/LocalizedString')).data
                if (nameres.startsWith('@')) {
                    nameres = nameres.replace('@', '')
                    nameres = nameres.split(',')
                    let newname = await getResFromFile(await parsePath(nameres[0]), 'String/' + nameres[1].replace('-', ''))
                    console.log('Explorer: Desktop icon "' + label + '" displayed as "' + newname + '"')
                    label = newname
                }
            }
            if (typeof (await reg.readKey('HKEY_CLASSES_ROOT/CLSID/' + clsid + '/DefaultIcon/@')) != 'string') {
                let iconres = (await reg.readKey('HKEY_CLASSES_ROOT/CLSID/' + clsid + '/DefaultIcon/@')).data
                iconres = iconres.split(',')
                let newicon = await getResFromFile(await parsePath(iconres[0]), 'Icon/' + iconres[1].replace('-', ''))
                console.log('Explorer: Desktop icon "' + label + '" displayed with icon "' + iconres.join(',') + '"')
                icon = newicon
            }
            let content = `<img src="data:image/png;base64,${getIcon(icon, iconsize + 'x' + iconsize)}" draggable="false"><p>${label}</p>`
            $('#desktopIcons').append(`
                <div class="elem" style="--name: '${clsid}'; " id="desktopelem_${id}">
                    <div class="visible DesktopIconElement" style="--cmdline: '${cmdline}'">${content}</div>
                    <div class="drag">${content}</div>
                </div>
            `)
            if (DIC[clsid]) {
                SetElemPos($('#desktopelem_' + id + ' div')[0], $('#desktopelem_' + id + ' div')[1], DIC[clsid].x, DIC[clsid].y)
            } else {
                SetElemPos($('#desktopelem_' + id + ' div')[0], $('#desktopelem_' + id + ' div')[1], 0, 0)
            }
            id++
        }
    }

    await displayShellFolder('{20D04FE0-3AEA-1069-A2D8-08002B30309D}', '/Windows/explorer.ore computer')
    await displayShellFolder('{645FF040-5081-101B-9F08-00AA002F954E}', '/Windows/explorer.ore recyclebin')


    for await (let elem of DesktopFolderContent.files) {
        let label = elem.name
        let icon = await getResFromFile('/Windows/system32/imageres.el', 'Icon/2')
        let shortcut = ''

        let filenamearray = elem.name.split('.')
        let extension = filenamearray[filenamearray.length - 1]

        //console.log(assoc.fileext)

        if (label.endsWith('.elnk')) {
            label = label.slice(0, -5)
            //shortcut = '<img src="' + ShortcutIcon +'" class="shortcut" draggable="false">'
            let file = JSON.parse(await fs.readFile(elem.fullPath))
            if (file.icon) icon = await fs.readFile(file.icon)
        } /*else {
            //icon = await fs.readFile(assoc.fileext[extension].icon)
        }*/

        let content = `<img src="data:image/png;base64,${getIcon(icon, iconsize + 'x' + iconsize)}" draggable="false">${shortcut}<p>${label}</p>`
        $('#desktopIcons').append(`
            <div class="elem" style="--name: '${elem.name}'; --cmdline: '${elem.fullPath}'" id="desktopelem_${id}">
                <div class="visible DesktopIconElement" style="--cmdline: '${elem.fullPath}'">${content}</div>
                <div class="drag">${content}</div>
            </div>
        `)
        if (DIC[elem.name]) {
            SetElemPos($('#desktopelem_' + id + ' div')[0], $('#desktopelem_' + id + ' div')[1], DIC[elem.name].x, DIC[elem.name].y)
        } else {
            SetElemPos($('#desktopelem_' + id + ' div')[0], $('#desktopelem_' + id + ' div')[1], 0, 0)
        }
        id++
    }
    for await (let elem of DesktopFolderContent.directories) {
        let label = elem.name
        let icon = await getResFromFile('/Windows/system32/imageres.el', 'Icon/3')
        let content = `<img src="data:image/png;base64,${getIcon(icon, iconsize + 'x' + iconsize)}" draggable="false"><p>${label}</p>`
        $('#desktopIcons').append(`
            <div class="elem" style="--name: '${elem.name}'; --cmdline: '/Windows/explorer.ore &quot;${elem.fullPath}&quot;'" id="desktopelem_${id}">
                <div class="visible DesktopIconElement" style="--cmdline: '/Windows/explorer.ore &quot;${elem.fullPath}&quot;'">${content}</div>
                <div class="drag">${content}</div>
            </div>
        `)
        if (DIC[elem.name]) {
            SetElemPos($('#desktopelem_' + id + ' div')[0], $('#desktopelem_' + id + ' div')[1], DIC[elem.name].x, DIC[elem.name].y)
        } else {
            SetElemPos($('#desktopelem_' + id + ' div')[0], $('#desktopelem_' + id + ' div')[1], 0, 0)
        }
        id++
    }
}

document.addEventListener('dblclick', (e) => {
    if (e.srcElement.className == "visible DesktopIconElement") {
        cmdexec(eval($(e.srcElement).css('--cmdline')))
    }
})

var DesktopFolderContent = { files: [], directories: [] }

function WriteNewDIC() {
    let NewDIC = {}
    for (let i = 0; i < ElemsContainer.children.length; i++) {
        let pos = $(ElemsContainer.children[i].children[0]).offset()
        NewDIC[$(ElemsContainer.children[i]).css('--name').replaceAll('\'', '')] = { x: pos.left, y: pos.top }
    }
    fs.writeFile(configpath, JSON.stringify(NewDIC, true, 4))
}

loadScriptFromRes('JS/desktopIconManager')
setInterval(async () => {
    if (DesktopFolderContent.files.length != (await fs.readDirectory(desktoppath)).files.length || DesktopFolderContent.directories.length != (await fs.readDirectory(desktoppath)).directories.length) {
        UpdateDesktop()
    }
}, 1000)
async function init() {
    window.desktoppath = await parsePath('%userprofile%/Desktop')
    window.configpath = await parsePath('%userprofile%/AppData/Roaming/Okna/DesktopLayout.json')
    if (!await fs.exists(configpath)) {
        await fs.writeFile(configpath, '{}')
    }
    UpdateDesktop();
}
init()