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

    //login user
    let login = function(username, password){
        return new Promise(function(resolve, reject){
            load().then(function(data){
                data.forEach(function(doc){
                    if(doc.email === username && doc.password === password){
                        resolve(doc);
                    }
                });
                reject(false);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //logout user
    let logout = function(username){
        return new Promise(function(resolve, reject){
            load().then(function(data){
                data.forEach(function(doc){
                    if(doc.email === username){
                        resolve(true);
                    }
                });
                reject(false);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //revealed module
    return {
        load: load,
        login: login,
        logout: logout
    };
};