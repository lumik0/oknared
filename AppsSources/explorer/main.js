// Desktop code

async function main(args){
    async function initDesktop() {
        // WINDOW PREVIEW
        const windowpreview = await dwm.create({
            content: b64_to_utf8(getRes('HTML/4')),
            args: {},
            windowConfig: {
                frame: false,
                resizable: false,
                //zIndex: 200,
                animation: "none",
                displayOnTaskbar: false
            },
        });
        // TASKBAR
        const taskdar = await dwm.create({
            content: b64_to_utf8(getRes('HTML/1')),
            args: {
                wid: windowpreview.wid
            },
            windowConfig: {
                width: '100vw',
                height: '40px',
                left: '0',
                top: 'calc(100vh - var(--height))',
                frame: false,
                resizable: false,
                zIndex: 90000,
                animation: "none",
                displayOnTaskbar: false,
            },
        })
        // DESKTOP BACKGROUND
        const desktopBackground = await dwm.create({
            content: b64_to_utf8(getRes('HTML/2')),
            args: {},
            windowConfig: {
                width: '100vw',
                height: '100vh',
                left: '0',
                top: '0',
                frame: false,
                resizable: false,
                zIndex: 199,
                animation: "none",
                displayOnTaskbar: false,
            },
        })
        // DESKTOP ICONS
        const desktopIcons = await dwm.create({
            content: b64_to_utf8(getRes('HTML/3')),
            args: {},
            windowConfig: {
                width: 'var(--maximizedWinWidth)',
                height: 'var(--maximizedWinHeight)',
                left: 'var(--maximizedWinLeft)',
                top: 'var(--maximizedWinTop',
                frame: false,
                resizable: false,
                zIndex: 200,
                animation: "none",
                displayOnTaskbar: false,
            },
        })
        // STARTBUTTON OVERLAY
        const startButtonOverlay = await dwm.create({
            content: b64_to_utf8(await getResFromFile('/Windows/system32/twinui.el', 'HTML/1')),
            args: {},
            windowConfig: {
                width: '50px',
                height: '40px',
                left: '0',
                top: 'calc(100vh - var(--height))',
                frame: false,
                resizable: false,
                zIndex: 90003,
                animation: "none",
                displayOnTaskbar: false,
            },
        })
        // STARTBUTTON TRIGGER
        const startButtonTrigger = await dwm.create({
            content: b64_to_utf8(await getResFromFile('/Windows/system32/twinui.el', 'HTML/3')),
            args: {},
            windowConfig: {
                width: '20px',
                height: '20px',
                left: '0',
                top: 'calc(100vh - var(--height))',
                frame: false,
                resizable: false,
                zIndex: 90002,
                animation: "none",
                displayOnTaskbar: false,
            },
        })
        // STARTSCREEN
        const startScreen = await dwm.create({
            content: b64_to_utf8(await getResFromFile('/Windows/system32/twinui.el', 'HTML/2')),
            args: {},
            windowConfig: {
                width: '100vw',
                height: '100vh',
                left: '0',
                top: '0',
                frame: false,
                resizable: false,
                zIndex: 90001,
                animation: "none",
                displayOnTaskbar: false,
            },
        });
        await taskdar.waitForClose();
        startButtonOverlay.close();
        startButtonTrigger.close();
        desktopBackground.close();
        desktopIcons.close();
        startScreen.close();
    }

    async function initFileManager() {
        const win = await dwm.create({
            content: b64_to_utf8(await getResFromFile('/Windows/system32/explorerframe.el', 'HTML/1')),
            args: args,
            windowConfig: {
                width: '1000px',
                height: '600px',
                title: await getResFromFile('/Windows/system32/explorerframe.el', 'String/726'),
                killProcessOnClose: true,
                icon: await getRes('Icon/ICO_MYCOMPUTER')
            },
        });
        await win.waitForClose();
    }

    if(args.indexOf('desktop') != -1) {
        await initDesktop();
    } else {
        await initFileManager();
    }
}