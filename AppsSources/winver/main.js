async function main(){
    const win = await dwm.create({
        content: b64_to_utf8(getRes('HTML/1')),
        args: {},
        windowConfig: {
            width: "474px",
            height: "413px",
            title: "Windows: сведения",
            onlyClose: true,
            resizable: false,
            killProcessOnClose: true
        }
    });

    await win.waitForClose();
}