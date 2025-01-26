async function main(){
    const win = await dwm.create({
        content: b64_to_utf8(getRes('HTML/1')),
        args: {},
        windowConfig: {
            width: "1000px",
            height: "600px",
            title: "Редактор реестра",
            killProcessOnClose: true
        }
    });

    await win.waitForClose();
}