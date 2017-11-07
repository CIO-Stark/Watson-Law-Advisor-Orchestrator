"use strict";
module.exports = function(db, updateCategories){
    //load all grupos
    let load = function(){
        let selectors = {
            "selector": {
                "_id": {
                    "$gt": null
                }
            }
        };
        return new Promise(function(resolve, reject){
            db.find(selectors).then(function(data){
                resolve(data.docs);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //get grupo
    let get = function(id){
        return new Promise(function(resolve, reject){
            load().then(function(data){
                data.forEach(function(doc){
                    if(doc._id === id){
                        resolve(doc);
                    }
                });
                reject(false);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //get grupos by area id
    let getByArea = function(id){
        return new Promise(function(resolve, reject){
            load().then(function(data){
                let result = [];
                data.forEach(function(doc){
                    if(doc.id_area == id){
                        result.push(doc);
                    }
                    else{
                        console.log("getByArea", id, doc.id_area, doc);
                    }
                });
                resolve(result);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //create grupo
    let create = function(data){
        return new Promise(function(resolve, reject){
            load().then(function(grupos){
                let found = false;
                grupos.forEach(function(grupo){
                    if(grupo.label === data.label || grupo.value === data.value){
                        found = true;
                        return;
                    }
                });
                if(!found){
                    db.set(data).then(function(response){
                        updateCategories();
                        resolve(response);
                    }).catch(function(error){
                        reject(error);
                    });
                }
                else{
                    reject();
                }
            }).catch(function(error){
                reject(error);
            })
        });
    };

    //update grupo
    let update = function(data, id){
        return new Promise(function(resolve, reject){
            db.update(id, data).then(function(response){
                updateCategories();
                resolve(response);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //delete grupo
    let remove = function(id, rev){
        return new Promise(function(resolve, reject){
            db.remove(id, rev).then(function(status){
                updateCategories();
                resolve(status);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //revealed module
    return {
        load: load,
        get: get,
        getByArea: getByArea,
        create: create,
        update: update,
        remove: remove
    };
};