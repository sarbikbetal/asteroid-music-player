// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer, nativeImage } = require('electron');
const { Howl, Howler } = require('howler');
const jsmediatags = require('jsmediatags');

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


// Experimenytal code
const populate = (songs) => {
    songs.forEach(song => {
        var base64
        if (song.img) {
            base64 = "data:image/jpeg;base64," + window.btoa(song.img);
        } else {
            base64 = "./assets/headphones.svg"
        }
        var newNode = makeTemplate(`<div class="col s6 m3 l2">
        <div class="card">
          <div class="card-image"><img id="pic" src="${base64}" height="auto" width="100%"><a
              class="btn-floating halfway-fab waves-effect waves-light red"></a></div>
          <div class="card-content">
            <h6 class='truncate'>${song.title}</h6>
          </div>
        </div>
      </div>`)
        songView.appendChild(newNode);
        newNode.addEventListener("click", () => {
            playSong(song.url);
        })
    });
}

// We then iterate through each song and collect it's metadata
// musicFiles.forEach((song) => {
//     jsmediatags.read(song, {
//         onSuccess: (tag) => {
//             var image = tag.tags.picture;
//             var title = tag.tags.title;
//             var base64;
//             if (image) {
//                 // var pic = document.getElementById('picture')
//                 var base64String = "";
//                 for (var i = 0; i < image.data.length; i++) {
//                     base64String += String.fromCharCode(image.data[i]);
//                 }
//                 base64 = "data:image/jpeg;base64," + window.btoa(base64String);
//             } else {
//                 base64 = "assets/headphones.svg";
//             }
//             var newNode = makeTemplate(`<div class="col s6 m3 l2">
//             <div class="card">
//               <div class="card-image"><img id="pic" src="${base64}" height="auto" width="100%"><a
//                   class="btn-floating halfway-fab waves-effect waves-light red"></a></div>
//               <div class="card-content">
//                 <h6>${title}</h6>
//               </div>
//             </div>
//           </div>`)
//             allSongs.appendChild(newNode);
//             newNode.addEventListener("click", () => {
//                 playSong(song);
//             })
//         },
//         onError: (error) => {
//             console.log(':(', error.type, error.info);
//             console.log(song);
//         }
//     })
// });

// string to html node creating function
function makeTemplate(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}


// Howler js sound configs
var sound = new Howl({
    src: 'assets/placehold.mp3'
});
var nowPlaying = null;

// Music playback methods
function playSong(src) {
    sound.unload();
    sound = new Howl({
        src: src,
        html5: true
    })
    sound.on("load", () => {
        nowPlaying = sound.play();
        console.log(src + " playing");
    })
}
