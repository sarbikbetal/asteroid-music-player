const { ipcRenderer } = require('electron');
const { Howl, Howler } = require('howler');
const StickyEvents = require('sticky-events').default;
const jsmediatags = require('jsmediatags');
const fs = require('fs');

console.log("This is the mainview renderer process");
console.log(`${process.type}:${process.pid}`);

var nowHowling = null // This is a howl object
var nowPlaying = null// This is my custom song object
var fullList = []
var timer

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
var drawer = document.getElementById('drawer')


/////////////////////// Receives all the songs from Main Process  ///////////////////////////
ipcRenderer.on('songs', (e, songs) => {
    var path = require('path');

    if (songs.length) {
        songView.innerHTML = '<div class="progress"><div class="indeterminate"></div></div><div class="container center-align"><h3>Hold on, we are adding your music</h3><h4>Parsing music metadata...</h4></div>';
    } else {
        songView.innerHTML = ' <div class="container center-align"><h3>Seems like we are not in the right path</h3><h4>Come on, add some Music Directory in settings</h4></div>'
    }

    var dirs = new Set()
    songs.forEach((song) => { dirs.add(path.dirname(song)) })
    dirs = Array.from(dirs)

    let added = [];
    let deleted = [];
    let existing = JSON.parse(localStorage.getItem('urls')) || [];
    let modified = [];

    songs.forEach((song) => {
        if (!existing.includes(song)) {
            added.push(song)
        }
    })

    window.syncforeach(existing, (next, url, index, arr) => {
        if (index < arr.length) {
            fs.access(url, fs.F_OK, (err) => {
                if (err || !dirs.includes(path.dirname(url))) {
                    deleted.push(existing[index])
                    next()
                } else {
                    modified.push(existing[index])
                    next()
                }
            })
        }
    }).done(() => {
        console.log("File URLs Checked");
        modified = modified.concat(added);
        localStorage.setItem('urls', JSON.stringify(modified));
        cacheSongs(added, deleted);
    })



    // let request = indexedDB.open('library', 1),
    //     db,
    //     tx,
    //     store

    // request.onerror = (e) => { console.log(e.target.errorCode); }

    // request.onsuccess = (e) => {
    //     db = request.result;

    //     db.onerror = (e) => {
    //         console.log("Error:" + e.target.errorCode);
    //     }

    // songs.forEach((song) => {
    //     jsmediatags.read(song, {
    //         onSuccess: (tag) => {
    //             var image = tag.tags.picture;
    //             var smallImg;
    //             if (image) {
    //                 var base64String = "";
    //                 for (var i = 0; i < image.data.length; i++) {
    //                     base64String += String.fromCharCode(image.data[i]);
    //                 }
    //                 smallImg = base64String
    //             } else {
    //                 smallImg = null
    //             }
    //             var sound = new Song({
    //                 filename: path.basename(song),
    //                 title: tag.tags.title,
    //                 url: song,
    //                 artist: tag.tags.artist,
    //                 album: tag.tags.album,
    //                 img: smallImg
    //             });
    //             populate(sound);

    //             // tx = db.transaction("songs", "readwrite");
    //             // store = tx.objectStore("songs");
    //             // store.add(sound);
    //         },
    //         onError: (error) => {
    //             console.error(':(', error.type, error.info, song);
    //             var sound = new Song({
    //                 filename: path.basename(song),
    //                 url: song
    //             });
    //             populate(sound);
    //             // tx = db.transaction("songs", "readwrite");
    //             // store = tx.objectStore("songs");
    //             // store.add(sound);
    //         }
    //     });
    // });

    // }

    // request.onupgradeneeded = (e) => {
    //     let db = request.result,
    //         store = db.createObjectStore('songs', { keyPath: 'url' })
    // }
})

