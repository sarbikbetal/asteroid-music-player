module.exports = [{
    label: 'Weather App',
    submenu: [{
        label: 'Item 1'
    }, {
        label: 'Item 2'
    }]
}, {
    label: 'Main Menu 2',
    submenu: [{
        label: 'Item 1'
    }, {
        label: 'Item 2',
        submenu: [{
            label: 'Tada',
            click: ()=>{
                console.log('tada')
            },
            accelerator: 'CommandOrControl+D'
        }, {
            label: 'Item 2'
        }]
    }]
}]