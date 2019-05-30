var Song = function (o) {
    var self = this;
    this.filename = o.filename
    this.title = (typeof o.title == 'string') ? o.title : o.filename;
    this.url = o.url;
    this.artist = (typeof o.artist == 'string') ? o.artist : "Unknown Artist";
    this.album = (typeof o.album == 'string') ? o.album : "Unknown Album";
    this.year = (typeof o.year == 'number') ? o.year : "--";
    this.img = o.img;
    return self;
};

exports.Song = Song;