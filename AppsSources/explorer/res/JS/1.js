async function init() {
    window.taskbar = {}
    taskbar.focusTo = async (_wid) => {
        setTimeout(() => {
            window.parent.postMessage({
                message: 'eval',
                eval: 'oknared.dwm.focus(' + _wid + ')'
            })
        }, 1);
    }
    taskbar.tasks = {};

    async function hoverIn(e) {
        let processPath = eval($(e.target).css('--processPath'))
        window.parent.postMessage({
            message: 'eval',
            eval: `
                $('#WindowFrame_${args.wid}')[0].contentWindow.postMessage({
                    message: "displayWindowInfo",
                    widList: ${JSON.stringify(taskbar.tasks[processPath].content)},
                    pos: ${$('#taskbarelem_wid' + taskbar.tasks[processPath].content[0]).offset().left}
                })
                $('#WindowContainer_${args.wid}').addClass('show')
                $('#WindowContainer_${args.wid}').removeClass('hide')
            `
        })
    }

    async function addWindowToTaskbar(wid) {
        if (dwm.windows[wid].displayOnTaskbar != false) {
            let processPath = task.tasks[dwm.windows[wid].pid].path
            if (!taskbar.tasks[processPath]) {
                taskbar.tasks[processPath] = {}
                taskbar.tasks[processPath].content = []
            }
            taskbar.tasks[processPath].content.push(wid)
            if (taskbar.tasks[processPath].content.length == 1) {
                let processIcon = ''
                let processIcon32 = ''
                let windowIcon = ''
                let windowIcon32 = ''
                let programConfig = JSON.parse(await fs.readFile(processPath))
                if (programConfig.info.icon) {
                    if (programConfig.info.icon.startsWith('$RES/', '')) {
                        processIcon = await getResFromFile(processPath, programConfig.info.icon.replace('$RES/', ''))
                        processIcon32 = getIcon(processIcon, '32x32')
                    }
                }
                if (dwm.windows[wid].icon) {
                    windowIcon = dwm.windows[wid].icon
                    windowIcon32 = getIcon(dwm.windows[wid].icon, '32x32')
                }
                $('.windowContainer').append(`
                    <div class="elem" style="--processPath: '${processPath}'" id="taskbarelem_wid${wid}" onclick="taskbar.focusTo(${wid})">
                        <div class="img"></div>
                        <div class="img"></div>
                        <div class="img"></div>
                        <div>
                            <img class="processicon" src="data:image/png;base64,${processIcon32}">
                            <img class="windowicon" src="data:image/png;base64,${windowIcon32}">
                        </div>
                    </div>
                `)
                $('#taskbarelem_wid' + taskbar.tasks[processPath].content[0]).removeClass('e3')
                $('#taskbarelem_wid' + taskbar.tasks[processPath].content[0]).removeClass('e2')
                $('#taskbarelem_wid' + taskbar.tasks[processPath].content[0]).hover(hoverIn)
            } else if (taskbar.tasks[processPath].content.length == 2) {
                $('#taskbarelem_wid' + taskbar.tasks[processPath].content[0]).addClass('e2')
                $('#taskbarelem_wid' + taskbar.tasks[processPath].content[0]).removeClass('e3')
            } else if (taskbar.tasks[processPath].content.length > 2) {
                $('#taskbarelem_wid' + taskbar.tasks[processPath].content[0]).addClass('e3')
                $('#taskbarelem_wid' + taskbar.tasks[processPath].content[0]).removeClass('e2')
            }
        }
    }

    window.parent.postMessage({
        message: 'eval',
        eval: 'window.explorer_taskbarWID = ' + wid
    })
    $('.startButton').css('background-image', 'url("data:image/png;base64,' + await getResFromFile('/Windows/system32/twinui.el', 'IMAGE/11701') + '")')
    $('#jsstyles1').html(`
        .windowContainer > .elem > div.img {
            background-image: url('data:image/png;base64,${await getResFromFile('/Windows/Resources/Themes/aero/aero.el', 'IMAGE/1113')}')
        }    
    `)

    $('.startButton').hover(() => {
        window.parent.postMessage({
            message: 'eval',
            eval: `
                $('#WindowFrame_' + explorer_startButtonWID)[0].contentWindow.postMessage({
                    message: 'show'
                })
            `
        })
    }, () => {})

    document.body.addEventListener('dwm_windowcreated', (e) => {
        console.log('CREATE '+e.detail.wid);
        addWindowToTaskbar(e.detail.wid);
    })

    document.body.addEventListener('dwm_iconchanged', (e) => {
        if (dwm.windows[e.detail.wid].displayOnTaskbar != false) {
            $('#taskbarelem_wid' + e.detail.wid + ' > div > img.windowicon').attr('src', 'data:image/png;base64,' + getIcon(dwm.windows[e.detail.wid].icon, '32x32'))
        }
    })

    document.body.addEventListener('dwm_windowclosed', (e) => {
        if (e.detail.window.displayOnTaskbar != false) {
            let processPath = task.tasks[e.detail.window.pid].path
            let pos = taskbar.tasks[processPath].content.indexOf(Number(e.detail.wid))
            if (taskbar.tasks[processPath].content.length == 2) {
                $('#taskbarelem_wid' + taskbar.tasks[processPath].content[0]).removeClass('e3')
                $('#taskbarelem_wid' + taskbar.tasks[processPath].content[0]).removeClass('e2')
            } else if (taskbar.tasks[processPath].content.length == 3) {
                $('#taskbarelem_wid' + taskbar.tasks[processPath].content[0]).removeClass('e3')
                $('#taskbarelem_wid' + taskbar.tasks[processPath].content[0]).addClass('e2')
            } else if (taskbar.tasks[processPath].content.length > 3) {
                $('#taskbarelem_wid' + taskbar.tasks[processPath].content[0]).addClass('e3')
                $('#taskbarelem_wid' + taskbar.tasks[processPath].content[0]).removeClass('e2')
            }
            taskbar.tasks[processPath].content.splice(pos, 1)
            if (pos == 0 && taskbar.tasks[processPath].content.length > 0) {
                $('#taskbarelem_wid' + e.detail.wid).attr('id', 'taskbarelem_wid' + taskbar.tasks[processPath].content[0])
            } else if (taskbar.tasks[processPath].content.length == 0) {
                $('#taskbarelem_wid' + e.detail.wid).remove()
                delete taskbar.tasks[processPath]
            }
        }

    })
    document.body.addEventListener('dwm_windowfocuschange', (e) => {
        $('.windowContainer > .elem.focus').removeClass('focus')
        if(dwm.windows[e.detail.wid].displayOnTaskbar != false) {
            $('#taskbarelem_wid' + taskbar.tasks[task.tasks[dwm.windows[e.detail.wid].pid].path].content[0]).addClass('focus')
        }
    })
}
init()