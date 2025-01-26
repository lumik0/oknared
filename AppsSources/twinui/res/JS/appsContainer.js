const appsContainer = {}
appsContainer.content = {}
appsContainer.update = async () => {
    let profilePath = (await reg.readKey('HKEY_LOCAL_MACHINE/SOFTWARE/Microsoft/Windows NT/CurrentVersion/ProfileList/' + currentUser.sid + '/ProfileImagePath')).data
    appsContainer.content = {}

    async function prepareDir(path, isroot) {
        let dircontent = await fs.readDirectory(path)
        let dirname = path.split('/')[path.split('/').length - 1]
        let desktopini = {}
        if (await fs.exists(path + '/desktop.ini')) {
            desktopini = parseIni(await fs.readFile(path + '/desktop.ini'))
        }
        if (isroot) dirname = '**%%root%%**'
        else if (desktopini['.ShellClassInfo'] && desktopini['.ShellClassInfo']['LocalizedResourceName']) {
            let nameres = desktopini['.ShellClassInfo']['LocalizedResourceName']
            if (nameres.startsWith('@')) {
                nameres = nameres.replace('@', '')
                nameres = nameres.split(',')
                let newname = await getResFromFile(await parsePath(nameres[0]), 'String/' + nameres[1].replace('-', ''))
                console.log('StartScreen-AppsContainer: Directory "' + dirname + '" displayed as "' + newname + '"')
                dirname = newname
            }
        }
        if (appsContainer.content[dirname] == null) {
            appsContainer.content[dirname] = []
        }
        for await (let elem of dircontent.files) {
            if (elem.name.endsWith('.elnk')) {
                let localizedName = elem.name
                if (desktopini.LocalizedFileNames[elem.name]) {
                    let nameres = desktopini.LocalizedFileNames[elem.name]
                    try {
                        if (nameres.startsWith('@')) {
                            nameres = nameres.replace('@', '')
                            nameres = nameres.split(',')
                            let newname = await getResFromFile(await parsePath(nameres[0]), 'String/' + nameres[1].replace('-', ''))
                            console.log('StartScreen-AppsContainer: File "' + elem.name + '" displayed as "' + newname + '"')
                            localizedName = newname
                        }
                    } catch {}
                }
                appsContainer.content[dirname].push({
                    path: elem.fullPath,
                    name: elem.name,
                    localizedName: localizedName,
                    type: "shortcut"
                })
            }
        }
        for await (let elem of dircontent.directories) {
            await prepareDir(elem.fullPath)
        }
    }
    await prepareDir('/ProgramData/Microsoft/Windows/Start Menu/Programs', true)
    await prepareDir(profilePath + '/AppData/Roaming/Microsoft/Windows/Start Menu/Programs', true)

    $('#appsContainer').html('')
    for await (let elem of Object.keys(appsContainer.content)) {
        let isfirst = true
        for await (let elem2 of appsContainer.content[elem]) {
            if (elem2.type == "shortcut") {
                let appname, icon = "", onclick, header = ""
                if (isfirst) {
                    isfirst = false
                    if (elem == "**%%root%%**") {
                        header = `<p class="categoryHeader">${await getResFromFile('/Windows/system32/twinui.el', 'String/4071')}</p>`
                    } else {
                        header = `<p class="categoryHeader">${elem}</p>`
                    }
                }
                appname = elem2.localizedName
                onclick = `startScreenHide();cmdexec('&quot;${elem2.path}&quot;')`
                $('#appsContainer').append(`<div class="elemcontainer">${header}<div class="appelem" onclick="${onclick}"><div class="icon"><img src="${icon}"></div><p>${appname}</p></div></div>`)
            }
        }
    }
}

appsContainer.update()
