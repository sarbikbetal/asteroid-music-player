# YAMP - Yet Another Music Player
A minimal material design music player built on [Electron](https://electronjs.org) with [Materialize](https://materializecss.com), [Howler.js](https://howlerjs.com/) and [JS Media Tags](https://github.com/aadsm/jsmediatags).
Icons used are made by [Freepik](https://www.freepik.com/) from [www.flaticon.com](https://www.flaticon.com/) and [Material Design Icons](https://material.io/tools/icons/)

## Features
To be updated shortly

## Releases
Links will be added when app builds are ready

## Testing
To test these builds on your local machine, first clone the repository, get inside it and install the dependencies 
```sh
$ git clone https://github.com/sarbikbetal/YAMP.git
$ cd YAMP
$ npm install
```
The sources available now are for my testing purpose only so please change line 104 in [main.js](https://github.com/sarbikbetal/YAMP/blob/master/main.js) to a valid directory with some songs(currently only mp3) in it.
And once installation is complete run `$ npm start` to start the app, and if anything goes wrong open your running terminal and hit `Ctrl+C` to stop.

## Building
For building the app [electron-builder](https://www.electron.build/) is used. Just run `$ npm run-script build` to get your package ready in the `/dist` folder.