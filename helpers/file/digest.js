"use strict";
let config = require("./digest/config");
let translate = require("./digest/translate")(JSON.parse(process.env.TRANSLATE));
let nlu = require("./digest/nlu")(JSON.parse(process.env.NLU));
let conversion = require("./digest/doc")(JSON.parse(process.env.DOC_CONVERSION));
let discovery = require("./digest/discovery")(JSON.parse(process.env.DISCOVERY));

//parse identify language response
let parseIdentifyLanguage = function(data){
    if(data.length > 0){
        let valid = false;
        let language = data[0].language;
        let confidence = Number(data[0].confidence);
        data.forEach(function(entry){
            if(Number(entry.confidence) > confidence){
                confidence = Number(entry.confidence);
                language = entry.language;

            }
        });
        config.validLanguages.forEach(function(validLanguage){
            if(valid === false && validLanguage === language){
                valid = true;
            }
        });
        if(valid){
            return language;
        }
    }
    return false;
};

//parse translation response
let parseTranslateResponse = function(data){
    if(data.length > 0){
        if(typeof(data) == "string"){
            return data;
        }
        else{
            if(data[0].translation.length > 0){
                return data[0].translation;
            } 
        }
    }
    return false;
};

//translate keywords
let translateKeywords = function(data){
    return new Promise(function(resolve, reject){
        //build one string from keywords texts
        let text = [];
        data.forEach(function(entry){
            text.push(entry.text);
        });
        text = text.join(";");
        //build response
        translate.translate({
            source: "en",
            target: "pt",
            text: text
        }).then(function(response){
            let translated = response.translations[0].translation;
            translated = translated.split(";");
            translated.forEach(function(entry, index){
                data[index].text = entry;
            });
            resolve(data);
        }).catch(function(error){
            reject(error);
        });
    });
};

//translate categories
let translateCategories = function(data){
    return new Promise(function(resolve, reject){
        //build one string from categories texts
        let text = [];
        data.forEach(function(entry){
            let label = entry.label.replace(/(\/)/gi, " ");
            text.push(label);
        });
        text = text.join(";");
        //build response
        translate.translate({
            source: "en",
            target: "pt",
            text: text
        }).then(function(response){
            let translated = response.translations[0].translation;
            translated = translated.split(";");
            translated.forEach(function(entry, index){
                data[index].label = entry;
            });
            resolve(data);
        }).catch(function(error){
            reject(error);
        });
    });
};

//processing flow
let flux = function(file){
    return new Promise(function(resolve, reject){
        let result = {
            language: false,
            translations: {
                english: false,
                portuguese: false
            },
            sentiment: false,
            entities: [],
            categories: [],
            keywords: [],
            relations: [],
            concepts: []
        };
        //convert doc to text
        conversion.convert(file).then(function(text){
            if(text.length >= 100){
                result.html = text;
                //identify text language
                translate.identify(text).then(function(identify_response){
                    result.language = parseIdentifyLanguage(identify_response.languages);
                    //translate to english
                    translate.translate({
                        source: result.language,
                        target: "en",
                        text: text
                    }).then(function(english_response){
                        result.translations.english = parseTranslateResponse(english_response.translations || english_response);
                        //translate to portuguese
                        translate.translate({
                            source: result.language,
                            target: "pt",
                            text: text
                        }).then(function(portuguese_response){
                            result.translations.portuguese = parseTranslateResponse(portuguese_response.translations || portuguese_response);
                            //nlu process
                            nlu.text(result.translations.english.substring(0, 9999)).then(function(nlu_response){
                                result.sentiment = nlu_response.sentiment.document;
                                result.entities = nlu_response.entities;
                                result.categories = nlu_response.categories;
                                result.keywords = nlu_response.keywords;
                                result.relations = nlu_response.relations;
                                result.concepts = nlu_response.concepts;
                                //translate keywords
                                translateKeywords(result.keywords).then(function(keywords_response){
                                    result.keywords = keywords_response;
                                    //translate categories
                                    translateCategories(result.categories).then(function(categories_response){
                                        result.categories = categories_response;
                                        //return
                                        resolve(result);
                                    })
                                    //translate categories error
                                    .catch(function(error){
                                        console.log("flux process error: translate:categories", error);
                                        reject(error);
                                    })
                                })
                                //translate keywords error
                                .catch(function(error){
                                    console.log("flux process error: translate:keywords", error);
                                    reject(error);
                                })
                            })
                            //nlu error
                            .catch(function(error){
                                console.log("flux process error: nlu:text", error);
                                reject(error);
                            });
                        })
                        //translate to portuguese error
                        .catch(function(error){
                            console.log("flux process error: translate:portuguese", error);
                            reject(error);
                        });
                    })
                    //translate to english error
                    .catch(function(error){
                        console.log("flux process error: translate:english", error);
                        reject(error);
                    });
                })
                //identify language error
                .catch(function(error){
                    console.log("flux process error: translate:identify", error);
                    reject(error);
                });
            }
            else{
                reject({
                    message: "Falha ao ler arquivo"
                });
            }
        })
        //convert doc error
        .catch(function(error){
            console.log("flux process error: conversion:convert", error);
            reject(error);
        });
    });
};

//revealed module
module.exports = flux;