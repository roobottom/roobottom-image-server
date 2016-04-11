'use strict';

const oRoot = './images/';
const tRoot = './.cache/';

const express = require('express');
const app = express();
app.use(express.static(tRoot));

const fs      = require('fs-extra');
const gm      = require('gm');
const path    = require('path');
const sizeOf  = require('image-size');
const Promise = require('bluebird');
const exif = require('exif');

/*
User requests: [img server]/r/[h]/[w]/[type]/[img]
Script:
- checks the referer is on the whitelist / or script is locally called (if not => 403)
- check for the existance of the orriginal file (if none => 404)
- checks for the exsitance of the resized file
- creates the resized file if doesn't exist (if error => 500)
- serves the file via express
- catches any errors and response with the correct http header (404, 500 or 403)

User request: [img server]/i/[type]/[img]
Script:
- checks the referer is on the whitelist / or script is locally called (if not => 403)
- check for the exitstance of the the orriginal file (if none => 404)
- checks the w and h of the file
- serves a JSON object via express
- catches any errors and response with the correct http header (404, 500 or 403)
*/

/*
check if a file exists.
*/
function checkFile(file) {
  return new Promise((resolve, reject) => {
      fs.stat(file, (err,stats) => {
        if(!err) { resolve(stats); }
        else { reject(err); }
      });
  });
};

/*
get the exif data from a file
*/
function getExif(file) {
  return new Promise((resolve,reject) => {
      new exif({image:file}, (err,data) => {
        if(!err) { resolve(data); }
        else { reject(err); }
      });
  });
};

/*
get the w and h from a file
*/
function getSize(file) {
  return new Promise((resolve,reject) => {
    sizeOf(file, (err, size) => {
      if(!err) { resolve(size); }
      else { reject(err); }
    });
  });
};

let testImgs = [
  'diary/01.jpg',
  'diary/2015-09-05_005.jpg',
  'gallery/2015-09-19_003.jpg',
  'notes/IMG_8760.jpg'
]

Promise.map(testImgs, function(i) {
  return getSize(oRoot + i);
})
.then(r => console.log('result:',r))
.catch(e => console.log('error:',e));
