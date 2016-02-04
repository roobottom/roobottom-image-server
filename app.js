var express = require('express');
var app = express();
app.use(express.static('images'));

var fs      = require('fs'),
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
    '^.*\/\/localhost\/?.*$'
];
var whitelist_regex = new RegExp(whitelist.join("|"), "g");

// resize
app.get('/r/:w/:h/:path/:img', function (req, res) { 
    var headers = req.headers.referer;
    if(headers.match(whitelist_regex) === null) {
        res.sendStatus(403);
    } else {
        var w = (req.params.w === 'auto') ? null:req.params.w;
        var h = (req.params.h === 'auto') ? null:req.params.h;
        resize('images/'+req.params.path+'/'+req.params.img,w,h,function(data,err) {
            if(!err) {
                res.sendFile(data, res_opts);
            } else {
                res.sendStatus(404);
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


function resize(file,w,h,cb) {
    file = objectify_file(file,w,h);
    check_file(file.file,w,h,function(err) {
        if(err) {
            var ratio = (w === h) ? '!':null;
            gm(file.file)   
            .resize(w,h,ratio)
            .noProfile()
            .write(file.fullpath, function (err) {
              if (!err) {
                    cb(file.fullpath,null);
                } else {
                    cb(null,err);
                }
            });
        } else {
            cb(file.fullpath,null);
        }
    });
}

function objectify_file(file,w,h) {
    return {
        "file":file,
        "fullpath":path.dirname(file) + '/' + w + 'x' + h + '/' + path.basename(file),
        "newpath":path.dirname(file) + '/' + w + 'x' + h
    }
}

function check_folder(folder, callback) {  
  fs.stat(folder, function(err, stats) {
    if (err && err.errno === -2) {
      fs.mkdir(folder, callback);
    } else {
      callback(err)
    }
  });
};

function check_file(file,w,h,cb) {
    
    file = objectify_file(file,w,h);

    //first, lets check if this folder exists;
    check_folder(file.newpath,function(err) {
        if(!err) {
            //now check if the file exists
            fs.stat(file.fullpath,function(err,stats) {
                if (!err) {
                    cb(undefined);
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