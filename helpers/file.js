"use strict";
let fs = require("fs");
let path = require("path");
let mkdirp = require("mkdirp");
let formidable = require("formidable");
let fields = require("./file/fields");
let digest = require("./file/digest");
let resolveFields = require("./file/resolveFields");
let uploads_path = path.join(__dirname, "../uploads/");
let db = false;

module.exports = function(cloudant, resolveData){
    db = cloudant("portfolio_files");
    resolveFields = resolveFields(fields);

    //create uploads folder
    let createUploadsFolder = function(){
        return new Promise(function(resolve, reject){
            mkdirp(uploads_path, function(error){
                if(error){
                    reject(error);
                }
                else{
                    resolve(true);
                }
            });
        });
    };

    //persist data
    let persistData = function(data){
        return new Promise(function(resolve, reject){
            db.set(data).then(function(response){
                resolve(response);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //list file names
    let list = function(){
        return new Promise(function(resolve, reject){
            db.find().then(function(data){
                resolve(data.docs);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //get file data
    let get = function(id){
        return new Promise(function(resolve, reject){
            db.get(id).then(function(response){
                resolve(response);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //search files
    let search = function(filters){
        let query = {
            "selector": {
                "_id": {
                    "$gt": null
                },
                "status": {
                    "$regex": "(?i)" + filters.status 
                }
            }
        };
        return new Promise(function(resolve, reject){
            db.find(query).then(function(response){
                resolve(response.docs.map(function(entry){
                    return {
                        _id: entry._id,
                        _rev: entry._rev,
                        data: entry.data,
                        campos: entry.data,
                        html: entry.html,
                        date_creation: entry.date_creation,
                        filename: entry.filename,
                        status: entry.status
                    };
                }));
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //update file
    let update = function(id, data){
        return new Promise(function(resolve, reject){
            get(id).then(function(fileData){
                for(let prop in data){
                    fileData[prop] = data[prop];
                }
                db.update(id, fileData).then(function(response){
                    resolve(response);
                }).catch(function(error){
                    reject(error);
                });
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //remove file
    let remove = function(id, rev){
        return new Promise(function(resolve, reject){
            db.remove(id, rev).then(function(response){
                resolve(response);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //upload file
    let upload = function(req){
        let form = new formidable.IncomingForm();
        form.multiples = false;
        form.encoding = "utf-8";
        form.uploadDir = uploads_path;
        return new Promise(function(resolve, reject){
            form.on("file", function(field, file){
                let target_path = path.join(form.uploadDir, file.name);
                fs.rename(file.path, target_path, function(error){
                    if(error){
                        reject(error);
                    }
                    else{
                        resolve(processFile(target_path, file));
                    }
                });
            });
            form.on("error", function(error){
                console.log("file upload error", error);
                reject(error);
            });
            form.on("end", function(){
                console.log("file upload finish");
            });
            form.on("abort", function(){
                reject(false);
            });
            form.parse(req);
        });
    };

    /**
     * process file
     * @param {*} filePath 
     */
    function processFile(filePath, file){
        return new Promise(function(resolve, reject){
            digest(fs.createReadStream(filePath)).then(function(result){
                let resolved_data = resolveData(result);
                let resolved_fields = resolveFields(resolved_data);
                result.data = resolved_data.data;
                result.campos = resolved_fields.data;
                result.html = resolved_fields.html;
                result.date_creation = Date.now();
                result.filename = file ? file.name : "";
                result.status = "pending";
                persistData(result).then(function(response){
                    result._id = response.id;
                    result._rev = response.rev;
                    resolve(result);
                }).catch(function(error){
                    reject(error);
                });
            }).catch(function(error){
                console.log("file conversion error", error);
                reject(error);
            });
        });
    };

    //startup
    (function(){
        createUploadsFolder().then(function(){
            console.log("uploads folder created");
        }).catch(function(error){
            console.log("failed to create uploads folder");
        });
    })();

    //revealed module
    return {
        upload_path: uploads_path,
        fields: fields,
        list: list,
        get: get,
        search: search,
        update: update,
        remove: remove,
        upload: upload,
        processFile: processFile
    };
};