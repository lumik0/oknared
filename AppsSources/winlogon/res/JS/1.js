(async()=>{
    let wallpaper = await fs.readFileBin('/Windows/Web/Screen/img100.jpg')
    $('.lockscreenOverlay').css('background-image', 'url("' + wallpaper + '")')
    setTimeout(() => {
        $('.blackOverlay').css('animation', 'fadeHideAnim 0.5s cubic-bezier(0.1, 0.9, 0.2, 1) forwards')
        setTimeout(() => {
            $('.blackOverlay').css('display', 'none')
        }, 500)
    }, 500)

    window.hideLockOverlay = () => {
        $('.lockscreenOverlay').css('animation', 'lockOverlayHideAnim 2s cubic-bezier(0.1, 0.9, 0.2, 1)')
        setTimeout(() => {
            $('.lockscreenOverlay').addClass('hidden')
        }, 800)
    }

    window.showLockOverlay = () => {
        $('.lockscreenOverlay').removeClass('hidden')
        $('.lockscreenOverlay').css('animation', 'none')
    }

    window.updateUserList = async () => {
        let a = (await reg.readHive('HKEY_LOCAL_MACHINE/SAM/SAM/Domains/Account/Users')).hives
        a.splice(a.indexOf('Names'), 1)
        let b = (await reg.readHive('HKEY_LOCAL_MACHINE/SAM/SAM/Domains/Account/Users/Names')).hives
        let d = {}
        window.usersListByRid = {}
        for await(let elem of b) {
            let c = await reg.readKey('HKEY_LOCAL_MACHINE/SAM/SAM/Domains/Account/Users/Names/' + elem + '/@')
            usersListByRid[parseInt(c.type.replace('0x', ''), 16)] = elem
            d[elem] = parseInt(c.type.replace('0x', ''), 16)
        }
        window.userNames = Object.keys(d)
        $('.userAccountList').html('');
        for await(let elem of userNames) {
            if(d[elem] > 1000) {
                $('.userAccountList').append(`
                    <div class="elem" onclick="loginTo(${d[elem]})">
                        <img src="${await fs.readFileBin('/ProgramData/Microsoft/User Account Pictures/user-200.png')}">
                        <p>${elem}</p>
                    </div>
                `)
            }
        }
        window.usersList = d
    }

    window.loginTo = async(userRid, usrSid, username) => {
        let userSid;
        if(usrSid) {
            userSid = usrSid;
        } else {
            userSid = 'S-1-5-21-0000000000-00000000-0000000000-' + userRid;
        }

        // Применение пользовательских настроек

        let userpersonalsettings = {}

        // ************************************

        if((await reg.readHive('HKEY_LOCAL_MACHINE/SOFTWARE/Microsoft/Windows NT/CurrentVersion/ProfileList')).hives.indexOf(userSid) == -1) {
            window.parent.postMessage({
                message: 'eval',
                eval: `
                    oknared.task.create('/Windows/system32/oobe/FirstLogonAnim.ore', {
                        args: ['prepareuser', '${userSid}', '${userRid}', '${usersListByRid[userRid]}'],
                    });
                    // console.log($('#WindowContainer_${wid}').css('display', 'none'))
                `,
            });
        } else {
            userpersonalsettings.color = (await reg.readKey('HKEY_USERS/' + userSid + '/Software/Microsoft/Windows/DWM/ColorizationColor')).data;
            console.log(userpersonalsettings.color);
            window.parent.postMessage({
                message: 'eval',
                eval: `
                    $('body').append(\`
                        <style class="WinLogonStyles UserPersonalStyles">
                            .WindowContainer {
                                --winColor: #${userpersonalsettings.color.slice(4, 10)}
                            }
                        </style>
                    \`)
                    
                    oknared.task.create('/Windows/explorer.ore', {
                        user: {
                            sid: '${userSid}',
                            rid: '${userRid}',
                            name: '${usersListByRid[userRid]}',
                        },
                        args: ['desktop'],
                    });
                    $('#WindowContainer_${wid}').css('display', 'none')
                `,
            });
        }
    }

    $('.lockscreenOverlay')[0].addEventListener('click', hideLockOverlay)
    document.addEventListener('keydown', (e) => {
        if(e.key == 'Space') hideLockOverlay()
    })

    updateUserList()
})();