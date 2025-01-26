const fs = require('fs');
const { exec } = require('child_process');

let path = process.argv[2];

function utf8_to_b64(str) {
    return btoa(unescape(encodeURIComponent(str)))
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)))
}

exec(`node AppCompiler.js "AppsSources/${path}" "temp/FsSources/Windows/${path}.ore"`, (error, stdout, stderr) => {
    if(error) {
        return console.error(error);
    }

    if(stderr) {
        return console.error(error);
    }

    exec(`node CreateImage "temp/FsSources" "temp/FsImage.orim"`, (error, stdout, stderr) => {
        if(error) {
            return console.error(error);
        }
    
        if(stderr) {
            return console.error(error);
        }
    
        console.log('Done');
    });
});