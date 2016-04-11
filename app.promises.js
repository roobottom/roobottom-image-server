'use strict';

const oRoot = './images/';
const tRoot = './.cache/';

const express = require('express');
const app = express();
app.use(express.static(tRoot));

const fs      = require('fs-extra');
const gm      = require('gm');
const sizeOf  = require('image-size');
const Promise = require('bluebird');
const exif    = require('exif');

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

/*
check dir, if it doesn't exists, create it.
This is a promise layer on fs-extra's ensureDir https://github.com/jprichardson/node-fs-extra#ensuredirdir-callback
*/
function ensureDir(dir) {
  return new Promise((resolve,reject) => {
      
  });
};

/*
calculate _how_ we should resize a file,
this involves looking at the orriginal image to calulate how
best we can crop this image.
`w` and `h` can be either an int or 'auto'
*/
function calculateResize(file,w,h) {
  return new Promise((resolve,reject) => {
    w = (w === 'auto') ? null:w;
    h = (h === 'auto') ? null:h;

    if(w===h) {
      getSize(file)
      .then(size => {
        //resize by h first, then crop
        if(size.width > size.height) { w=null; }
        //resize by w first, then crop
        else { h=null; }
        resolve({w:w,h:h});
      }).catch(err => reject(err));
    }
    //this isn't a square resize, so just return the size object:
    else {
      resolve({w:w,h:h});
    }
  });
};

/*
resize the image
*/
function resize(file,w,h) {
  calculateResize(file,w,h)
  .then(size => {

  })
  .catch(err => console.log(err));
};

let testImgs = [
  'diary/01.jpg',
  'diary/2015-09-05_005.jpg',
  'gallery/2015-09-19_003.jpg',
  'notes/IMG_8760.jpg'
]

Promise.map(testImgs, function(i) {
  return calculateResize(oRoot + i,698,698);
})
.then(r => console.log('result:',r))
.catch(e => console.log('error:',e));