function cacheSongs(add, remove) {
    var path = require('path');

    let songDB = JSON.parse(localStorage.getItem('songObjs')) || [];
    let modified = [];

    syncforeach(songDB, (next, song, index, array) => {
        if (!remove.includes(song.url)) {
            modified.push(song)
        }
        next()
    }).done(() => {
        syncforeach(add, (next, song, index, array) => {
            jsmediatags.read(song, {
                onSuccess: (tag) => {
                    // var image = tag.tags.picture;
                    var smallImg;
                    // if (image) {
                    //     var base64String = "";
                    //     for (var i = 0; i < image.data.length; i++) {
                    //         base64String += String.fromCharCode(image.data[i]);
                    //     }
                    //     smallImg = base64String
                    // } else {
                    //     smallImg = null
                    // }
                    var sound = new Song({
                        filename: path.basename(song),
                        title: tag.tags.title,
                        url: song,
                        artist: tag.tags.artist,
                        album: tag.tags.album,
                        img: smallImg
                    });
                    // populate(sound);
                    modified.push(sound);
                    next();
                },
                onError: (error) => {
                    console.error(':(', error.type, error.info, song);
                    var sound = new Song({
                        filename: path.basename(song),
                        url: song
                    });
                    // populate(sound);
                    modified.push(sound)
                    next();
                }
            });
        }).done(() => {
            console.log("Metadata Parsing Completed");
            fullList = modified
            localStorage.setItem('songObjs', JSON.stringify(modified));
            populate();
        });
    })
}

///////////   Cast the received objects into Song object /////////////// 
const populate = (param) => {

    let songDB = JSON.parse(localStorage.getItem('songObjs'))

    if (songDB.length) {
        songView.innerHTML = '<div class="progress"><div class="indeterminate"></div></div><div class="container center-align"><h3>Hold on, we are adding your music</h3><h4>Arranging your music library...</h4></div>';
    }

    songDB.sort((a, b) => {
        if (param == 'artist') { var s1 = a.artist.toLowerCase(), s2 = b.artist.toLowerCase() }
        else if (param == 'album') { var s1 = a.album.toLowerCase(), s2 = b.album.toLowerCase() }
        else var s1 = a.title.toLowerCase(), s2 = b.title.toLowerCase()

        if (s1 < s2)
            return -1
        if (s1 > s2)
            return 1
        return 0
    })
    if (songDB.length) {
        songView.innerHTML = '';
    }

    var i = 0;

    songDB.forEach((song) => {
        song.listId = i++
        var base64 = "./assets/headphones.svg"
        // if (songObj.img) {
        //     base64 = "data:image/jpeg;base64," + window.btoa(songObj.img);
        // } else {
        //     base64 = "./assets/headphones.svg"
        // }
        var newNode = makeTemplate(`
            <div class="card horizontal waves-effect">
            <div class="card-image">
                <img src="${base64}">
            </div>
            <div class="card-stacked">
                <div class="card-content">
                <div class="row">
                <div class="col s5"><p class="truncate">${song.title}</p></div>
                <div class="col s4"><p class="truncate">${song.artist}</p></div>
                <div class="col s3"><p class="truncate">${song.album}</p></div>
                </div>
                </div>
                </div>
            </div>`)
        newNode.addEventListener("click", () => {
            playNow(song)
        })

        songView.appendChild(newNode);
    })
    localStorage.setItem('songObjs', JSON.stringify(songDB))
}

////////////////   Song sorting function //////////////////////
M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), { coverTrigger: false });

document.querySelectorAll('.sortby').forEach((type) => {
    type.addEventListener('click', () => {
        populate(type.firstElementChild.getAttribute('value'));
    })
})

////////////////   Volume control range slider   //////////////////////////

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



/////////////////  Handle click events on media playback buttons /////////////////////////
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
        playNow(fullList[nowPlaying.listId + 1])
    } else {
        M.toast({ html: '<span>End of playlist :(</span>', classes: 'rounded center-align' });
    }
})

prevBtn.addEventListener('click', () => {
    if (nowPlaying.listId != 0) {
        playNow(fullList[nowPlaying.listId - 1])
    } else {
        M.toast({ html: '<span>Nothing to play</span>', classes: 'rounded center-align' });
    }
})

///////////////////////////// Seekbar(Progressbar)   /////////////////////////////
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

