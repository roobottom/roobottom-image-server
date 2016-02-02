# Roobottom's Image Server

A really simple image server build in Node. 

## Requirements:

* [GraphicsMagick](http://www.graphicsmagick.org/)

## Todo:

* Serve resized files as files, with correct response header.
* Get filename from GET param: `?f=`
* Batch process EXIF data from files, store this in a JSON file for each type of [diary,note,gallery] image
* Add another endpoint that gives width and height data from GET flag `?f=[]&info=true` (although this prooved slow in testing)
* Check the request uri to ensure that only `roobottom.com` can call this script.
