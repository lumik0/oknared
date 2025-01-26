async function main(){
    const win = await dwm.create({
        content: b64_to_utf8(getRes('HTML/index')),
        args: {},
        windowConfig: {
            width: "800px",
            height: "600px",
            top: "0",
            left: "0",
            frame: true,
            resizable: true,
            title: getRes('String/0')
        }
    });
    await win.waitForClose();
}