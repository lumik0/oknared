const wait = ms => new Promise(res => setTimeout(res, ms));
async function main(){
    oknared.hideBootscreen();
    
    await wait(500);

    await(await dwm.create({
        content: b64_to_utf8(getRes('HTML/1')),
        args: {},
        windowConfig: {
            width: "100vw",
            height: "100vh",
            top: "0",
            left: "0",
            frame: false,
            resizable: false,
            //title: getRes('String/503'),
            animation: "none",
            displayOnTaskbar: false,
        }
    })).waitForClose();
}