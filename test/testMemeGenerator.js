var emptyResult = '{"success":true,"result":[]}';
var unsuccessfulResult = '{"success":false,"result":[]}';
var oneResult = '{"success":true,"result":[{"generatorID":45,'
                + '"displayName":"Insanity Wolf",'
                + '"urlName":"Insanity-Wolf",'
                + '"totalVotesScore":366,'
                + '"imageUrl":"/cache/images/400x/0/0/20.jpg",'
                + '"instancesCount":177840,"ranking":4}]}';
var twoResults = '{"success":true,"result":[{"generatorID":45,'
                 + '"displayName":"Insanity Wolf",'
                 + '"urlName":"Insanity-Wolf",'
                 + '"totalVotesScore":366,'
                 + '"imageUrl":"/cache/images/400x/0/0/20.jpg",'
                 + '"instancesCount":177840,'
                 + '"ranking":4},'
                 + '{"generatorID":138525,'
                 + '"displayName":"Insanity Spencer",'
                 + '"urlName":"Insanity-Spencer",'
                 + '"totalVotesScore":0,'
                 + '"imageUrl":"/cache/images/400x/1/1612/1651386.jpg",'
                 + '"instancesCount":23,'
                 + '"ranking":8391}]}';
var generatorProps = {"generatorID":138525,
                      "displayName":"Insanity Spencer",
                      "urlName":"Insanity-Spencer",
                      "totalVotesScore":0,
                      "imageUrl":"/cache/images/400x/1/1612/1651386.jpg",
                      "instancesCount":23,
                      "ranking":8391};

TestCase("MemeGenerator.Proxy.resultsForJSON", sinon.testCase({
  "test can parse empty result": function() {
    var mg = new MemeGenerator.Proxy();
    assertEquals([], mg.resultsForJSON(emptyResult));
  },

  "test can parse unsuccessful result": function() {
    var mg = new MemeGenerator.Proxy();
    assertNull(mg.resultsForJSON(unsuccessfulResult));
  },

  "test can parse one result": function() {
    var mg = new MemeGenerator.Proxy();
    var results = mg.resultsForJSON(oneResult);
    assertEquals(1, results.length);
    assertEquals(45,                              results[0].generatorID);
    assertEquals("Insanity Wolf",                 results[0].displayName);
    assertEquals("Insanity-Wolf",                 results[0].urlName);
    assertEquals("/cache/images/400x/0/0/20.jpg", results[0].imageUrl);
  },

  "test can parse more than one result": function() {
    var mg = new MemeGenerator.Proxy();
    var results = mg.resultsForJSON(twoResults);
    assertEquals(2, results.length);
    assertEquals(45,                              results[0].generatorID);
    assertEquals("Insanity Wolf",                 results[0].displayName);
    assertEquals("Insanity-Wolf",                 results[0].urlName);
    assertEquals("/cache/images/400x/0/0/20.jpg", results[0].imageUrl);
    assertEquals("20", results[0].imageID);
    assertEquals(138525,                          results[1].generatorID);
    assertEquals("Insanity Spencer",              results[1].displayName);
    assertEquals("Insanity-Spencer",              results[1].urlName);
    assertEquals("/cache/images/400x/1/1612/1651386.jpg",
                                                  results[1].imageUrl);
    assertEquals("1651386",                       results[1].imageID);
  },

  "test returns MemeGenerator.Generator objects": function() {
    var mg = new MemeGenerator.Proxy();
    var results = mg.resultsForJSON(oneResult);
    assertEquals(1, results.length);
    assertInstanceOf(MemeGenerator.Generator, results[0]);
  }
}));



TestCase("MemeGenerator.Generator.generate", sinon.testCase({
  "test can generate an instance image": function() {
    var mgg = new MemeGenerator.Generator(generatorProps);
    mgg.transport = {open:         function() {},
                     send:         function() {},
                     status:       200,
                     responseText: '{"success":true,"result":{"generatorID":45,"displayName":"Insanity Wolf","urlName":"Insanity-Wolf","totalVotesScore":0,"imageUrl":"/cache/images/400x/0/0/20.jpg","instanceID":11208231,"text0":"push a hipster down the stairs","text1":"now look who\u0027s tumbling","instanceImageUrl":"/cache/instances/400x/10/10945/11208231.jpg","instanceUrl":"http://memegenerator.net/instance/11208231"}}' };
    var result;
    mgg.generate('text up', 'text down; you can\'t explain that',
                function(r) {
                  assertEquals('/cache/images/400x/0/0/20.jpg', r.imageUrl);
                  assertEquals('/cache/instances/400x/10/10945/11208231.jpg',
                               r.instanceImageUrl);
                });
  }
}));



