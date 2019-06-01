const { Howl, Howler } = require('howler');


var playPause = document.getElementById('playPause')
var deckImg = document.getElementById('nowPlayingImg')
var trackTitle = document.getElementById('trackTitle')

var sound
var state = new Object({
    isPlaying: false,
    id: null,
    duration: 0
})
class Song {
    constructor(o) {
        this.filename = o.filename
        this.title = (typeof o.title === 'string') ? o.title : o.filename;
        this.url = o.url;
        this.artist = (typeof o.artist === 'string') ? o.artist : "Unknown Artist";
        this.album = (typeof o.album === 'string') ? o.album : "Unknown Album";
        this.year = (typeof o.year === 'number') ? o.year : "--";
        this.img = o.img;
    }

    play() {
        Howler.unload();
        sound = new Howl({
            src: this.url,
            html5: true
        })
        sound.on("load", () => {
            var albumArt
            if (this.img) {
                albumArt = "data:image/jpeg;base64," + window.btoa(this.img);
            } else {
                albumArt = "./assets/headphones.svg"
            }
            trackTitle.innerHTML = this.title
            deckImg.setAttribute('src', albumArt)
            state.id = sound.play();
            state.duration = sound.duration();
            console.log(sound);
        })
        sound.on('play', () => {
            state.isPlaying = true
            playPause.firstChild.setAttribute('src','./assets/buttons/pause.svg')
        })
        sound.on('pause', () => {
            state.isPlaying = false
            playPause.firstChild.setAttribute('src','./assets/buttons/play_arrow.svg')
        })
    }

    pause() {
        sound.pause();
    }
    resume(){
        sound.play();
    }
};


module.exports.Song = Song;
module.exports.nowPlaying = function () {
    return state;
}