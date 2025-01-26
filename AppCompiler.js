const fs = require('fs')

let sourcePath = process.argv[2]
let compilePath = process.argv[3]

function utf8_to_b64(str) {
    return btoa(unescape(encodeURIComponent(str)))
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)))
}

console.log('OknaRed App Compiler v1.0')
console.log('Compiling app from "' + sourcePath + '" to "' + compilePath + '"...')

var result = {}

async function createMUI() {
    if (await fs.existsSync(sourcePath + '/mui')) {
        let content = await fs.readdirSync(sourcePath + '/mui')
        for await (let elem of content) {
            console.log('Building MUI ' + elem)
            let resultMui = {}
            if (await fs.existsSync(sourcePath + '/mui/' + elem + '/String.json')) {
                resultMui.String = (await fs.readFileSync(sourcePath + '/mui/' + elem + '/String.json')).toString()
            }
            let rsList = await fs.readdirSync(sourcePath + '/mui/' + elem, { withFileTypes: true })
            for await (let elem2 of rsList) {
                if (elem2.isDirectory()) {
                    resultMui[elem2.name] = {}
                    let a = await fs.readdirSync(sourcePath + '/mui/' + elem + '/' + elem2.name, { withFileTypes: true })
                    for await (let elem3 of a) {
                        if (elem3.isFile()) {
                            resultMui[elem2.name][elem3.name.split('.')[0]] = (await fs.readFileSync(sourcePath + '/mui/' + elem + '/' + elem2.name + '/' + elem3.name)).toString('base64')
                        }
                    }
                    resultMui[elem2.name] = JSON.stringify(resultMui[elem2.name])
                }
            }
            let filename = compilePath.split('/')
            filename = filename[filename.length - 1]
            let compilepath2 = compilePath.split('/')
            compilepath2.splice(compilepath2.length - 1, 1)
            compilepath2 = compilepath2.join('/')
            if (!(await fs.existsSync(compilepath2 + '/' + elem))) {
                await fs.mkdirSync(compilepath2 + '/' + elem)
            }
            await fs.writeFileSync(compilepath2 + '/' + elem + '/' + filename + '.orml', JSON.stringify(resultMui))
        }
    }
}

async function init() {
    console.log('St.1 - Reading app info...')

    async function readAppInfo() {
        if (!(await fs.existsSync(sourcePath + '/CompileParams.json'))) {
            return 'Error: No CompileParams.json file exists!'
        }

        result.compileParams = JSON.parse(String(await fs.readFileSync(sourcePath + '/CompileParams.json')))
    }

    await readAppInfo()

    console.log('St.2 - Creating file list...')

    async function createFileList() {
        let rsList = await fs.readdirSync(sourcePath + '/res', { withFileTypes: true })
        result.rsList = []
        for await (let elem of rsList) {
            if (elem.isDirectory()) {
                let content = []
                let a = await fs.readdirSync(sourcePath + '/res/' + elem.name, { withFileTypes: true })
                a.forEach((elem) => {
                    if (elem.isFile()) {
                        content.push({
                            name: elem.name.split('.')[0],
                            origname: elem.name,
                        })
                    }
                })
                result.rsList.push({
                    name: elem.name,
                    content: content,
                })
            }
        }
    }

    await createFileList()

    console.log('St.3 - Reading files...')

    async function readFiles() {
        result.res = {}

        for await (let elem of result.rsList) {
            result.res[elem.name] = {}
            for await (let elem2 of elem.content) {
                result.res[elem.name][elem2.name] = (await fs.readFileSync(sourcePath + '/res/' + elem.name + '/' + elem2.origname)).toString('base64')
            }
        }

        if (await fs.existsSync(sourcePath + '/res/String.json')) {
            result.res.String = JSON.parse((await fs.readFileSync(sourcePath + '/res/String.json')).toString())
        }

        result.main = (await fs.readFileSync(sourcePath + '/main.js')).toString('base64')
    }

    await readFiles()

    console.log('St.4 - Building file...')

    async function buildFile() {
        result.file = {
            info: result.compileParams,
            res: result.res,
            rsList: result.rsList,
            main: result.main,
        }
    }

    await buildFile()

    console.log('St.5 - Creating MUI...')

    await createMUI()

    console.log('St.6 - Writing file...')

    async function writeFile() {
        fs.writeFileSync(compilePath, JSON.stringify(result.file))
    }

    await writeFile()

    console.log('Completed!')
}

init()
