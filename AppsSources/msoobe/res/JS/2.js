var userPreferences = {
    backgroundColor: 18          // ДЕФОЛТНОЕ значение цвета. 2 - красный (бета OknaRed), 18 - фиолетовый (Windows 8.1)
}

var allowOnlineAccount = false  // Разрешить использование онлайн-аккаунта

var colors = [
    { backgroundColor: "29,29,29" },
    { backgroundColor: "124,132,133" },
    { backgroundColor: "142,0,23" },
    { backgroundColor: "164,0,0" },
    { backgroundColor: "211,69,0" },
    { backgroundColor: "235,153,0" },
    { backgroundColor: "255,179,23" },
    { backgroundColor: "125,155,52" },
    { backgroundColor: "65,135,0" },
    { backgroundColor: "29,81,0" },
    { backgroundColor: "0,60,0" },
    { backgroundColor: "68,161,119" },
    { backgroundColor: "0,141,143" },
    { backgroundColor: "0,168,169" },
    { backgroundColor: "0,155,240" },
    { backgroundColor: "0,104,183" },
    { backgroundColor: "0,80,155" },
    { backgroundColor: "9,26,69" },
    { backgroundColor: "24,0,82" },
    { backgroundColor: "73,0,144" },
    { backgroundColor: "86,57,138" },
    { backgroundColor: "141,55,175" },
    { backgroundColor: "140,0,90" },
    { backgroundColor: "171,0,100" },
    { backgroundColor: "234,0,152" }
]

let colorslog = ""

$('#page5_colorSelector > div').css('left', userPreferences.backgroundColor * 30 + 1 + 'px')
$('body').css('--color-back', 'rgb(' + colors[userPreferences.backgroundColor].backgroundColor + ')')

function goTo(page) {
    $('.page').css('display', 'none')
    $('#page' + page).css('display', 'block')
}

function startOemSetup() {
    goTo(1)
}

function startCommonSetup() {
    $('.page').css('display', 'none')
    setTimeout(() => {
        goTo(4)
        $('body').css('background-color', 'var(--color-back)')
        setTimeout(() => {
            goTo(5)
        }, 2220);
    }, 200);
}

setTimeout(async () => {
    startOemSetup()
}, 500);



var colorSelector = {
    move: (e) => {
        if (e.changedTouches) {
            e.x = e.changedTouches[0].pageX
        }
        colorSelector.moveData.c = e.x                                                // Положение курсора относительно страницы
        let x = (colorSelector.moveData.c - (colorSelector.moveData.b + colorSelector.moveData.a) - colorSelector.moveData.d)
        if (x < 1) { x = 1 }
        if (x > 720) { x = 720 }
        $('body').css('--color-back', 'rgb(' + colors[Number((x / 30).toFixed(0))].backgroundColor + ')')
        $('#page5_colorSelector > div').css('left', x + 'px')
    },
    up: (e) => {
        document.removeEventListener('mouseup', colorSelector.up)
        document.removeEventListener('touchend', colorSelector.up)
        document.removeEventListener('mousemove', colorSelector.move)
        document.removeEventListener('touchmove', colorSelector.move)
        if (e.changedTouches) {
            e.x = e.changedTouches[0].pageX
        }
        colorSelector.moveData.c = e.x                                                // Положение курсора относительно страницы
        let x = (colorSelector.moveData.c - (colorSelector.moveData.b + colorSelector.moveData.a) - colorSelector.moveData.d)
        if (x < 1) { x = 1 }
        if (x > 721) { x = 721 }
        x = Number((x / 30).toFixed(0))
        userPreferences.backgroundColor = x
        colorslog+= x
        if (colorslog.endsWith('0202020202020')) {
            $('body').addClass('easteregg')
        }
        x = x * 30 + 1
        $('#page5_colorSelector > div').css('left', x + 'px')
    },
    down: (e) => {
        if (e.target.id == 'page5_colorSelector') {
            document.addEventListener('mouseup', colorSelector.up)
            document.addEventListener('touchend', colorSelector.up)
            document.addEventListener('mousemove', colorSelector.move)
            document.addEventListener('touchmove', colorSelector.move)
            colorSelector.moveData.a = $(e.target.parentElement).offset().left        // Положение родительского блока (section) относительно левого края 
            colorSelector.moveData.b = 70                                             // Padding с левой стороны section
            colorSelector.moveData.d = 15                                             // Половина ширины блока в колорселекторе
            colorSelector.move(e)
        }
    },
    moveData: {
        
    }
}

document.addEventListener('mousedown', colorSelector.down) 
document.addEventListener('touchstart', colorSelector.down) 

