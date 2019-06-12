// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const state = require('electron-window-state');

// Dev dependency
// const { openProcessManager } = require('electron-process-manager');
require('electron-reload')(__dirname)


// Invoke the file listing function
var musicObjects = loadFiles()

let mainWindow
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // openProcessManager();

  let winState = state({
    defaultHeight: 700,
    defaultWidth: 1200
  })

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: winState.width,
    height: winState.height,
    x: winState.x,
    y: winState.y,
    minHeight: 400,
    minWidth: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // let mainMenu = Menu.buildFromTemplate(require('./menu'))
  // Menu.setApplicationMenu(mainMenu)

  winState.manage(mainWindow);

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  // Sends the song object array to renderer process
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('songs', musicObjects);
    console.log("objects sent");
  })

  // Respond tio IPCmsg to load client page
  ipcMain.on('loadClient', () => {
    console.log("Loading client page");
    mainWindow.loadFile('./client/client.html')
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// Traverses the given directory and searches for mp3 files and returs a song object
function loadFiles() {

  var path = path || require('path');

  var walkSync = function (dir, filelist) {
    var fs = fs || require('fs'),
      files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        filelist = walkSync(path.join(dir, file), filelist);
      }
      else {
        // In case of audio files...
        if (file.indexOf('.mp3') == file.length - 4) {
          filelist.push(path.join(dir, file));
        }
      }
    });
    return filelist;
  };

  var musicDirs = walkSync("/mnt/media/Songs");
//  var musicDirs = walkSync(__dirname + "/search");

  // var songs = [];

  // musicDirs.forEach((song) => {

  //   jsmediatags.read(song, {
  //     onSuccess: (tag) => {
  //       var image = tag.tags.picture;
  //       var smallImg;
  //       if (image) {
  //         var base64String = "";
  //         for (var i = 0; i < image.data.length; i++) {
  //           base64String += String.fromCharCode(image.data[i]);
  //         }
  //         smallImg = base64String
  //       } else {
  //         smallImg = null
  //       }
  //       var sound = new Object({
  //         filename: path.basename(song),
  //         title: tag.tags.title,
  //         url: song,
  //         artist: tag.tags.artist,
  //         album: tag.tags.album,
  //         img: smallImg
  //       });
  //       songs.push(sound);
  //     },
  //     onError: (error) => {
  //       console.error(':(', error.type, error.info, song);
  //       var sound = new Object({
  //         filename: path.basename(song),
  //         url: song
  //       });
  //       songs.push(sound);
  //     }
  //   });
  // });

  // console.log(songs)
  // return songs

  return musicDirs
}

