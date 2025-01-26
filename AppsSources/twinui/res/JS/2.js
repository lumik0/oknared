async function init() {
    window.currentState = false

    $('*').each(async (index, elem) => {
        if (elem.className.startsWith('Str_')) {
            let string = elem.className.split(' ')[0].split('_')[1]
            $(elem).html((await getResFromFile('/Windows/system32/twinui.el', 'String/' + string)).replaceAll('&', '').replaceAll('\n', '<br/>'))
        } else if (String($(elem).attr('placeholder')).startsWith('Str_')) {
            let string = $(elem).attr('placeholder').split('_')[1]
            $(elem).attr('placeholder', ((await getResFromFile('/Windows/system32/twinui.el', 'String/' + string)).replaceAll('&', '')))
        }
    });

    window.parent.postMessage({
        message: 'eval',
        eval: `
            window.explorer_startScreenWID = ${wid}
            $('#WindowContainer_${wid}').addClass('startScreenHidden')
            $('body').append(\`
                <style>
                    @keyframes startScreenShow {
                        0% {
                            opacity: 0;
                        }
                        100% {
                            opacity: 1;
                            pointer-events: auto;
                        }
                    }
                    @keyframes startScreenHide {
                        0% {
                            opacity: 1;
                        }
                        100% {
                            opacity: 0;
                            pointer-events: none;
                        }
                    }
                    #WindowContainer_${wid} {
                        animation: startScreenShow 0.4s cubic-bezier(0.1,0.9,0.2,1) forwards;
                    }
                    #WindowContainer_${wid}.startScreenHidden {
                        animation: startScreenHide 0.4s cubic-bezier(0.1,0.9,0.2,1) forwards;
                    }
                </style>
            \`)
        `
    })
    window.startScreenShowAnim = () => {
        $('.startScreen').removeClass('hideAnim')
    }
    window.startScreenHideAnim = () => {
        $('.startScreen').addClass('hideAnim')
    }
    window.startScreenShow = () => {
        currentState = true
        window.parent.postMessage({
            message: 'eval',
            eval: `
                $('#WindowContainer_${wid}').removeClass('startScreenHidden')
            `
        })
        startScreenShowAnim()
    }
    window.startScreenHide = () => {
        currentState = false
        window.parent.postMessage({
            message: 'eval',
            eval: `
                $('#WindowContainer_${wid}').addClass('startScreenHidden')
            `
        })
        startScreenHideAnim()
    }
    window.addEventListener('message', (e) => {
        var data = e.data
        if (data.message == "show") {
            if (currentState) {
                startScreenHide()
            } else {
                startScreenShow()
            }
        }
    })
    window.showApps = () => {
        $('.startScreen').addClass('showApps')
    }
    window.showTiles = () => {
        $('.startScreen').removeClass('showApps')
    }

    loadScriptFromRes('JS/tilesContainer')
    loadScriptFromRes('JS/appsContainer')
}
init()