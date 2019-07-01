const { ipcRenderer } = require('electron')
const { Howl, Howler } = require('howler');
const io = require('socket.io-client')

console.log("This is the client renderer process");
console.log(`${process.type}:${process.pid}`);

var socket;

document.getElementById('check').addEventListener('click', connect)

function connect() {
    var ip = document.getElementById('ip').value;
    var sound = null;//Howler sound

    socket = io(`http://${ip}:2415`);

    socket.on('connect_error', (error) => {
        console.log(error);

        // M.toast({ html: `<span>${error}</span>`, classes: 'rounded center-align' });
    });
    socket.on('error', (error) => {
        console.log(error);
        // M.toast({ html: `<span>${error}</span>`, classes: 'rounded center-align' });
    });

    socket.on('connect', () => {
        sound = loadSong();
        console.log(`connected to socket io server`);
    });

    socket.on('disconnect', () => {
        if (sound) {
            sound.stop()
        }
        console.log("Disconnected from server");
        disconnect();
    })

    socket.on('sync', (data) => {
        console.log(data);
        var time = data.progress + ((Date.now() - data.time) * 0.001)
        sound.seek(time);
        sound.play();
    });


    socket.on('change', () => {
        console.log('song changed');
        sound = null;
        sound = loadSong();
    })

    function loadSong() {
        Howler.unload();
        if (sound) sound.unload()
        var sound = new Howl({
            src: `http://${ip}:2416`,
            format: 'mp3',
            html5: true,
            onloaderror: function (id, err) {
                console.log(err);
            },
            onload: function () {
                console.log('Song loaded from localhost');
                socket.emit('loaded');
            }
        });
        console.log(sound);

        return sound;
    }
    document.getElementById('check').setAttribute('src', '../assets/buttons/close.svg');
    document.getElementById('check').removeEventListener('click', connect);
    document.getElementById('check').addEventListener('click', disconnect);
}

function disconnect() {
    Howler.unload();
    socket.close();
    document.getElementById('check').setAttribute('src', '../assets/buttons/check.svg');
    document.getElementById('check').removeEventListener('click', disconnect);
    document.getElementById('check').addEventListener('click', connect);
}

///////////////////////////    Button action event listeners    /////////////////////////////
document.getElementById('homeBtn').addEventListener('click', () => {
    ipcRenderer.send('loadHost');
})
M.Tooltip.init(document.querySelectorAll('.uiIcon'), { position: 'bottom', margin: 2, transitionMovement: 8, exitDelay: 50 })
