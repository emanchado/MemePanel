MemePanelCtrl.$inject = ['$resource'];
function MemePanelCtrl($resource) {
}
MemePanelCtrl.prototype = {
  init: function() {
    this.storage = window.localStorage;
    this.mgProxy = new MemeGenerator.Proxy();
    opera.postError("I load this to the pool = " + this.storage.getItem("favouritePool"));
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
    opera.postError("I'm saving this to the pool = " + this.favouritePool.toJSON());
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
      self.results = results;
      self.mode = 'search-results';
    });
  },

  showMeme: function(generator) {
    this.lastMode = this.mode;
    this.mode = 'show-meme';
    this.currentMeme = generator;
  },

  generateImage: function(generator, topText, bottomText) {
    opera.postError("Generating image for " + generator.displayName +
                    " with text " + topText + "/" + bottomText);
    var self = this;
    generator.generate(topText, bottomText, function(r) {
      self.currentMemeInstance = r;
      self.mode = 'show-meme-instance';
    });
  }
};
