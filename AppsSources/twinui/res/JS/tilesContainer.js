const tilesContainer = {}
tilesContainer.update = async () => {
    // Получение лэйаута начального экрана
    let profilePath = (await reg.readKey('HKEY_LOCAL_MACHINE/SOFTWARE/Microsoft/Windows NT/CurrentVersion/ProfileList/' + currentUser.sid + '/ProfileImagePath')).data
    let layoutPath = profilePath + '/AppData/Roaming/Okna/StartScreenLayout.json'
    let layout = JSON.parse(await fs.readFile(layoutPath))

    // Применение на экран
    $('#tilesContainer').html('<div class="content"></div>')
    let i = 0                                                                       // Текущая группа
    let q = 0                                                                       // Количество добавленных плиток в столбце (.5 - стандартная  плитка, 1 - широкая, 2 - большая)
    let w = 0                                                                       // Текущий стобец
    let e = Math.floor((window.innerHeight - 240) / 128)                            // Размер столбца
    if (e > 6) e = 6

    tilesContainer.currentHeight = e

    for await (let group of layout) {                                               // Перебор групп
        $('#tilesContainer .content').append('<div class="group" id="tilesConainerGroup' + i + '"></div>')
        $('#tilesConainerGroup' + i).append('<div class="column" id="tilesConainerColumn' + w + '"></div>')

        for await (let tile of group.groupcontent) {
            // Преобразование размера плитки в число
            let tileSize = 0
            if (tile.size == 'standart')    tileSize = 0.5
            if (tile.size == 'wide')        tileSize = 1
            if (tile.size == 'large')       tileSize = 2
            // Перенос на другой столбец в случае переполнения
            if (q + tileSize > e) {
                w++
                q = 0
                $('#tilesConainerGroup' + i).append('<div class="column" id="tilesConainerColumn' + w + '"></div>')
            }

            // Название плитки
            let tilename = ""
            let onclick = ""
            let content = ""
            if (tile.type == "desktop") {
                tilename = await getResFromFile('/Windows/system32/twinui.el', 'String/5615')
                onclick = "startScreenHide()"
                content = "<img class=\"desktopimage\" src=\"" + await fs.readFileBin((await reg.readKey('HKEY_CURRENT_USER/Control Panel/Desktop/Wallpaper')).data) + "\">"
            }
            if (tile.type == "app") {
                tilename = tile.package
            }

            // Добавление на начальный экран
            q+= tileSize
            $('#tilesConainerColumn' + w).append(`
                <div onclick="${onclick}" class="tile ${tile.size} ${tile.type}">
                    <p>${tilename}</p>
                    ${content}
                    <div class="border"></div>
                </div>
            `)
        }
        
        i++; w++; q = 0
    }

    setTimeout(() => {
        $('#tilesContainer .group').css('height', e * 128 + 'px')
    }, 100);
}

window.addEventListener('resize', () => {
    let newheight = Math.floor((window.innerHeight - 240) / 128)
    if (newheight > 6) newheight = 6
    if (newheight != tilesContainer.currentHeight) {
        tilesContainer.update()
    }
})
tilesContainer.update()