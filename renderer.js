// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron');
const { Howl, Howler } = require('howler');
const StickyEvents = require('sticky-events').default;

var nowHowling = null // This is a howl object
var nowPlaying = null// This is my custom song object
var fullList = []
var timer

// Receives all the songs from Main Process
ipcRenderer.on('songs', (e, songs) => {
    var allSongs = songs;
    populate(allSongs);
})

// Important DOM nodes
var songView = document.getElementById('allSongs');
var playPause = document.getElementById('playPause');
var nextBtn = document.getElementById('nextBtn');
var prevBtn = document.getElementById('prevBtn');
var deckImg = document.getElementById('nowPlayingImg')
var trackTitle = document.getElementById('trackTitle')
var trackArtist = document.getElementById('trackArtist')
var vol = document.getElementById('volSlider')
var mute = document.getElementsByClassName('vol')[0].firstElementChild
var seekBar = document.getElementById('seekBar')
var clientBtn = document.getElementById('clientBtn')
var castBtn = document.getElementById('castBtn')

// Experimental code
const populate = (songs) => {
    var i = 0;
    songs.forEach(song => {
        var songObj = new Song(song)
        songObj.listId = i++
        var base64
        if (songObj.img) {
            base64 = "data:image/jpeg;base64," + window.btoa(songObj.img);
        } else {
            base64 = "./assets/headphones.svg"
        }
        var newNode = makeTemplate(`
        <div class="card horizontal waves-effect">
        <div class="card-image">
            <img src="${base64}">
        </div>
        <div class="card-stacked">
            <div class="card-content">
            <div class="row">
            <div class="col s4"><p class="truncate">${songObj.title}</p></div>
            <div class="col s3"><p class="truncate">${songObj.artist}</p></div>
            <div class="col s3"><p class="truncate">${songObj.album}</p></div>
            <div class="col s2"></div>
            </div>
            </div>
            </div>
        </div>`)
        newNode.addEventListener("click", () => {
            songObj.play();
        })
        songView.appendChild(newNode);
        fullList.push(songObj);
    });
    console.log(fullList);
}

// Volume control range slider


if (!localStorage.volume) {
    vol.value = 100;
} else {
    vol.value = localStorage.volume
}

vol.addEventListener('change', () => {
    if (vol.value != 0) {
        localStorage.setItem("volume", vol.value);
        if (mute.getAttribute('src') != './assets/buttons/volume_up.svg') {
            mute.setAttribute('src', './assets/buttons/volume_up.svg');
        }
    } else {
        mute.setAttribute('src', './assets/buttons/volume_off.svg');
    }
    if (nowHowling != null) {
        nowHowling.volume(vol.value / 100)
    }
})

mute.addEventListener('click', () => {
    if (vol.value != 0) {
        vol.value = 0;
        mute.setAttribute('src', './assets/buttons/volume_off.svg');
        if (nowHowling != null) { nowHowling.volume(0) }
    }
    else {
        vol.value = localStorage.volume;
        mute.setAttribute('src', './assets/buttons/volume_up.svg');
        if (nowHowling != null) { nowHowling.volume(vol.value / 100) }
    }
    mute = document.getElementsByClassName('vol')[0].firstElementChild;
})



// Handle click events on media playback buttons
playPause.addEventListener('click', () => {
    if (nowHowling) {
        if (nowHowling.playing()) {
            nowHowling.pause()
        } else {
            nowHowling.play()
        }
    } else {
        // M.toast({ html: '<span>Starting shuffle play</span>', classes: 'rounded center-align' });
    }
})

nextBtn.addEventListener('click', () => {
    if (nowPlaying.listId != fullList.length - 1) {
        fullList[nowPlaying.listId + 1].play()
    } else {
        M.toast({ html: '<span>End of playlist :(</span>', classes: 'rounded center-align' });
    }
})

prevBtn.addEventListener('click', () => {
    if (nowPlaying.listId != 0) {
        fullList[nowPlaying.listId - 1].play()
    } else {
        M.toast({ html: '<span>Nothing to play</span>', classes: 'rounded center-align' });
    }
})

// Seekbar(Progressbar)
seekBar.addEventListener('change', () => {
    var position = (seekBar.value / 100) * nowHowling.duration();
    nowHowling.seek(position);
    timer = setInterval(playProgress, 400)
})
seekBar.addEventListener('mousedown', (e) => {
    clearInterval(timer);
})