////////////////////////////  Right Navigation drawer ///////////////////////
drawer.addEventListener('click', () => {
    var open = drawer.toggleAttribute('open');
    if (open != false) {
        document.documentElement.style.setProperty('--mid-width', 'calc(100vw - 425px)');
        document.documentElement.style.setProperty('--right-pos', '0px');
        document.documentElement.style.setProperty('--drawer', '-180deg');
    } else {
        document.documentElement.style.setProperty('--mid-width', 'calc(100vwte id.  - 250px)');
        document.documentElement.style.setProperty('--right-pos', '-180px');
        document.documentElement.style.setProperty('--drawer', '0deg');
    }
});








//////////////////////////////////////////////////////////////////////////////
/////////////////////      My custom song object   ///////////////////////////
//////////////////////////////////////////////////////////////////////////////

class Song {
    constructor(o) {
        this.filename = o.filename;
        this.title = (typeof o.title === 'string') ? o.title : o.filename;
        this.url = o.url;
        this.artist = (typeof o.artist === 'string') ? o.artist : "Unknown Artist";
        this.album = (typeof o.album === 'string') ? o.album : "Unknown Album";
        this.year = (typeof o.year === 'number') ? o.year : "--";
        this.img = o.img || null;
        this.listId = null;
    }
};

//////////////////////  Play the Song (Aaaahhhhhh!!! Finally)  ///////////////////////
function playNow(song) {
    Howler.unload();
    nowPlaying = song;
    nowHowling = new Howl({
        src: song.url,
        html5: true,
        volume: vol.value / 100,
        onload: function () {
            jsmediatags.read(song.url, {
                onSuccess: (tag) => {
                    var image = tag.tags.picture;
                    if (image) {
                        var base64String = "";
                        for (var i = 0; i < image.data.length; i++) {
                            base64String += String.fromCharCode(image.data[i]);
                        }
                        albumArt = "data:" + image.format + ";base64," + window.btoa(base64String);
                    } else {
                        albumArt = "./assets/headphones.svg"
                    }
                    deckImg.setAttribute('src', albumArt)
                },
                onError: () => {
                    deckImg.setAttribute('src', "./assets/headphones.svg")
                }
            });
            trackTitle.innerHTML = song.title
            trackArtist.innerHTML = song.artist
            if (localStorage.volume) {
                nowHowling.volume(localStorage.volume / 100)
            }
            nowHowling.play();
        },
        onplay: function () {
            playPause.firstElementChild.setAttribute('src', './assets/buttons/pause.svg')
            timer = setInterval(playProgress, 400)
        },
        onpause: function () {
            playPause.firstElementChild.setAttribute('src', './assets/buttons/play_arrow.svg')
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
                playNow(fullList[nowPlaying.listId + 1])
            } else {
                M.toast({ html: '<span>End of playlist :(</span>', classes: 'rounded center-align' });
            }
        }
    })
}



////////////////////// Playlist creation functions ////////////////////
function newPlaylist(songs) {
    var id = 0;
    songs.forEach((song) => {
        song.listId = id;
        id++;
    })
}

////////////// string to html node creating function  ///////////////////
function makeTemplate(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}


//////////////////////// sticky event listeners ////////////////////////////////

const stickyEvents = new StickyEvents({
    container: document.querySelector('.Middle'),
    stickySelector: '.list-heading'
});

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



//////////////////////// Server functions ////////////////////////////

