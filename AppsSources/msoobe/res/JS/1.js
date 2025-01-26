$('*').each((index, elem) => {
    if (elem.className.startsWith('Str_')) {
        let string = elem.className.split(' ')[0].split('_')[1]
        $(elem).html(getRes('String/' + string).replaceAll('&', '').replaceAll('\n', '<br/>'))
    } else if (String($(elem).attr('placeholder')).startsWith('Str_')) {
        let string = $(elem).attr('placeholder').split('_')[1]
        $(elem).attr('placeholder', (getRes('String/' + string).replaceAll('&', '')))
    }
});

setTimeout(async () => {
    $('#page5 > .colorSelector').css('background', 'url(\'data:image/png;base64,' + await getResFromFile('/Windows/system32/imageres.el', 'IMAGE/4804') + '\')')
    $('#page5 > .colorSelector > div').css('background', 'url(\'data:image/png;base64,' + await getResFromFile('/Windows/system32/imageres.el', 'IMAGE/4805') + '\')')
}, 1);