const { ipcRenderer, remote } = require('electron');
const fs = require('fs');
const jsmediatags = require('jsmediatags');

console.log(`${process.type}:${process.pid}`);

document.getElementById('close').addEventListener('click', () => {
    remote.getCurrentWindow().close();
})


/////////////////////// Receives all the songs from Main Process  ///////////////////////////
ipcRenderer.on('songs', (e, songs) => {

    var path = require('path');


    // ////////////////// Preloader

    // if (songs.length) {
    //     songView.innerHTML = '<div class="progress"><div class="indeterminate"></div></div><div class="container center-align"><h3>Hold on, we are adding your music</h3><h4>Parsing music metadata...</h4></div>';
    // } else {
    //     songView.innerHTML = ' <div class="container center-align"><h3>Seems like we are not in the right path</h3><h4>Come on, add some Music Directory in settings</h4></div>'
    // }

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
                    var smallImg = null;
                    // if (image) {
                    //     var base64String = "";
                    //     for (var i = 0; i < image.data.length; i++) {
                    //         base64String += String.fromCharCode(image.data[i]);
                    //     }

                    //     smallImg = "data:image/jpeg;base64," + window.btoa(base64String);
                    //     imageCompression.getFilefromDataUrl(smallImg).then((file) => {
                    //         imageCompression(file,{maxSizeMB:0.002,maxWidthOrHeight:48}).then((file)=>{
                    //             imageCompression.getDataUrlFromFile(file).then((string)=>{
                    //                 smallImg = string;
                    //             })
                    //         })
                    //     })
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
            localStorage.setItem('songObjs', JSON.stringify(modified));
            ipcRenderer.send('populate');
        });
    })
}

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