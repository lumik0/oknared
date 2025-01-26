async function init() {
    menubar.setMenu(JSON.parse(b64_to_utf8(getRes('Menu/1'))))
}

var currentPath = null

async function loadFile(path) {
    try {
        let filecontent = await fs.readFile(path)
        currentPath = path
        $('#notepadTextarea').html(filecontent)
        let patharr = currentPath.split('/')
        let filename = patharr[patharr.length - 1]
        setWindowHeader(getRes('String/5').replace('%1', filename))
    }
    catch (e) {
        console.log('Notepad: Error with file opening:\n' + e)
    }

}

function blockWindow() {
    window.parent.postMessage({
        message: 'eval',
        eval: `
            dwm.blockWindow(${wid})
        `
    })
}
function unblockWindow() {
    window.parent.postMessage({
        message: 'eval',
        eval: `
            dwm.unblockWindow(${wid})
        `
    })
}

document.body.addEventListener('menubarselect', async (e) => {
    if (e.detail.selectedItem == "2") {
        let result = await openFileDialog({
            header: getRes('String/22'),
            filetypes: [
                {
                    fileext: "*.txt",
                    displayName: getRes('String/20')
                },
                {
                    fileext: "*.*",
                    name: getRes('String/21')
                }
            ],
            defaultLocation: "/"
        })
        if (!result.canceled) {
            loadFile(result.result)
        }
    }
})

init()

if (args[0] && args[0].startsWith('/') || args[0] && args[0].startsWith('root/')) {
    loadFile(args[0])
}