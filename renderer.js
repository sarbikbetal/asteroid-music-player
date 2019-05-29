// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const jsmediatags = require("jsmediatags");

var walkSync = function (dir, filelist) {
    var path = path || require('path');
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        }
        else {
            // In case of video files...
            if (file.indexOf('.mp3') == file.length - 4) {
                filelist.push(path.join(dir, file));
            }
        }
    });
    return filelist;
};

var musicFiles = walkSync(__dirname + "/search")
console.log(musicFiles)

musicFiles.forEach((song) => {
    jsmediatags.read(song, {
        onSuccess: (tag) => {

            var image = tag.tags.picture;
            if (image) {
                // var pic = document.getElementById('picture')
                var base64String = "";
                for (var i = 0; i < image.data.length; i++) {
                    base64String += String.fromCharCode(image.data[i]);
                }
                var base64 = "data:image/jpeg;base64," +
                    window.btoa(base64String);
                document.getElementById('pic').style.display = "block";
                document.getElementById('pic').setAttribute('src', base64);
            }
        },
        onError: (error) => {
            console.log(':(', error.type, error.info);
        }
    })
});
