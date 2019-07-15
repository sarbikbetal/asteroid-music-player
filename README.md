# Asteroid Music Player
A minimal material design music player built on [Electron](https://electronjs.org) with [Materialize](https://materializecss.com), [Howler.js](https://howlerjs.com/) and [JS Media Tags](https://github.com/aadsm/jsmediatags).
Icons used are made by [Darius Dan](https://www.flaticon.com/authors/darius-dan) from [www.flaticon.com](https://www.flaticon.com/) and [Material Design Icons](https://material.io/tools/icons/)


## Features
+ Play local music files (only mp3 for now)
+ Party Mode - Broadcast a song in your local network and anyone with this app on the same network can receive the stream (Buggy and has some latency, to be fixed soon). Because of a bug in chromium, it relies on HTML5 audio rather than WebAudio API. 
+ Search feature in progress.


## Releases
[Download Now](https://github.com/sarbikbetal/asteroid-music-player/releases)

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
For building the app [electron-builder](https://www.electron.build/) is used. Just run `$ npm run build` to get your package ready in the `/dist` folder.

## Troubleshooting
#### Couldn't add songs to the player
Yeah that happens sometimes on the first run, just close the app and start again.

#### Broadcast Client player is not working
It may happen that you are on the same network and you entered the correct IP address, still the Broadcast Client player is not playing. A major cause to this can be corporate proxies and restrictions due to them. It will be fixed soon.

#### If you find bugs or have feature requests, then please open an issue in Github with as uch relevant info you can provide.