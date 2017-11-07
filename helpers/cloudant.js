"use strict";
let cloudant = require("cloudant");

module.exports = function(credentials){
    //create database instance for given credentials
    let instance = cloudant({
        host: credentials.host,
        account: credentials.username,
        password: credentials.password
    });

    //get collection
    let getCollection = function(collectionName){
        return instance.db.use(collectionName);
    };

    //create collection interface methods
    let createInterface = function(collection){
        //find documents
        let find = function(selectors){
            let query = selectors || {
                "selector": {
                    "_id": {
                        "$gt": null
                    }
                }
            };
            return new Promise(function(resolve, reject) {
                collection.find(query, function(error, response){
                    if(error){
                        reject(error);
                    }
                    resolve(response);
                });
            });
        };

        //get document
        let get = function(id, options){
            options = options || {};
            return new Promise(function(resolve, reject){
                collection.get(id, options, function(error, response){
                    if(error){
                        reject(error);
                    }
                    resolve(response);
                });
            });
        };

        //insert document
        let set = function(data){
            return new Promise(function(resolve, reject){
                collection.insert(data, function(error, response){
                    if(error){
                        reject(error);
                    }
                    resolve(response);
                });
            });
        };

        //update document
        let update = function(id, data){
            return new Promise(function(resolve, reject){
                collection.get(id, function(error, existing){ 
                    if(!error){
                        data._rev = existing._rev;
                        collection.insert(data, id, function(error, response){
                            if(error){
                                reject(error);
                            }
                            resolve(response);
                        });
                    }
                    else{
                        reject(error);
                    }
                });
            });
        };

        //delete document
        let remove = function(id, rev){
            return new Promise(function(resolve, reject){
                collection.destroy(id, rev, function(error, response){
                    if(error){
                        reject(error);
                    }
                    resolve(response);
                });
            });
        };

        //list
        let list = function(query){
            return new Promise(function(resolve, reject) {
                collection.list(query, function(error, data){
                    if(error){
                        reject(error);
                    }
                    resolve(data);

                });
            });
        };

        //bulk insert
        let bulk = function(data){
            let payload = {
                docs: data
            };
            return new Promise(function(resolve, reject){
                docllection.bulk(payload, function(error, response){
                    if(error){
                        reject(error);
                    }
                    resolve(response);
                });
            });
        };

        return {
            find: find,
            get: get,
            set: set,
            update: update,
            remove: remove,
            list: list,
            bulk: bulk,
        };
    };

    //revealed module
    return function(collectionName){
        return createInterface(getCollection(collectionName));
    };
};