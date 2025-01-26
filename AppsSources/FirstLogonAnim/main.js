async function main(args){
    const file = await fs.readFile('/Windows/system32/oobe/FirstLogonAnim.html');
    const win = await dwm.create({
        content: file,
        args: {},
        windowConfig: {
            width: '100vw',
            height: '100vh',
            top: '0',
            left: '0',
            frame: false,
            resizable: false,
            zIndex: 99000,
            title: getResFromFile('/Windows/system32/oobe/msoobeFirstLogonAnim.el', 'String/1001'),
            animation: "none"
        },
    });
    setTimeout(async () => {
        win.sendMessage('eval', {eval: `
            $('#finish_text').html('${await getResFromFile('/Windows/system32/oobe/msoobeFirstLogonAnim.el', 'String/1025')}')
            $('#final_message_text1').html('${await getResFromFile('/Windows/system32/oobe/msoobeFirstLogonAnim.el', 'String/1100')}')
            $('#sub_final_message_text1').html('${await getResFromFile('/Windows/system32/oobe/msoobeFirstLogonAnim.el', 'String/1110')}')
            $('#final_message_text2').html('${await getResFromFile('/Windows/system32/oobe/msoobeFirstLogonAnim.el', 'String/1102')}')
            $('#sub_final_message_text2').html('${await getResFromFile('/Windows/system32/oobe/msoobeFirstLogonAnim.el', 'String/1101')}')
            $('#final_message_text3').html('${await getResFromFile('/Windows/system32/oobe/msoobeFirstLogonAnim.el', 'String/1101')}')

            init();
            steps = 1200;
            initEndSequence();
            initEndSequenceMessagesOverlay();
            setUserColor('rgb(24,0,82)', 'rgb(70,23,180)');

            setTimeout(startAnimation(), 5000);
        `});

        console.log(args);
        if(args[0] == 'prepareuser') {
            let newusrpath = '/Users/' + args[3];
            fs.copyDirectory('/Users/Default', newusrpath);
            await oknared.reg.writeKey('HKEY_LOCAL_MACHINE/SOFTWARE/Microsoft/Windows NT/CurrentVersion/ProfileList/' + args[1] + '/ProfileImagePath', 'REG_EXPAND_SZ', newusrpath);
            setTimeout(() => {
                setTimeout(async () => {
                    await task.create('/Windows/explorer.ore', {
                        user: {
                            sid: args[1],
                            rid: args[2],
                            name: args[3],
                        },
                        args: ['desktop']
                    });
                    $('#WindowFrame_'+data.wid)[0].contentWindow.postMessage({
                        'message': 'eval',
                        'eval': `
                            endAnimation()
                        `
                    });
                    setTimeout(win.close, 5000);
                }, 500);
            }, 500);
        }
    }, 500);
    
    await win.waitForClose();
}