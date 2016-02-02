# Roobottom's Image Server

A really simple image server build in Node. 

## Requirements:

* [GraphicsMagick](http://www.graphicsmagick.org/)

## Todo:

* ~~Serve resized files as files~~
* ~~Get file from filepath `/r/:w/:h/:path/:file`~~
* ~~return a 404 for missing files~~
* ~~Get *origninal* file from filepath `/:path/:file`~~
* ~~Add a general 404 for all unmatched paths~~
* ~~Get JSON object of width and height from `/s/:path/:file`~~
* Add a cleanse option to remove all created sub-folders.
* Check the request uri to ensure that only `roobottom.com` can call this script.

## Think about:

* Batch process EXIF data from files, store this in a JSON file for each type of [diary,note,gallery] image?
* Add another endpoint that gives width and height data from GET flag `?info=true` (although this prooved slow in testing - would a node only process be quicker?)
* Would it be useful to allow a batch-call to get info, eg `/info/?f=dairy/01.jpg,diary/02.jpg`?
* what about compression levels on resized images? Tradeoff between size / quality.
