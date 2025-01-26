async function init() {
    $('body').append(`
        <style>
            .leftpanel .elem > .expand {
                background-image: url('data:image/png;base64,${await getResFromFile('/Windows/Resources/Themes/aero/aero.el', 'IMAGE/1003')}')
            }
            .leftpanel .elem > .expand:hover {
                background-image: url('data:image/png;base64,${await getResFromFile('/Windows/Resources/Themes/aero/aero.el', 'IMAGE/1008')}')
            }
        </style>
    `)

    let icons = {}
    icons.folder = getIcon(await getResFromFile('/Windows/system32/imageres.el', 'Icon/3'), '16x16')
    icons.mypc = getIcon(await getResFromFile('/Windows/system32/imageres.el', 'Icon/109'), '16x16')
    
    $('.leftpanel').html(`
        <div class="elem expanded" style="--path: 'ROOT';">
            <div class="expand"></div>
            <button class="name"><img src="data:image/png;base64,${icons.mypc}">Компьютер</button>
            <div class="children">
                <div class="elem" style="--path: 'HKEY_CLASSES_ROOT';">
                    <div class="expand"></div>
                    <button class="name"><img src="data:image/png;base64,${icons.folder}">HKEY_CLASSES_ROOT</button>
                    <div class="children"></div>
                </div>
                <div class="elem" style="--path: 'HKEY_CURRENT_USER';">
                    <div class="expand"></div>
                    <button class="name"><img src="data:image/png;base64,${icons.folder}">HKEY_CURRENT_USER</button>
                    <div class="children"></div>
                </div>
                <div class="elem" style="--path: 'HKEY_LOCAL_MACHINE';">
                    <div class="expand"></div>
                    <button class="name"><img src="data:image/png;base64,${icons.folder}">HKEY_LOCAL_MACHINE</button>
                    <div class="children"></div>
                </div>
                <div class="elem" style="--path: 'HKEY_USERS';">
                    <div class="expand"></div>
                    <button class="name"><img src="data:image/png;base64,${icons.folder}">HKEY_USERS</button>
                    <div class="children"></div>
                </div>
                <div class="elem" style="--path: 'HKEY_CURRENT_CONFIG';">
                    <div class="expand"></div>
                    <button class="name"><img src="data:image/png;base64,${icons.folder}">HKEY_CURRENT_CONFIG</button>
                    <div class="children"></div>
                </div>
            </div>
        </div> 
    `)

    async function expand(e) {
        $(e.target.parentElement).addClass('expanded')
        let path = $(e.target.parentElement).css('--path')
        path = JSON.parse(path.replaceAll('\'', '"'))
        if (path == "ROOT") return
        $(e.target.parentElement.children[2]).html('')
        let content = await reg.readHive(path)
        content.hives.forEach(elem => {
            $(e.target.parentElement.children[2]).append(`
                <div class="elem" style="--path: '${path + '/' + elem}';">
                    <div class="expand"></div>
                    <button class="name"><img src="data:image/png;base64,${icons.folder}">${elem}</button>
                    <div class="children"></div>
                </div>
            `)
        });
    }

    async function displayHiveAtRight(path) {
        let dispPath = 'Компьютер\\' + path.replaceAll('/', '\\')
        if (dispPath == 'Компьютер\\ROOT') dispPath = "Компьютер"
        $('.statusbar p').html(dispPath)

        $('.rightpanel > .scroll > table > tbody').html(``)
        let keys = (await reg.readHive(path)).keys
        if (keys['@'] == null) {
            //console.log('no @')
            //await reg.writeKey(path + '/@', 'REG_SZ', '')
        }
        keys = (await reg.readHive(path)).keys
        for await (let elem of keys) {
            let data = await reg.readKey(path + '/' + elem)
            if (elem == '@') {
                $('.rightpanel > .scroll > table > tbody').prepend(`
                    <tr>
                        <td><p>(По умолчанию)</p></td>
                        <td><p>${data.type}</p></td>
                        <td><p>${data.data}</p></td>
                    </tr>
                `)
            } else {
                $('.rightpanel > .scroll > table > tbody').append(`
                    <tr>
                        <td><p>${elem}</p></td>
                        <td><p>${data.type}</p></td>
                        <td><p>${data.data}</p></td>
                    </tr>
                `)
            }
        }
    }
    document.addEventListener('click', async (e) => {
        if (e.target.className == "expand") {
            if (e.target.parentElement.className == "elem expanded") {
                $(e.target.parentElement).removeClass('expanded')
            } else {
                expand(e)
            }
        } else if (e.target.className == "name") {
            displayHiveAtRight($(e.target.parentElement).css('--path').replaceAll('\'', ''))
        }
    })
    document.addEventListener('dblclick', async (e) => {
        if (e.target.className == "name") {
            if (e.target.parentElement.className == "elem expanded") {
                $(e.target.parentElement).removeClass('expanded')
            } else {
                expand(e)
            }
        }
    })

    let slider = {}
    slider.down = (e) => {
        if (e.target.className == "slider") {
            document.addEventListener('mousemove', slider.move)
            document.addEventListener('mouseup', slider.up)
        }
    }
    slider.move = (e) => {
        $('body').css('--lpwidth', (e.x + 2) + 'px')
    }
    slider.up = (e) => {
        document.removeEventListener('mousemove', slider.move)
        document.removeEventListener('mouseup', slider.up)
    }
    document.addEventListener('mousedown', slider.down)
}

init()