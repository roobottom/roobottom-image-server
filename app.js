var express = require('express');
var app = express();
app.use(express.static('images'));

var fs      = require('fs-extra'),
    gm      = require('gm'),
    path    = require('path'),
    sizeOf  = require('image-size');

var res_opts = {
    root: __dirname + '/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
};

var whitelist = [
    '^.*\/\/roo\.dev\/?.*$',
    '^.*\/\/roobottom\.com\/?.*$',
    '^.*\/\/localhost\/?.*$',

];
var whitelist_regex = new RegExp(whitelist.join("|"), "g");
console.log(whitelist_regex);

// resize
app.get('/r/:w/:h/:path/:img', function (req, res) {
    var referer = req.headers.referer;
    if(!referer) referer='//localhost';//if we call this script direct

    //check that the caller is on the whitelist.
    if(referer.match(whitelist_regex) === null) {
        res.sendStatus(403);
    } else {
        //check for the existance of cache folder
        //and create it if needed:
        check_folder('./.cache/'+req.params.path, function(err) {
          if(!err) {
            var w = req.params.w;
            var h = req.params.h;
            resize('images/'+req.params.path+'/'+req.params.img,w,h,function(data,err) {
                if(!err) {
                    res.sendFile(data, res_opts);
                } else {
                    res.status(500).send('Error: '+err);
                }
            });
          } else {
            console.log(err);
          }
        });
    }
});

// get size
app.get('/s/:path/:img', function (req, res) {
    var headers = req.headers.referer;
    if(headers.match(whitelist_regex) === null) {
        res.sendStatus(403);
    } else {
        res.header("Access-Control-Allow-Origin", "*");
        get_size('images/' + req.params.path + '/' + req.params.img, function(size,err) {
            if(!err) {
                res.send({'w':size.width,'h':size.height});
            }
        });
    }
});


app.use(function(req, res){
    res.sendStatus(404);
});

app.listen(3003, function () {
  console.log('Listening on port 3003!');
});

//resize the file.
//you can also pass w=auto and/or h=auto
function resize(file,w,h,cb) {
    file = objectify_file(file,w,h);
    check_file(file.file,w,h,function(err) {
        if(err) {
            //if w or h are auto, set these to null
            w = (w === 'auto') ? null:w;
            h = (h === 'auto') ? null:h;

            if(w === h) {

                //save the h+w for cropping
                var crop_w = w;
                var crop_h = h;

                //first of all, lets get the w+h of the orriginal file:
                get_size(file.file,function(size) {


                    if(size.width > size.height) {
                        //resize by h first, then crop
                        w=null;
                    } else {
                        //resize by w first, then crop
                        h=null;
                    }
                    console.log('resize',w,h,'crop',crop_w,crop_h);

                    gm(file.file)
                        .resize(w,h)
                        .crop(crop_w,crop_h)
                        .noProfile()
                        .write(file.fullpath, function (err) {
                      if (!err) {
                            cb(file.fullpath,null);
                        } else {
                            cb(null,err);
                        }
                    });
                });


            } else {
                gm(file.file)
                    .resize(w,h)
                    .noProfile()
                    .write(file.fullpath, function (err) {
                  if (!err) {
                        cb(file.fullpath,null);
                    } else {
                        cb(null,err);
                    }
                });
            }



        } else {
            cb(file.fullpath,null);
        }
    });
};

//reusable file factory
function objectify_file(file,w,h) {
  console.log(path.dirname(file));
    return {
        "file":file,
        "fullpath":path.dirname(file) + '/' + w + 'x' + h + '/' + path.basename(file),
        "newpath":path.dirname(file) + '/' + w + 'x' + h
    }
}

//check if a folder exisists, if not, create it.
function check_folder(folder, callback) {
  fs.ensureDir(folder, function(err) {
    if(!err) {callback(null);}
    else {callback(err);}
  });
};


//check if a file exists, if not, create it
function check_file(file,w,h,cb) {
    file = objectify_file(file,w,h);

    //first, lets check if this folder exists;
    check_folder(file.newpath,function(err) {
        if(!err) {
            //now check if the file exists
            fs.stat(file.fullpath,function(err,stats) {
                if (!err) {
                    cb(null);
                } else if(err && err.errno === -2) {
                    cb(err);
                } else {
                    console.log('check file',err);
                }
            })
        } else {
            console.log('check_folder',err);
        }
    });
};


function get_size(file,cb) {
    console.time('size');
    sizeOf(file, function (err, dimensions) {
        if(!err) {
            cb(dimensions,null);
        } else {
            cb(null,err);
        }
      console.log(dimensions.width, dimensions.height);
      console.timeEnd('size');
    });
};
