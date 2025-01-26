const fs = require('fs')
const { execSync } = require('child_process')

function utf8_to_b64( str ) {
    return btoa(unescape(encodeURIComponent( str )));
}

function b64_to_utf8( str ) {
    return decodeURIComponent(escape(window.atob( str )));
}

console.log('OknaRed Compiler v1.0')
console.log('Compiling OS...')

var result = {}

async function init() {
    console.log('St.1 - Preparing...')

    if (await fs.existsSync('temp')) {
        await fs.rmSync('temp', { recursive: true })
    }
    await fs.mkdirSync('temp')

    result.compileParams = JSON.parse(String(await fs.readFileSync('OknaRedCompileParams.json')))
    
    console.log('St.2 - Copying FsSources...')

    await fs.cpSync('FsSources', 'temp/FsSources', {recursive: true})

    console.log('St.3 - Compiling apps...')

    for await (let elem of result.compileParams.AppCompileList) {
        console.log('Compiling app "' + elem.from + '" to "' + elem.to + '"')
        await execSync(`node AppCompiler.js "${elem.from}" "temp/FsSources${elem.to}"`)
    }

    console.log('St.4 - Creating image...')

    await execSync(`node CreateImage.js "temp/FsSources" "temp/FsImage.orim"`)

    //await fs.rmSync('temp/FsSources', { recursive: true, })

    console.log('Completed! Image saved in temp/FsImage.orim')
}

init()