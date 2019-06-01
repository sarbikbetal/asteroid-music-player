// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron');
const { Song, nowPlaying } = require('./assets/song');
const StickyEvents = require('sticky-events').default;

var currentSong = new Song({})


var allSongs;

ipcRenderer.on('songs', (e, songs) => {
    allSongs = songs;
    populate(allSongs);
    console.log(allSongs);
})

// This is the array of the returned absolute paths of the music files
// var musicFiles = walkSync(__dirname + "/search")
// console.log(musicFiles)


// Important DOM nodes
var songView = document.getElementById('allSongs');
var playPause = document.getElementById('playPause');
var nextBtn = document.getElementById('nextBtn');
var prevBtn = document.getElementById('prevBtn');

// Experimental code
const populate = (songs) => {
    songs.forEach(song => {
        var songObj = new Song(song)
        var base64
        if (song.img) {
            base64 = "data:image/jpeg;base64," + window.btoa(song.img);
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
            <div class="col s4"><p class="truncate">${song.title}</p></div>
            <div class="col s3"><p class="truncate">${song.artist}</p></div>
            <div class="col s3"><p class="truncate">${song.album}</p></div>
            <div class="col s2"></div>
            </div>
            </div>
            </div>
        </div>`)
        newNode.addEventListener("click", () => {
            songObj.play();
            currentSong = songObj;
        })
        songView.appendChild(newNode);
        // songView.appendChild(makeTemplate(''));
    });
}

// Handle click events on media playback buttons
playPause.addEventListener('click', () => {
    if (nowPlaying().isPlaying) {
        currentSong.pause()
    } else {
        currentSong.resume()
    }
    console.log(nowPlaying());
})

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

// Add event listeners

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
