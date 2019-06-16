// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const state = require('electron-window-state');
const fs = require('fs');
// const syncforeach = require('sync-foreach')


//////////////////////// Dev dependencies  //////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
/////////////// Comment these out befor building   //////////////////////////

// const { openProcessManager } = require('electron-process-manager');
// require('electron-reload')(__dirname)
console.log(`${process.type}:${process.pid}`);

///////////////////////////////////////////////////////////////////////////

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
    minHeight: 600,
    minWidth: 850,
    webPreferences: {
      nodeIntegration: true,
      devTools: false
    }
  })

  // let mainMenu = Menu.buildFromTemplate(require('./menu'))
  // Menu.setApplicationMenu(mainMenu)

  winState.manage(mainWindow);

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  ///////////// Open the DevTools.///////////
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  // Sends the song object array to renderer process

  // Respond tio IPCmsg to load client page
  ipcMain.on('loadClient', () => {
    console.log("Loading client page");
    mainWindow.loadFile('./client/client.html')
  })

  ipcMain.on('populate', () => {
    mainWindow.webContents.send('populate');
  })

  ipcMain.on('config', () => {
    startCacher()
  })

  ipcMain.on('status', (ev,stat) => {
    mainWindow.webContents.send('status',stat);
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

/////////////////////    Start the cacher renderer process ////////////////////
function startCacher() {
  let workerWindow = new BrowserWindow({
    show:false,
    webPreferences: {
      nodeIntegration: true,
      devTools: false,
    }
  })
  workerWindow.loadFile('./worker/worker.html')

  workerWindow.webContents.on('did-finish-load', () => {
    workerWindow.webContents.send('songs', loadFiles());
  })

  return workerWindow;
}

// Traverses the given directory and searches for mp3 files and returs a song object

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
      // In case of audio files...
      if (file.indexOf('.mp3') == file.length - 4) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};


function loadFiles() {
  var urls = [];
  var json = fs.readFileSync('./assets/config.json')
  json = JSON.parse(json);
  json.directories.forEach((dir) => {
    var batch = walkSync(dir);
    urls = urls.concat(batch);
  })
  return urls
};


