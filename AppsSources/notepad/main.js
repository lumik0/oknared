async function main() {
    const win = await dwm.create({
        content: b64_to_utf8(getRes('HTML/1')),
        args: args,
        windowConfig: {
            width: '1000px',
            height: '600px',
            title: getRes('String/9'),
            killProcessOnClose: true,
            icon: await getRes('Icon/2'),
        },
    });

    await win.waitForClose();
}