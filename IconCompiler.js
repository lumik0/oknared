const fs = require('fs')

let sourcePath = process.argv[2]
let compilePath = process.argv[3]

function utf8_to_b64( str ) {
    return btoa(unescape(encodeURIComponent( str )));
}

function b64_to_utf8( str ) {
    return decodeURIComponent(escape(window.atob( str )));
}

console.log('OknaRed Icon Compiler v1.0')
console.log('Compiling icon from "' + sourcePath + '" to "' + compilePath + '"...')

var result = {}

async function init() {
    console.log('St.1 - Reading icon info...')

    async function readAppInfo() {
        if (!(await fs.existsSync(sourcePath + '/IconProperties.json'))) {
            return 'Error: No IconProperties.json file exists!'
        }

        result.iconProperties = JSON.parse(String(await fs.readFileSync(sourcePath + '/IconProperties.json')))
    }

    await readAppInfo()

    console.log('St.2 - Reading files...')

    async function readFiles() {
        result.icons = {}

        for await (let elem of result.iconProperties.iconList) {
            result.icons[elem.w + 'x' + elem.h] = (await fs.readFileSync(sourcePath + '/' + elem.path)).toString('base64')
        }
    }

    await readFiles()

    console.log('St.3 - Writing file...')

    async function writeFile() {
        fs.writeFileSync(compilePath, JSON.stringify(result.icons))
    }

    await writeFile()

    console.log('Completed!')
}

init()