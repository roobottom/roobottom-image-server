var express = require('express');
var app = express();

var fs = require('fs'),
    gm = require('gm'),
    path = require('path');

var res_opts = {
    root: __dirname + '/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
};

app.get('/:path/:w/:h/:img', function (req, res) {
    resize('images/'+req.params.path+'/'+req.params.img,req.params.w,null,function(data,err) {
        
        console.log(err);
        if(!err) {
            res.sendFile(data, res_opts);
        } else {
            res.send('File not found', 404);
        }
    });
});

app.listen(3000, function () {
  console.log('Listening on port 3000!');
});


function resize(file,w,h,cb) {
    file = objectify_file(file,w,h);
    check_file(file.file,w,h,function(err) {
        if(err) {
            var ratio = (w === h) ? '!':null;
            gm(file.file)   
            .resize(w, h,ratio)
            .noProfile()
            .write(file.fullpath, function (err) {
              if (!err) {
                    cb(file.fullpath,null);
                } else {
                    cb(null,err);
                }
            });

        } else {
            cb(file.fullpath);
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

function get_exif(file,cb) {
    gm(file)
    .identify(function (err, data) {
        if (!err) {
            return cb(data);
        } else {
            return cb(err);
        }
    });
};


