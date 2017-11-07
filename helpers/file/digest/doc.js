"use strict";
let watson = require('watson-developer-cloud');

module.exports = function(setup){
    //watson document conversion instance
    let instance = watson.document_conversion({
        username: setup.username,
        password: setup.password,
        version: setup.version,
        version_date: setup.version_date
    });

    //convert doc
    let convert = function(file, conversion_target, config){
        return new Promise(function(resolve, reject){
            instance.convert({
                file: file,
                conversion_target: conversion_target || "NORMALIZED_HTML",
                config: config || undefined
            }, function(error, response){
                if(error){
                    reject(error);
                }
                else{
                    resolve(response);
                }
            });
        });
    };

    //revealed module
    return {
        convert: convert
    };
};