TestCase("MemeGenerator.FavouritePool", sinon.testCase({
  "test can load an empty pool": function() {
    var mgfp1 = new MemeGenerator.FavouritePool();
    assertEquals([], mgfp1.favourites());
    var mgfp2 = new MemeGenerator.FavouritePool("");
    assertEquals([], mgfp2.favourites());
    var mgfp3 = new MemeGenerator.FavouritePool(undefined);
    assertEquals([], mgfp3.favourites());
    var mgfp4 = new MemeGenerator.FavouritePool(null);
    assertEquals([], mgfp4.favourites());
  },

  "test can load a pool with one favourite": function() {
    var poolJSON = JSON.stringify([{generatorID:45,
                                    displayName:"Insanity Wolf",
                                    imageUrl:"/cache/images/400x/0/0/20.jpg"}]);
    var mgfp = new MemeGenerator.FavouritePool(poolJSON);
    var favs = mgfp.favourites();
    assertEquals(1, favs.length);
    assertInstanceOf(MemeGenerator.Generator, favs[0]);
    assertEquals(45, favs[0].generatorID);
    assertEquals("Insanity Wolf", favs[0].displayName);
    assertEquals("/cache/images/400x/0/0/20.jpg", favs[0].imageUrl);
  },

  "test can add a generator to the favourite pool": function() {
    var generator = new MemeGenerator.Generator(
      {generatorID:45,
       displayName:"Insanity Wolf",
       imageUrl:"/cache/images/400x/0/0/20.jpg"});
    var mgfp = new MemeGenerator.FavouritePool("");
    var favs = mgfp.favourites();
    assertEquals(0, favs.length);
    mgfp.addFavourite(generator);
    var favs2 = mgfp.favourites();
    assertEquals(1, favs2.length);
    assertInstanceOf(MemeGenerator.Generator, favs2[0]);
    assertEquals(45, favs2[0].generatorID);
    assertEquals("Insanity Wolf", favs2[0].displayName);
    assertEquals("/cache/images/400x/0/0/20.jpg", favs2[0].imageUrl);
  },

  "test doesn't duplicate favourites": function() {
    var generatorProps = {generatorID:45,
                          displayName:"Insanity Wolf",
                          imageUrl:"/cache/images/400x/0/0/20.jpg"};
    var poolJSON = JSON.stringify([generatorProps]);
    var mgfp = new MemeGenerator.FavouritePool(poolJSON);
    var favs;

    favs = mgfp.favourites();
    assertEquals(1, favs.length);
    assertInstanceOf(MemeGenerator.Generator, favs[0]);
    assertEquals(45, favs[0].generatorID);

    var generator = new MemeGenerator.Generator(generatorProps);
    mgfp.addFavourite(generator);
    favs = mgfp.favourites();
    assertEquals(1, favs.length);
    assertInstanceOf(MemeGenerator.Generator, favs[0]);
    assertEquals(45, favs[0].generatorID);

    var generator2 = new MemeGenerator.Generator({generatorID:45,
                                                  displayName:'duplicate!',
                                                  imageUrl:'/cache/...'});
    mgfp.addFavourite(generator2);
    favs = mgfp.favourites();
    assertEquals(1, favs.length);
    assertInstanceOf(MemeGenerator.Generator, favs[0]);
    assertEquals(45, favs[0].generatorID);
    assertEquals("Insanity Wolf", favs[0].displayName);
  },

  "test can remove favourites": function() {
    var poolJSON = JSON.stringify([{generatorID:45,
                                    displayName:"Insanity Wolf",
                                    imageUrl:"/cache/images/400x/0/0/20.jpg"},
                                   {generatorID:46,
                                    displayName:"Insanity Wolf2",
                                    imageUrl:"/cache/images/400x/0/0/21.jpg"}]);
    var mgfp = new MemeGenerator.FavouritePool(poolJSON);
    var favs = mgfp.favourites();
    assertEquals(2, favs.length);

    mgfp.removeFavourite(new MemeGenerator.Generator({generatorID:45,
                                                      displayName:"foo",
                                                      imageUrl:"/bar"}));
    assertEquals(1, favs.length);
  },

  "test nothing breaks when removing non-existent favourites": function() {
    var displayName = "Insanity Wolf";
    var imageUrl    = "/cache/images/400x/0/0/20.jpg";
    var poolJSON = JSON.stringify([{generatorID:45,
                                    displayName:displayName,
                                    imageUrl:imageUrl},
                                   {generatorID:46,
                                    displayName:"Insanity Wolf2",
                                    imageUrl:"/cache/images/400x/0/0/21.jpg"}]);
    var mgfp = new MemeGenerator.FavouritePool(poolJSON);
    var favs = mgfp.favourites();
    assertEquals(2, favs.length);

    mgfp.removeFavourite(new MemeGenerator.Generator({generatorID:47,
                                                      displayName:displayName,
                                                      imageUrl:imageUrl}));
    assertEquals(2, favs.length);
  },

  "test can detect if a favourite is in the pool": function() {
    var generatorProps = {generatorID:45,
                          displayName:"Insanity Wolf",
                          imageUrl:"/cache/images/400x/0/0/20.jpg"};
    var poolJSON = JSON.stringify([generatorProps,
                                   {generatorID:46,
                                    displayName:"Insanity Wolf2",
                                    imageUrl:"/cache/images/400x/0/0/21.jpg"}]);
    var mgfp = new MemeGenerator.FavouritePool(poolJSON);
    assert(mgfp.includes(new MemeGenerator.Generator(generatorProps)));
    var generatorProps2 = {generatorID:47,
                           displayName:"Insanity Wolf",
                           imageUrl:"/cache/images/400x/0/0/20.jpg"};
    assertFalse(mgfp.includes(new MemeGenerator.Generator(generatorProps2)));
  },

  "test can export to JSON": function() {
    var poolJSON = JSON.stringify([{generatorID:45,
                                    displayName:"Insanity Wolf",
                                    imageUrl:"/cache/images/400x/0/0/20.jpg",
                                    totalVotesScore: 1},
                                   {generatorID:46,
                                    displayName:"Insanity Wolf2",
                                    imageUrl:"/cache/images/400x/0/0/21.jpg",
                                    totalVotesScore: 2}]);
    var mgfp = new MemeGenerator.FavouritePool(poolJSON);
    var favs = mgfp.favourites();
    assertEquals(2, favs.length);

    var exportedJSON = mgfp.toJSON();
    var exportedFavs = JSON.parse(exportedJSON);
    assertEquals(2, exportedFavs.length);
    assertEquals(45, exportedFavs[0].generatorID);
    assertUndefined(exportedFavs[0].totalVotesScore);
    assertEquals(46, exportedFavs[1].generatorID);
    assertUndefined(exportedFavs[1].totalVotesScore);
  }
}));