$('#input_page5_pcname')[0].addEventListener('keydown', (e) => {
    if (/[{}~\[\]\\|^':;<>=?@!"#$%`()+\/.,*&]/g.test(e.key)) {
        e.preventDefault()
        $('.errormessage').css('display', 'none')
        $('#page5 p.Str_513').css('display', 'block')
    }
})

$('#input_page8_username')[0].addEventListener('keydown', (e) => {
    if (e.key == "@") {
        e.preventDefault()
        $('.errormessage').css('display', 'none')
        $('#page8 p.Str_523').css('display', 'block')
    } else if (/[\"\/\\\[\]:|<>+=;,?*%]/g.test(e.key)) {
        e.preventDefault()
        $('.errormessage').css('display', 'none')
        $('#page8 p.Str_511').css('display', 'block')
    }
})

function checkPcName() {
    if ($('#input_page5_pcname').val() == null || $('#input_page5_pcname').val() == '') {
        $('.Str_686').css('display', 'block')
        return
    }
    userPreferences.pcName = $('#input_page5_pcname').val()

    goTo(6)
    $('#page5 p.Str_513').css('display', 'none')
    $('#page5 p.Str_687').css('display', 'block')
    $('#input_page5_pcname').prop('disabled', true)
}

function setupUserAccount() {
    goTo(7)
    setTimeout(() => {
        $('#page8 p.p1.Str_713').css('display', 'block')
        goTo(8)
    }, 1000);
}

function useLocalAccount() {
    $('#page8 .p1').css('display', 'none')
    $('#page8 .p2').css('display', 'block')
}

function completeSetup() {
    if ($('#input_page8_username').val() == null || $('#input_page8_username').val() == '') {
        $('.errormessage').css('display', 'none')
        $('.Str_715').css('display', 'block')
        return
    }
    if ($('#input_page8_password').val()) {
        // Password Check
        if ($('#input_page8_password').val() != $('#input_page8_passwordRetry').val()) {
            $('.errormessage').css('display', 'none')
            $('.Str_531').css('display', 'block')
            return
        }
        if ($('#input_page8_passwordHint').val() == null || $('#input_page8_passwordHint').val() == '') {
            $('.errormessage').css('display', 'none')
            $('.Str_716').css('display', 'block')
            return
        }
        userPreferences.password = $('#input_page8_password').val()
        userPreferences.passwordHint = $('#input_page8_passwordHint').val()
    }
    userPreferences.userName = $('#input_page8_username').val()

    goTo(9)
    setTimeout(() => {
        $('body').css('background-color', 'black')
        $('section').css('animation', 'fadeHideAnim 167ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards')
        //reg.writeKey('')
        setTimeout(() => {
            window.parent.postMessage({
                message: "eval",
                eval: `
                    (async()=>{
                        let a = (await oknared.createUser({
                            userName: "${userPreferences.userName}"
                        }));
                        await oknared.reg.writeKey('HKEY_LOCAL_MACHINE/SYSTEM/CurrentControlSet/Control/ComputerName/ActiveComputerName/ComputerName', 'REG_SZ', '${userPreferences.pcName}')
                        await oknared.reg.writeKey('HKEY_LOCAL_MACHINE/SYSTEM/Setup/Status/ChildCompletion/oobeldr.ore', 'REG_DWORD', 3);
                        oknared.task.create('/Windows/system32/oobe/FirstLogonAnim.ore', { 
                            args: [ JSON.stringify(a) ]
                        });
                        // setTimeout(() => {
                        //     window.location = "?run=true";
                        // }, 500);
                    })();
                `
            })
            exit()
        }, 500);
    }, 500);
}

function useStandartSettings() {
    userPreferences.lanDiscovery = true
    userPreferences.updateType = 2
    userPreferences.getDrivers = true
    userPreferences.getApps = true
    userPreferences.useSmartscreen = true
    userPreferences.sendDoNotTrack = true
    userPreferences.useErrorReporing = true
    userPreferences.useSupportListsIE = true
    userPreferences.sendMicrosoftLocation = false
    userPreferences.sendPcUseInfo = false
    userPreferences.sendHelpAppInfo = false
    userPreferences.useWindowsSearch = true
    userPreferences.loadPagesIE = true
    userPreferences.allowAppsToMyNameAndAvatar = true
    userPreferences.allowAppsToMyAdID = true
    userPreferences.allowLocationServices = true
    userPreferences.sendInfoToWindowsDefender = true
}


//DEBUG

let keylog = ""
document.addEventListener('keypress', (e) => {
    keylog+= e.key
    if (keylog.endsWith('debug')) {
        goTo(631)
    }
})