function broadcast() {
    var http = require('http')
    var ip = require('ip')

    var server = http.createServer(function (req, res) {
        if (nowPlaying != null) {
            var filePath = nowPlaying.url;
            var stat = fs.statSync(filePath);
            var total = stat.size;
            if (req.headers.range) {
                var range = req.headers.range;
                var parts = range.replace(/bytes=/, "").split("-");
                var partialstart = parts[0];
                var partialend = parts[1];
                var start = parseInt(partialstart, 10);
                var end = partialend ? parseInt(partialend, 10) : total - 1;
                var chunksize = (end - start) + 1;
                var readStream = fs.createReadStream(filePath, { start: start, end: end });
                res.writeHead(206, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
                    'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
                    'Content-Type': 'audio/mpeg'
                });
                readStream.pipe(res);
            } else {
                res.writeHead(200, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Content-Length': total,
                    'Content-Type': 'audio/mpeg'
                });
                fs.createReadStream(filePath).pipe(res);
            }
        }
    }).listen(2000);

    ///////////////// Socket.io server ////////////////////////////
    var clients = []
    var socketServer = http.createServer().listen(2415)
    const io = require('socket.io')(socketServer);
    io.on('connect', client => {
        clients.push(client)
        console.log('client connected');
        client.on('loaded', () => {
            var now = nowHowling.seek();
            io.emit('sync', now)
            // time(now);
            console.log(`Song loaded by client and synced to ${now}`);
        })
    });


    console.log('Broadcasting on ' + ip.address() + ':2000');
    castBtn.firstElementChild.setAttribute('src', './assets/buttons/broadcast.svg');
    castBtn.style.setProperty('flex-grow',1);
    castBtn.style.setProperty('background-color','#fff');
    castBtn.appendChild(makeTemplate(`<span>${ip.address()}:2000</span>`))
    castBtn.setAttribute('data-tooltip', `Stop broadcast`);
    castBtn.removeEventListener('click', broadcast);
    castBtn.addEventListener('click', stopCast);

    ///////////////////////// Stop the servers ///////////////////////////

    function stopCast() {
        clients.forEach((client) => {
            client.disconnect(true)
        })
        io.close()
        socketServer.close()
        server.close()
      
        console.log("Servers stopped");
      
        castBtn.firstElementChild.setAttribute('src', './assets/buttons/broadcast_off.svg')
        castBtn.removeEventListener('click', stopCast);
        castBtn.addEventListener('click', broadcast);
        castBtn.setAttribute('data-tooltip', "Start broadcast")
        castBtn.style.setProperty('flex-grow',0);
        castBtn.style.setProperty('background-color','#00000000');
        castBtn.querySelector('span').remove();
    }

}

////////////////////////// Tooltips for buttons ////////////////////////////////////////////
M.Tooltip.init(document.querySelectorAll('.uiIcon'), { position: 'bottom', margin: 2, transitionMovement: 8, exitDelay: 50 })
M.Tooltip.init(document.querySelectorAll('#sort'), { position: 'bottom', margin: 2, transitionMovement: 8, exitDelay: 50 })

//////////////////////////   Broadcast & Client button event listener ///////////////////////

clientBtn.addEventListener('click', () => {
    ipcRenderer.send('loadClient');
})
castBtn.addEventListener('click', broadcast)

/////////////////////////    Settings button       /////////////////////////////////

/// Directory settings ///
M.Modal.init(document.querySelectorAll('.modal'), { opacity: 0.8 });


document.getElementById('FileUpload').addEventListener('change', (e) => { selectFolder(e) })
document.getElementById('saveSettings').addEventListener('click', saveSettings)


var json; // This is the config.json File object// 

function makeDirList(dir) {
    let node = makeTemplate(`<li class="collection-item dirs"><div>${dir}<a class="secondary-content waves-effect"><img src="./assets/buttons/close.svg"></a></div></li>`);
    document.getElementById('selectedDirs').appendChild(node);
    let btn = document.querySelectorAll('.dirs a')[document.querySelectorAll('.dirs a').length - 1]
    btn.addEventListener('click', () => {
        btn.parentElement.parentNode.remove();
        json.directories.splice(json.directories.indexOf(dir), 1);
    })
}

function selectFolder(e) {
    json.directories.push(e.target.files[0].path);
    makeDirList(e.target.files[0].path)
};

document.getElementById('settings').addEventListener('click', () => {
    fs.readFile('./assets/config.json', (err, data) => {
        if (err) throw err;
        document.querySelectorAll('.dirs').forEach((node) => {
            node.remove();
        })
        json = JSON.parse(data);
        json.directories.forEach((dir) => {
            makeDirList(dir);
        })
    });
})



function saveSettings() {
    var dirs = new Set()
    json.directories.forEach((dir) => { dirs.add(dir) })
    json.directories = Array.from(dirs)
    fs.writeFile('./assets/config.json', JSON.stringify(json), (err) => {
        if (err) throw err;
        ipcRenderer.send('config');
    });
};
