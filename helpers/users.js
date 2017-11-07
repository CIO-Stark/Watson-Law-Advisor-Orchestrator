"use strict";
module.exports = function(db){
    //load all users
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

    //get user
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

    //create user
    let create = function(data){
        return new Promise(function(resolve, reject){
            load().then(function(users){
                let found = false;
                users.forEach(function(user){
                    if(user.email === data.email){
                        found = true;
                        return;
                    }
                });
                if(!found){
                    db.set(data).then(function(response){
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

    //update user
    let update = function(data, id){
        return new Promise(function(resolve, reject){
            db.update(id, data).then(function(response){
                resolve(response);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //delete user
    let remove = function(id, rev){
        return new Promise(function(resolve, reject){
            db.remove(id, rev).then(function(status){
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
        create: create,
        update: update,
        remove: remove
    };
};