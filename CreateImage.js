const fs = require('fs')

let sourcePath = process.argv[2]
let compiledPath = process.argv[3]

function utf8_to_b64( str ) {
    return btoa(unescape(encodeURIComponent( str )));
}

function b64_to_utf8( str ) {
    return decodeURIComponent(escape(window.atob( str )));
}

let imageApplyScript = `
    let image = __IMAGE__
    let filesCount = __FILESCOUNT__
`

async function CreateFsImage(a, b) {
    console.log('Compiling "' + a + '" to "' + b + '"')
    async function PrepareFile(path) {
        console.log(path)
        let file = await fs.readFileSync(path)
        return file.toString('base64')
    }

    let filesCount = 0
    async function PrepareDir(path) {
        let cont = await fs.readdirSync(path, { withFileTypes: true })
        let dirContent = []
        filesCount++
        for await (let elem of cont) {
            console.log(elem.name)
            if (await elem.isFile()) {
                if (elem.name != ".placeholder" && elem.name != ".gitignore" && elem.name != ".gitkeep") {
                    dirContent.push({
                        type: 'file',
                        name: elem.name,
                        content: await PrepareFile(path + '/' + elem.name)
                    })
                    filesCount++
                }
            } else {
                dirContent.push({
                    type: 'dir',
                    name: elem.name,
                    fullPath: path.replace('temp/FsSources', '') + '/' + elem.name,
                    dirContent: await PrepareDir(path + '/' + elem.name)
                })
            }
        }
        return dirContent
    }

    let imageContent = await PrepareDir(a)
    await fs.writeFileSync(b, JSON.stringify(imageContent, true, 4))
    await fs.writeFileSync(b + '.js', imageApplyScript.replace('__IMAGE__', JSON.stringify(imageContent)).replace('__FILESCOUNT__', filesCount))

}

CreateFsImage(sourcePath, compiledPath)