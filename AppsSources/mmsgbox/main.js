
async function main(args){
    const win = await dwm.create({
        content: b64_to_utf8(getRes('HTML/index')),
        args: Array.isArray(args) ? args.join(' ') : args,
        windowConfig: {
            width: "300px",
            height: "200px",
            title: args[0] || "Information",
            onlyClose: true,
            resizable: true,
            killProcessOnClose: true
        }
    });
    await win.waitForClose();
}