'use strict';

const Settings = require("./flickr.settings.json");

//console.log(process.env);

const Flickr = require("flickrapi"),
    flickrOptions = {
      api_key: Settings.key,
      secret: Settings.secret
    };

Flickr.tokenOnly(flickrOptions, function(error, flickr) {
  flickr.photosets.getList({
    api_key: Settings.key,
    user_id: Settings.id,
    page: 1,
    per_page: 500
  }, function(err, result) {
    console.log(result);
  });
});
