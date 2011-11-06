// Namespace
var MemeGenerator = {};

// Proxy
MemeGenerator.Proxy = function() {
  this.transport = new XMLHttpRequest();
};
(function(mgp) {
  mgp.search = function(keywords, cb) {
    this.transport.open('GET', 'http://version1.api.memegenerator.net/Generators_Search?q=' + encodeURIComponent(keywords), false);
    this.transport.send(null);
    if (this.transport.status == 200) {
      cb(this.resultsForJSON(this.transport.responseText));
    } else {
      cb(null);
    }
  };

  mgp.resultsForJSON = function(json) {
    var data = JSON.parse(json);
    if (! data.success) return null;
    return data.result.map(function(i) {
      return new MemeGenerator.Generator(i);
    });
  };
})(MemeGenerator.Proxy.prototype);


// Generator
MemeGenerator.Generator = function(props) {
  for (i in props) {
    if (props.hasOwnProperty(i)) {
      this[i] = props[i];
    }
  };
  this.imageID = this.imageUrl.replace(/.+\//, '').replace(/\..+/, '');
  this.transport = new XMLHttpRequest();
};
(function(mgg) {
  mgg.generate = function(textUp, textDown, cb) {
    var baseInstanceCreateUrl = "http://version1.api.memegenerator.net/" +
                                  "Instance_Create";
    var instanceCreateParams = [['username',     'memepanel'],
                                ['password',     'p4n3lzikrit'],
                                ['languageCode', 'en'],
                                ['generatorID',  this.generatorID],
                                ['imageID',      this.imageID],
                                ['text0',        textUp],
                                ['text1',        textDown]];
    var paramString = instanceCreateParams.map(function(p) {
      return encodeURIComponent(p[0]) + "=" + encodeURIComponent(p[1]);
    }).join("&");
    var finalUrl = baseInstanceCreateUrl + '?' + paramString;

    this.transport.open('GET', finalUrl, false);
    this.transport.send(null);
    if (this.transport.status == 200) {
      var r = JSON.parse(this.transport.responseText);
      cb(r.success ? r.result : null);
    } else {
      cb(null);
    }
  };
})(MemeGenerator.Generator.prototype);


// FavouritePool
MemeGenerator.FavouritePool = function(favouriteJSON) {
  this.favs = [];
  try {
    this.favs = JSON.parse(favouriteJSON).map(function(i) {
      return new MemeGenerator.Generator(i);
    });
  } catch (e) {
    // Ignore parsing errors
  };
};
(function(mgfp) {
  mgfp.favourites = function() { return this.favs; };

  mgfp.addFavourite = function(generator) {
    if (this.favs.every(function(i) {
            return i.generatorID !== generator.generatorID; })) {
      this.favs.push(generator);
    }
  };

  mgfp._favouritePosition = function(generator) {
    var index = -1;
    for (var i = 0, len = this.favs.length; i < len; i++) {
      if (this.favs[i].generatorID === generator.generatorID) {
        index = i;
        break;
      }
    }
    return index;
  };

  mgfp.includes = function(generator) {
    return (this._favouritePosition(generator) >= 0);
  };

  mgfp.removeFavourite = function(generator) {
    var index = this._favouritePosition(generator);
    if (index >= 0) {
      this.favs.splice(index, 1);
    }
  };

  mgfp.toJSON = function() {
    return JSON.stringify(this.favs.map(function(i) {
      return {generatorID: i.generatorID,
              displayName: i.displayName,
              imageUrl:    i.imageUrl};
    }));
  };
})(MemeGenerator.FavouritePool.prototype);
