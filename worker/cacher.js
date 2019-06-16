const { ipcRenderer, remote } = require('electron');
const fs = require('fs');
const jsmediatags = require('jsmediatags');
const imageCompression = require('browser-image-compression');

console.log(`${process.type}:${process.pid}`);


/////////////////////// Receives all the songs from Main Process  ///////////////////////////
ipcRenderer.on('songs', (e, songs) => {

    var path = require('path');

    if (songs.length) {
        ipcRenderer.send('status', '<div class="progress"><div class="indeterminate"></div></div><div class="container center-align"><h3>Hold on, we are adding your music</h3><h4>Getting Files...</h4></div>');
    } else {
        ipcRenderer.send('status', '');
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
            ipcRenderer.send('status', `<div class="progress"><div class="determinate" style="width: ${Math.round((index + 1) * 100 / array.length)}%"></div></div><div class="container center-align"><h3>Hold on, we are adding your music</h3><h4>Parsing Metadata...(${index + 1}/${array.length})</h4></div>`);
            jsmediatags.read(song, {
                onSuccess: (tag) => {
                    var image = tag.tags.picture;
                    var smallImg;
                    if (image) {
                        var base64String = "";
                        for (var i = 0; i < image.data.length; i++) {
                            base64String += String.fromCharCode(image.data[i]);
                        }

                        smallImg = "data:image/jpeg;base64," + window.btoa(base64String);
                        imageCompression.getFilefromDataUrl(smallImg).then((file) => {
                            imageCompression(file, { maxSizeMB: 0.0018, maxWidthOrHeight: 48 }).then((file) => {
                                imageCompression.getDataUrlFromFile(file).then((string) => {
                                    smallImg = string;
                                    tagit();
                                })
                            })
                        })
                    } else {
                        smallImg = null
                        tagit();
                    }

                    function tagit() {
                        var sound = new Song({
                            filename: path.basename(song),
                            title: tag.tags.title,
                            url: song,
                            artist: tag.tags.artist,
                            album: tag.tags.album,
                            img: smallImg
                        });
                        modified.push(sound);
                        next();
                    }
                },
                onError: (error) => {
                    console.error(':(', error.type, error.info, song);
                    var sound = new Song({
                        filename: path.basename(song),
                        url: song
                    });
                    modified.push(sound)
                    next();
                }
            });
        }).done(() => {
            console.log("Metadata Parsing Completed");
            localStorage.setItem('songObjs', JSON.stringify(modified));
            ipcRenderer.send('populate');
            remote.getCurrentWindow().close();
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