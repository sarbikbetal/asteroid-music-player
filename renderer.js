// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron');
const { Howl, Howler } = require('howler');
const StickyEvents = require('sticky-events').default;


var nowHowling = null // This is a howl object
var nowPlaying // This is my custom song object
var fullList = [];

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
var mute = document.getElementsByClassName('vol')[0].firstElementChild;

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

// var volUp = document.getElementsByClassName('vol')[1].firstElementChild;

if (!localStorage.volume) {
    vol.value = 100;
} else {
    vol.value = localStorage.volume
}

vol.addEventListener('change', () => {
    if (vol.value != 0) {
        localStorage.setItem("volume", vol.value);
    }
    if (nowHowling != null) {
        nowHowling.volume(vol.value / 100)
    }
})
// volUp.addEventListener('click',()=>{
//     console.log("Volumeup");
// })
mute.addEventListener('click', () => {
    if (vol.value != 0) {
        vol.value = 0;
        mute.setAttribute('src','./assets/buttons/volume_off.svg');
        if (nowHowling != null) {nowHowling.mute(true)}
    }
    else {
        vol.value = localStorage.volume;
        mute.setAttribute('src','./assets/buttons/volume_up.svg');
        if (nowHowling != null) {nowHowling.mute(false)}
    }
    mute = document.getElementsByClassName('vol')[0].firstElementChild;
})



// Handle click events on media playback buttons
playPause.addEventListener('click', () => {
    if (nowHowling.playing()) {
        nowHowling.pause()
    } else {
        nowHowling.play()
    }
})

nextBtn.addEventListener('click', () => {
    if (nowPlaying.listId != fullList.length - 1) {
        fullList[nowPlaying.listId + 1].play()
    } else {
        //code for toast
    }
})

prevBtn.addEventListener('click', () => {
    if (nowPlaying.listId != 0) {
        fullList[nowPlaying.listId - 1].play()
    } else {
        //code for toast
    }
})

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
            volume: vol.value/100,
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
            },
            onpause: function () {
                playPause.firstChild.setAttribute('src', './assets/buttons/play_arrow.svg')
            },
            onplayerror: function () {
                console.log('Error occured during playback');
            },
            onend: function () {
                nowHowling.off();
                nowHowling.unload();
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