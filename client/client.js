const { Howl, Howler } = require('howler');

console.log("This is the client renderer process");


// var socket = io('http://localhost:2000');

// var sound;

// socket.on('connect', function (data) {
//     sound = new WaudSound('http://localhost:2000', {
//         autoplay: false,
//         onerror: function (a, b, c) {
//             console.log(a, b, c);

//         }
//     });
//     sound.play()
//     console.log('connected to localhost', sound);
// });

// socket.on('time', function (data) {
//     console.log('syncing to ' + data);
//     sound.seek(data);
// });