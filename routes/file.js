"use strict";
module.exports = function(app, file, updateCategories){
    //download file
    app.get("/file/download/:filename", function(req, res){
        let filename = req.params.filename || false;
        if(filename){
            let filepath = file.upload_path + filename;//resolve file disk path
            if(filepath){
                res.download(filepath);
            }
            else{
                res.send({
                    status: false,
                    message: "file:download error -> invalid entity/file"
                });
            }
        }
        else{
            res.send({
                status: false,
                message: "file:download error -> invalid request"
            });
        }
    });

    //get file categories
    app.get("/file/categories", function(req, res){
        updateCategories().then(function(data){
            res.send({
                status: true,
                data: data
            });
        }).catch(function(error){
            res.send({
                status: false,
                message: error.message
            });
        });
    });

    //get file fields
    app.get("/file/fields", function(req, res){
        res.send({
            status: true,
            data: file.fields
        });
    });

    //list files
    app.post("/file/list", function(req, res){
        file.list().then(function(data){
            res.send({
                status: true,
                data: data
            });
        }).catch(function(error){
            res.send({
                status: false,
                message: error.message
            });
        });
    });

    //get file data
    app.get("/file/get/:_id", function(req, res){
        let id = req.params._id || false;
        if(id){
            file.get(id).then(function(data){
                res.send({
                    status: true,
                    data: data
                });
            }).catch(function(error){
                res.send({
                    status: false,
                    message: error.message
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "file:get error -> invalid request"
            });
        }
    });

    //search files
    app.post("/file/search", function(req, res){
        let filters = {
            status: req.body.status || false
        };
        file.search(filters).then(function(data){
            res.send({
                status: true,
                data: data
            });
        }).catch(function(error){
            res.send({
                status: false,
                message: error.message
            });
        });
    });

    //update file
    app.post("/file/update", function(req, res){
        let id = req.body._id || false;
        let data = req.body.data || false;
        if(id && data){
            file.update(id, data).then(function(response){
                res.send({
                    status: true,
                    data: response
                });
            }).catch(function(error){
                res.send({
                    status: false,
                    message: error.message
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "file:update error -> invalid request"
            });
        }
    });

    //remove file
    app.post("/file/remove", function(req, res){
        let id = req.body._id || false;
        let rev = req.body._rev || false;
        if(id && rev){
            file.remove(id, rev).then(function(data){
                res.send({
                    status: true,
                    data: data
                });
            }).catch(function(error){
                res.send({
                    status: false,
                    message: error.message
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "file:remove error -> invalid request"
            });
        }
    });

    //upload file
    app.post("/file/upload", function(req, res){
        file.upload(req).then(function(data){
            res.send({
                status: true,
                data: data
            });
        }).catch(function(error){
            res.send({
                status: false,
                message: error.message
            });
        });
    });
};