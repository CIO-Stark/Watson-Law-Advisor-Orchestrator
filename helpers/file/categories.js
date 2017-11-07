"use strict";
let databases = [];

//load from db
let load = function(db){
    let query = {
        "selector": {
            "_id": {
                "$gt": null
            }
        }
    };
    return new Promise(function(resolve, reject){
        db.find(query).then(function(response){
            resolve(response.docs);
        }).catch(function(error){
            reject(error);
        });
    });
};

//load all data from given databases
let loadAll = function(){
    let promises = [];
    return new Promise(function(resolve, reject){
        databases.forEach(function(db){
            promises.push(load(db));
        });
        Promise.all(promises).then(function(data){
            resolve(data);
        }).catch(function(error){
            reject(error);
        });
    });
};

//build categories from loaded data
let build = function(){
    return new Promise(function(resolve, reject){
        loadAll(databases).then(function(data){
            let areas = data[0];
            let grupos = data[1];
            let assuntos = data[2];
            resolve({
                area_judicial: {
                    options: areas,
                    selected: ""
                },
                grupo_de_assunto: {
                    options: grupos,
                    selected: ""
                },
                assunto: {
                    options: assuntos,
                    selected: ""
                }
            });
        }).catch(function(error){
            reject(error);
        });
    });
};

//revealed module
module.exports = function(cloudant){
    databases = [
        cloudant("area_judicial"),
        cloudant("grupo_de_assunto"),
        cloudant("assunto")
    ];
    return function(){
        return new Promise(function(resolve, reject){
            build().then(function(data){
                resolve(data);
            }).catch(function(error){
                reject(error);
            })
        });
    };
};