function playProgress() {
    if (nowHowling) {
        var played = (nowHowling.seek() / nowHowling.duration());
        var pixels = Math.round(played * 226);
        seekBar.value = Math.round(played * 100);
        document.documentElement.style.setProperty('--seekbar', `inset ${pixels}px 0px 0px 0px #18c76f`);
    }
}

// My custom song object
class Song {
    constructor(o) {
        this.filename = o.filename;
        this.title = (typeof o.title === 'string') ? o.title : o.filename;
        this.url = o.url;
        this.artist = (typeof o.artist === 'string') ? o.artist : "Unknown Artist";
        this.album = (typeof o.album === 'string') ? o.album : "Unknown Album";
        this.year = (typeof o.year === 'number') ? o.year : "--";
        this.img = o.img;
        this.listId = null;
    }
    play() {
        var self = this;
        Howler.unload();
        nowPlaying = self;
        nowHowling = new Howl({
            src: self.url,
            html5: true,
            volume: vol.value / 100,
            onload: function () {
                var albumArt
                if (self.img) {
                    albumArt = "data:image/jpeg;base64," + window.btoa(self.img);
                } else {
                    albumArt = "./assets/headphones.svg"
                }
                trackTitle.innerHTML = self.title
                trackArtist.innerHTML = self.artist
                deckImg.setAttribute('src', albumArt)
                if (localStorage.volume) {
                    nowHowling.volume(localStorage.volume / 100)
                }
                nowHowling.play();
            },
            onplay: function () {
                playPause.firstChild.setAttribute('src', './assets/buttons/pause.svg')
                timer = setInterval(playProgress, 400)
            },
            onpause: function () {
                playPause.firstChild.setAttribute('src', './assets/buttons/play_arrow.svg')
                clearInterval(timer)
            },
            onplayerror: function () {
                console.error('Error occured during playback');
            },
            onloaderror: function () {
                console.error('Error occured during loading');
            },
            onend: function () {
                clearInterval(timer)
                nowHowling.off()
                nowHowling.unload()
                nowHowling = null
                if (nowPlaying.listId != fullList.length - 1) {
                    fullList[nowPlaying.listId + 1].play()
                } else {
                    M.toast({ html: '<span>End of playlist :(</span>', classes: 'rounded center-align' });
                }
            }
        })
    }
};

// Playlist creation functions
function newPlaylist(songs) {
    var id = 0;
    songs.forEach((song) => {
        song.listId = id;
        id++;
    })
}

// string to html node creating function
function makeTemplate(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

// Create new StickyEvents instance
const stickyEvents = new StickyEvents({
    container: document.querySelector('.Middle'),
    stickySelector: '.list-heading'
});

// Add sticky event listeners
const { stickyElements } = stickyEvents;

stickyElements.forEach(sticky => {
    sticky.addEventListener(StickyEvents.STUCK, (event) => {
        sticky.classList.add('z-depth-2');
        sticky.classList.remove('z-depth-0');
    });
    sticky.addEventListener(StickyEvents.UNSTUCK, (event) => {
        sticky.classList.add('z-depth-0');
        sticky.classList.remove('z-depth-2');
    });
});





// //// Server functions //////////

// function broadcast() {
//     var http = require('http')
//     var fs = require('fs')

//     var server = http.createServer(function (request, response) {
//         if (nowPlaying != null) {
//             var stat = fs.statSync(nowPlaying.url);
//             response.writeHead(200, {
//                 'Access-Control-Allow-Origin': '*',
//                 'Access-Control-Allow-Methods': 'GET',
//                 'Content-Type': 'audio/mpeg',
//                 'Content-Length': stat.size
//             });
//             fs.createReadStream(nowPlaying.url).pipe(response);
//         }
//     }).listen(2000);


//     var socketServer = http.createServer().listen(2415)
//     const io = require('socket.io')(socketServer);
//     io.on('connect', client => {
//         console.log('client connected');

//         client.on('loaded', (time) => {
//             var now = nowHowling.seek();
//             time(now);
//             console.log(`Song loaded by client and synced to ${now}`);
//         })
//     });
// }

// ///////   Cast & Client button event listener /////
// clientBtn.addEventListener('click', () => {
//     ipcRenderer.send('loadClient');
// })
// castBtn.addEventListener('click', () => {
//     broadcast()
//     console.log('Starting broadcast');
// })