/*global angular, MemeGenerator*/

function absolutify(url, baseUrl) {
  baseUrl = baseUrl || 'http://version1.api.memegenerator.net';
  if (! url) { return ''; }
  return (url.indexOf('/') === 0 ? baseUrl : '') + url;
}

angular.filter('absolutify', absolutify);

function MemePanelCtrl(/*$resource*/) {
}
MemePanelCtrl.prototype = {
  init: function() {
    this.storage = window.localStorage;
    this.mgProxy = new MemeGenerator.Proxy();
    this.favouritePool =
      new MemeGenerator.FavouritePool(this.storage.getItem("favouritePool"));
    this.mode    = 'init';
  },

  showSearchBar: function() {
    return (this.mode === 'init' || /^search/.test(this.mode));
  },

  isFavourite: function(generator) {
    return this.favouritePool.includes(generator);
  },

  addToFavourites: function(generator) {
    this.favouritePool.addFavourite(generator);
    this.storage.setItem("favouritePool", this.favouritePool.toJSON());
  },

  removeFromFavourites: function(generator) {
    this.favouritePool.removeFavourite(generator);
    this.storage.setItem("favouritePool", this.favouritePool.toJSON());
  },

  search: function() {
    this.mode = 'searching';
    var self = this;
    this.mgProxy.search(this.searchmemebox, function(results) {
      self.error = (results === null);
      self.results = results;
      self.mode = 'search-results';
    });
  },

  showMeme: function(generator) {
    this.lastMode = this.mode;
    this.mode = 'show-meme';
    this.currentMeme = generator;
    document.getElementById('topText').focus();
  },

  generateImage: function(generator, topText, bottomText) {
    var self = this;
    generator.generate(topText, bottomText, function(r) {
      self.error = !r;
      self.currentMemeInstance = r;
      self.mode = 'show-meme-instance';
      var imageUrlBox = document.getElementById("imageUrl");
      var memegeneratorUrlBox = document.getElementById("memegeneratorUrl");
      imageUrlBox.value =
            absolutify(self.currentMemeInstance.instanceImageUrl);
      memegeneratorUrlBox.value =
            absolutify(self.currentMemeInstance.instanceUrl);
      imageUrlBox.focus();
      imageUrlBox.setSelectionRange(0, imageUrlBox.value.length);
    });
  }
};
