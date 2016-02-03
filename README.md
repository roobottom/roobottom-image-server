# Roobottom's Image Server

A really simple image server build in Node. 

## Requirements:

* [GraphicsMagick](http://www.graphicsmagick.org/)

## Features

* Serves original files from `/:path/:file`
* Serves resized files from `/r/[:w,auto]/[:h,auto]/:path/:file`
* Caches resized images
* Serves a JSON object containing width and height from `/s/:path/:file`
* Blocks any request from a referrer not on the white-list
