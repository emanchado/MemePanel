var heads                   = require('robohydra').heads,
    RoboHydraHead           = heads.RoboHydraHead,
    RoboHydraHeadStatic     = heads.RoboHydraHeadStatic,
    RoboHydraHeadFilesystem = heads.RoboHydraHeadFilesystem,
    RoboHydraHeadProxy      = heads.RoboHydraHeadProxy;

var insanityWolfSearchResult = {
    generatorID: 45,
    displayName: "Insanity Wolf",
    urlName: "Insanity-Wolf",
    totalVotesScore: 366,
    imageUrl: "http://localhost:3000/cache/img/400x/0/0/20.jpg",
    instancesCount: 177840,
    ranking: 4
};

var errorSearchResult = {
    generatorID: 46,
    displayName: "You didn't search for 'foo', d00d!",
    urlName: "Insanity-Wolf",
    totalVotesScore: 0,
    imageUrl: "http://localhost:3000/cache/img/400x/0/0/20.jpg",
    instancesCount: 0,
    ranking: 999
};

var simpleInstanceResult = {
    success:true,
    result:{
        generatorID:17,
        displayName:"Insanity Wolf",
        urlName:"Insanity-Wolf",
        totalVotesScore:0,
        imageUrl:"http://localhost:3000/cache/img/400x/0/0/20.jpg",
        instanceID:22415018,
        text0:"sample top text",
        text1:"sample bottom text",
        instanceImageUrl:"http://localhost:3000/instances/400x/22415018.jpg",
        instanceUrl:"http://memegenerator.net/instance/22415018"
    }
};

exports.getBodyParts = function(config, modules) {
    var assert = modules.assert;

    return {
        heads: [
            new RoboHydraHeadFilesystem({mountPath: '/cache',
                                         documentRoot: 'robohydra/cache'}),
            new RoboHydraHeadFilesystem({mountPath: '/instances',
                                         documentRoot: 'robohydra/instances'})
        ],

        scenarios: {
            proxy: {
                heads: [
                    new RoboHydraHeadProxy({
                        mountPath: '/',
                        proxyTo: 'http://version1.api.memegenerator.net',
                        setHostHeader: true
                    })
                ]
            },

            searchError: {
                heads: [
                    new RoboHydraHeadStatic({
                        path: '/Generators_Search',
                        content: {
                            success: false,
                            errorMessage: "There was an error connecting " +
                                              "to the database server"
                        }
                    })
                ]
            },

            searchEmpty: {
                heads: [
                    new RoboHydraHeadStatic({
                        path: '/Generators_Search',
                        content: {success: true, result: []}
                    })
                ]
            },

            searchOneResult: {
                heads: [
                    new RoboHydraHeadStatic({
                        path: '/Generators_Search',
                        content: {success: true,
                                  result:  [insanityWolfSearchResult]}
                    })
                ]
            },

            searchForFoo: {
                instructions: "Search for the string 'foo'. Should show one result and show a test pass in the test result page.",

                heads: [
                    new RoboHydraHead({
                        path: '/Generators_Search',
                        handler: function(req, res) {
                            var r = assert.equal(
                                req.getParams.q,
                                'foo',
                                "The 'q' parameter should be 'foo'"
                            );

                            if (r) {
                                res.send(JSON.stringify({
                                    success: true,
                                    result:  [insanityWolfSearchResult]
                                }));
                            } else {
                                res.send(JSON.stringify({
                                    success: true,
                                    result:  [errorSearchResult]
                                }));
                            }
                        }
                    })
                ]
            },

            createInstanceSimple: {
                heads: [
                    new RoboHydraHeadStatic({
                        path: '/Generators_Search',
                        content: {
                            success: true,
                            result:  [insanityWolfSearchResult]
                        }
                    }),

                    new RoboHydraHeadStatic({
                        path: '/Instance_Create',
                        content: simpleInstanceResult
                    })
                ]
            },

            memeGeneratorApiDead: {
                heads: [
                    new RoboHydraHead({
                        path: '/.*',
                        handler: function(req, res) {
                            res.statusCode = 500;
                            res.send("Random Java-something exception");
                        }
                    })
                ]
            }
        }
    };
};
