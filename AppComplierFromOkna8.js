const fs = require('fs');
const { exec } = require('child_process');

let path = process.argv[2];

function utf8_to_b64(str) {
    return btoa(unescape(encodeURIComponent(str)))
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)))
}

console.log('OknaRed App From Okna8 Compiler v1.0');

(async() => {
if(fs.existsSync(path)) {
    console.log('Compiling app');

    let complieParams = {};
    let mainCode = '';
    let appInit = fs.readFileSync(path+'/AppInit.js', {encoding: 'utf-8'});
    appInit = appInit.substring(appInit.indexOf('var UserApp = {'), appInit.indexOf('// Код далее не изменять.'));
    appInit = appInit.replace('var UserApp =','').replaceAll(`'`,`"`);
    let r = false;for(let i=0;i<appInit.length;i++) {
        let s = appInit.substring(i, i+1);
        if(s == ',') {
            r = true;
        } if(r) {
            if(s == '"') {
                r = false;
            } else if(s == '}') {
                appInit = appInit.substring(0, i-3)+"}";
                break;
            }
        }
    }
    // console.log(appInit);

    try {
        appInit = JSON.parse(appInit);
    } catch{
        appInit = fs.readFileSync(path+'/AppInit.js', {encoding: 'utf-8'});
        appInit = appInit.substring(appInit.indexOf('var UserApp = ['), appInit.indexOf('// Код далее не изменять.'));
        appInit = appInit.replace('var UserApp =','appInit =').replaceAll(`'`,`"`);
        for(let i=0;i<appInit.length;i++) {
            let s = appInit.substring(i, i+1);
            if(s == '/' && appInit.substring(i+1, i+2) != '*') {
                if(s == '/' && appInit.substring(i-1, i) != '*') {
                    appInit = appInit.substring(0, i-3)+"]";
                    break;
                }
            }
        }

        eval(appInit);
    }

    if(!Array.isArray(appInit)) {
        complieParams = {
            type: 'ore', desc: appInit.appName,
            language: appInit.locale, productName: appInit.packageName,
            packageVer: appInit.ver, copyright: '', filename: appInit.packageName
        }
        mainCode = `
        dwm.create({
            content: b64_to_utf8(getRes('HTML/index')),
            args: {},
            windowConfig: {
                width: "${appInit.width}",
                height: "${appInit.height}",
                title: "${appInit.appName}",
                killProcessOnClose: true
            }
        });
    `;
    } else {
        complieParams = {
            type: 'ore', desc: appInit[1], language: appInit[2],
            productName: appInit[0], packageVer: appInit[8], copyright: '',
            filename: appInit[0]
        }
        mainCode = `
        dwm.create({
            content: b64_to_utf8(getRes('HTML/index')),
            args: {},
            windowConfig: {
                width: "500px",
                height: "500px",
                title: "${appInit[1]} (Metro App)",
                killProcessOnClose: true
            }
        });
    `;
    }

    if(!fs.existsSync('temp/FsSources/AppsOkna8')) fs.mkdirSync('temp/FsSources/AppsOkna8');
    if(!fs.existsSync('temp/appOkna8')) fs.mkdirSync('temp/appOkna8');
    if(!fs.existsSync('temp/appOkna8/res')) fs.mkdirSync('temp/appOkna8/res');
    if(!fs.existsSync('temp/appOkna8/res/HTML')) fs.mkdirSync('temp/appOkna8/res/HTML');
    if(!fs.existsSync('temp/appOkna8/res/JS')) fs.mkdirSync('temp/appOkna8/res/JS');
    if(!fs.existsSync('temp/appOkna8/res/CSS')) fs.mkdirSync('temp/appOkna8/res/CSS');
    if(!fs.existsSync('temp/appOkna8/res/IMAGE')) fs.mkdirSync('temp/appOkna8/res/IMAGE');
    if(!fs.existsSync('temp/appOkna8/res/Icon')) fs.mkdirSync('temp/appOkna8/res/Icon');
    fs.writeFileSync('temp/appOkna8/ComplieParams.json', JSON.stringify(complieParams));
    fs.writeFileSync('temp/appOkna8/main.js', mainCode);

    let res = [];
    let files = fs.readdirSync(path, { withFileTypes: true });
    files.forEach(elem => {
        if(elem.name != 'AppInit.js') {
            let exten = elem.name.split('.').pop().toLocaleLowerCase();
            let data = '';
            try {
                data = fs.readFileSync(path+'/'+elem.name, {encoding: 'utf-8'});
                
                if(exten == 'js') {
                    res.push({type: 'js', name: elem.name, data});
                } else if(exten == 'css') {
                    res.push({type: 'css', name: elem.name, data});
                } else if(exten == 'html') {
                    res.push({type: 'html', name: elem.name, data});
                } else if(exten == 'png' || exten == 'jpg' || exten == 'jpeg') {
                    res.push({type: 'image', name: elem.name, data});
                    exten = 'image';
                }
                fs.writeFileSync('temp/appOkna8/res/'+exten.toLocaleUpperCase()+'/'+elem.name, data);
            } catch {
                console.error('cancelled file', elem.name);
            }
        }
    });

    res.forEach(e => {
        if(e.type == 'html') {
            res.forEach(s => {
                if(s.type != 'html') {
                    let name = s.name.replace(".js","").replace('.css','');
                    if(s.type == 'js') e.data = e.data.replaceAll(`<script src="${s.name}"></script>`, `<script>loadScriptFromRes('JS/${name}')</script>`);
                    if(s.type == 'css') e.data = e.data.replaceAll(`<link rel="stylesheet" href="${s.name}">`, `<script>loadStylesFromRes('CSS/${name}')</script>`);
                }
            });
            fs.writeFileSync('temp/appOkna8/res/HTML/'+e.name, e.data);
        }
    });

    console.log('Done, running AppCompiler..');

    exec(`node AppCompiler.js "temp/appOkna8" "temp/FsSources/AppsOkna8/${complieParams.filename}.ore"`, (error, stdout, stderr) => {
        if(error) {
            return console.error(error);
        }

        if(stderr) {
            returnconsole.error(error);
        }

        console.log(`${stdout}\nDone! Run CreateImage\n   (node CreateImage "temp/FsSources" "temp/FsImage.orim")\n   REMEMBER! Not all applications work!`);
    });
} else {
    return console.error('Not found');
}
})();