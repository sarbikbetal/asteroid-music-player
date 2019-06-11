const { Howl, Howler } = require('howler');
const io = require('socket.io-client')

console.log("This is the client renderer process");
console.log(process.pid);


var sound;
var socket = io('http://localhost:2415');

socket.on('connect', () => {
    // sound.seek(data);
    // sound.play()
    // console.log(`Playback continued from ${data}`);
    loadSong()
    console.log(`connected to socket io server`);
});

// socket.on('time', function (data) {
//     console.log(data);
//     console.log('syncing to ' + data);

// });

function loadSong() {
    sound = new Howl({
        src: 'http://localhost:2000',
        format: 'mp3',
        html5: true,
        onloaderror: function (id, err) {
            console.log(err);
        },
        onload: function () {
            console.log('Song loaded from localhost');
            socket.emit('loaded', (data) => {
                console.log(data);
                sound.play();
                sound.seek(data);
            });
        }
    });
}

var acd = new Howl()