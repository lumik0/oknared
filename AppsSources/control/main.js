async function main() {
    const win = await dwm.create({
        content: b64_to_utf8(await getResFromFile('/Windows/system32/explorerframe.el', 'HTML/1')),
        args: ['controlpanel:/'],
        windowConfig: {
            width: '1000px',
            height: '600px',
            title: await getResFromFile('/Windows/system32/explorerframe.el', 'String/726'),
            killProcessOnClose: true,
            icon: await getRes('Icon/101'),
        },
    });
    
    await win.waitForClose();
}
