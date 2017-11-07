"use strict";
const natural = require("natural");
const TfIdf = natural.TfIdf;
let threshold = {//thresholds for sentences
    entity: 0.8,
    keyword: 0.8
};
let ignored = [//ignored words
    "de", "da", "das", "dos",
    "que", "qual", "quais", "que em", "que se",
    "na", "nas", "nos", "se", "ao", "uma", "em", "por", "no",
    "vez", "para", "ser", "pelo", "ele", "ela", "E", "o", "sua", "a", "-", "é", "do"
];
let classes = {//classes for html replacement
    entities: "discovery entities",
    keywords: "discovery keywords",
    assuntos: "discovery assunto"
};
let categories = {};

module.exports = function(modules){

    //get area from defaults by id
    let getArea = function(id){
        let result = false;
        categories.area_judicial.options.forEach(function(area){
            if(area.id_area === id && result === false){
                result = area;
            }
        });
        return result;
    };

    //get grupo from defaults by id
    let getGrupo = function(id){
        let result = false;
        categories.grupo_de_assunto.options.forEach(function(grupo){
            if(grupo.id === id && result === false){
                result = grupo;
            }
        });
        return result;
    };

    //check ignored word
    let checkIgnored = function(string){
        let result = false;
        ignored.forEach(function(word){
            if(result === false && word.toLowerCase() == string.toLowerCase()){
                result = true;
            }
        });
        return result;
    };

    //match assuntos
    let matchAssuntos = function(text){
        let result = [];
        var tfidf = new TfIdf();
        tfidf.addDocument(text); //add text so we can calculate the tf-idf

        categories.assunto.options.forEach(function(assunto){
            try{
                let exp = assunto.value.toLowerCase();
                exp = exp.replace(/[-\/\|\.]/gi, " ");
                exp = exp.replace(/ {2,}/gi, " ");
                let regex = new RegExp(exp, "gi");
                let match = text.match(regex);
                if(match){
                    let entry = {
                        id: assunto.id,
                        groups_id: assunto.groups_id,
                        label: assunto.label,
                        value: assunto.value,
                        count: match.length, //** */
                        regex: regex,
                        source: "watson",
                        tfNormalized: tf_augmentedFrequencyNormalization(tfidf.tfidfs(exp, 0)[0], tf_getMostOccuringTerm(text))
                    };
                //
                    result.push(entry);
                }
            }
            catch(error){
                console.log(error);
            }
        });
            result.sort(function(a, b){//order by count desc
                return b.count - a.count;
            });
            return result;
        };

    /**
     * https://nlp.stanford.edu/IR-book/html/htmledition/maximum-tf-normalization-1.html
     * https://en.wikipedia.org/wiki/Tf%E2%80%93idf
     * @param {*} tf 
     * @param {*} maxTf 
     * @param {*} smoothingTerm 
     */
    let tf_augmentedFrequencyNormalization = function(tf, maxTf, smoothingTerm){
        let smoothing = smoothingTerm || 0.5;
        return smoothing + ((1 - smoothing) * (tf / maxTf));

    }

    /**
     * get the max / most ocorring term of the whole document
     * it is used in the normalization function
     * @param {*} text 
     */
    let tf_getMostOccuringTerm = function(text){
        let existingWords = [];
        let maxtf = 0;

        var tfidf = new TfIdf();
        tfidf.addDocument(text);
        
        text.split(" ").forEach(word =>{
                if(!checkIgnored(word)){ // if it is not one of the not to be considered words
                    if(existingWords.indexOf(word) == -1) // just to avoid check words twice
                        existingWords.push(word);
                        let tf = tfidf.tfidfs(word, 0)[0];
                        if(tf > maxtf) maxtf = tf;
                    
            }
        });

        return maxtf;
    }


    //get discovery sentences
    let getDiscoverySentences = function(data){
        let sentences = [];
        data.entities.forEach(function(entity){
            if(entity.relevance >= threshold.entity){
                sentences.push(" "+ entity.text +" ");
            }
        });
        data.keywords.forEach(function(keyword){
            if(keyword.relevance >= threshold.keyword){
                sentences.push(" "+ keyword.text +" ");
            }
        });
        return sentences;
    };

    //match assuntos with discovery data
    let matchDiscoveryAssuntos = function(sentences, matchedAssuntos){
        let result = [];
        let assuntos = {};
        sentences.forEach(function(sentence){
            try{
                let regex = new RegExp(sentence, "gi");
                matchedAssuntos.forEach(function(assunto){
                    if(assunto.value.match(regex)){
                        if(!assuntos.hasOwnProperty(assunto.id)){
                            assuntos[assunto.id] = {
                                value: assunto.value,
                                label: assunto.label,
                                groups_id: assunto.groups_id,
                                count: assunto.count || 0
                            };
                        }
                        else{
                            assuntos[assunto.id].count = assuntos[assunto.id].count + 1;
                        }
                    }
                });
            }
            catch(error){}
        });
        for(let assunto in assuntos){
            result.push({
                id: assunto,
                value: assuntos[assunto].value,
                label: assuntos[assunto].label,
                groups_id: assuntos[assunto].groups_id,
                count: assuntos[assunto].count,
                source: "watson"
            });
        };
        result = result.concat(matchedAssuntos);
            result.sort(function(a, b){//order by count desc
                return b.count - a.count;
            });
            return result;
        };

    //match assuntos and discovery assuntos to retrieve best suit groups
    let matchDiscoveryGrupos = function(discoveryAssuntos){
        let result = [];
        let grupos = {};
        discoveryAssuntos.forEach(function(assunto){
            if(assunto.hasOwnProperty("groups_id")){
                assunto.groups_id.forEach(function(group_id){
                    if(!grupos.hasOwnProperty(group_id)){
                        grupos[group_id] = getGrupo(group_id);
                        grupos[group_id].count = 1;
                    }
                    else{
                        grupos[group_id].count = grupos[group_id].count + 1;
                    }
                });
            }
        });
        for(let group_id in grupos){
            result.push({
                id: group_id,
                value: grupos[group_id].value,
                label: grupos[group_id].label,
                id_area: grupos[group_id].id_area,
                count: grupos[group_id].count,
                source: "watson"
            });
        }
            result.sort(function(a, b){//order by count desc
                return b.count - a.count;
            });
            return result;
        };

    //match group_id to retrieve correct area
    let matchDiscoveryAreas = function(discoveryGrupos){
        let result = [];
        let areas = {};
        discoveryGrupos.forEach(function(grupo){
            if(!areas.hasOwnProperty(grupo.id_area)){
                areas[grupo.id_area] = getArea(grupo.id_area);
                areas[grupo.id_area].count = 1;
            }
            else{
                areas[grupo.id_area].count = areas[grupo.id_area].count + 1;
            }  
        });
        for(let id_area in areas){
            result.push({
                id: id_area,
                value: areas[id_area].value,
                label: areas[id_area].label,
                count: areas[id_area].count,
                source: "watson"
            });
        }
            result.sort(function(a, b){//order by count desc
                return b.count - a.count;
            });
            return result;
        };


    //replace entity tags
    let replaceEntities = function(htmlString, entities){
        let regexes = [];
        entities.forEach(function(entity){
            if(entity.relevance >= threshold.entity && !checkIgnored(entity.text.toLowerCase())){
                try{
                    let sentiment = (entity.hasOwnProperty("sentiment")) ? entity.sentiment.type : "";
                    let regex = new RegExp(entity.text.toLowerCase(), "gi");
                    let replace = "<span class='"+ classes.entities +" "+ entity.type +" "+ sentiment +"'>"+ entity.text +"</span>";
                    regexes.push({
                        regex: regex,
                        replace: replace
                    });
                }
                catch(error){}
            }
        });
        regexes.forEach(function(entry){
            htmlString = htmlString.replace(entry.regex, entry.replace);
        });
        return htmlString;
    };

    //replace keyword tags
    let replaceKeywords = function(htmlString, keywords){
        let regexes = [];
        keywords.forEach(function(keyword){
            if(keyword.relevance >= threshold.keyword && !checkIgnored(keyword.text.toLowerCase())){
                try{
                    let regex = new RegExp(keyword.text.toLowerCase(), "gi");
                    let replace = "<span class='"+ classes.keywords +"'>"+ keyword.text +"</span>";
                    regexes.push({
                        regex: regex,
                        replace: replace
                    });
                }
                catch(error){}
            }
        });
        regexes.forEach(function(entry){
            htmlString = htmlString.replace(entry.regex, entry.replace);
        });
        return htmlString;
    };

    //replace matched assuntos
    let replaceAssuntos = function(htmlString, assuntos){
        assuntos.forEach(function(assunto){
            let regex = assunto.regex;
            let replace = "<span class='"+ classes.assuntos +"'>"+ assunto.value +"</span>";
            htmlString = htmlString.replace(regex, replace);
        });
        return htmlString;
    };

    //replave html tags
    let replaceHTML = function(htmlString, data){
        htmlString = replaceEntities(htmlString, data.entities);
        htmlString = replaceKeywords(htmlString, data.keywords);
        htmlString = replaceAssuntos(htmlString, data.assuntos);
        return htmlString;
    };
    
    //resolve data
    let resolve = function(discovery){
        let sentences = getDiscoverySentences(discovery); // lista key e entidades, unicidade(tira repeticao)
        let assuntos = matchAssuntos(discovery.html); // depois match com assuntos do cloudant
        let html = replaceHTML(discovery.html, { 
            entities: discovery.entities,
            keywords: discovery.keywords,
            assuntos: assuntos
        });
        let discoveryAssuntos = matchDiscoveryAssuntos(sentences, assuntos); //com keywords e entities, vejo assuntos que deram match
        //e tento dar match com watson, se der match prioriza senao vem abaixo
        let discoveryGrupos = matchDiscoveryGrupos(discoveryAssuntos); //dos assuntos que deram match(independetende de source)
        // resolve grupos apartir dos assuntos. 
        let discoveryAreas = matchDiscoveryAreas(discoveryGrupos); //idem para areas
        return {
            html: html,
            data: {
                area_judicial: {
                    options: discoveryAreas,
                    selected: (discoveryAreas.length > 0) ? discoveryAreas[0].value : ""
                },
                grupo_de_assunto: {
                    options: discoveryGrupos,
                    selected: (discoveryGrupos.length > 0) ? discoveryGrupos[0].value : ""
                },
                assunto: {
                    options: discoveryAssuntos,
                    selected: (discoveryAssuntos.length > 0) ? discoveryAssuntos.map(function(entry){
                        return entry.value;
                    }).join() : ""
                }
            }
        };
    };

    //update categories
    let updateCategories = function(){
        return new Promise(function(resolve, reject){
            modules.categories().then(function(data){
                categories = data;
                for(let prop in categories){
                    console.log(prop, categories[prop].options.length);    
                }
                resolve(categories);
            }).catch(function(error){
                console.log("failed to load categories data");
                reject(error);
            });
        });
    };

    //load categories data
    updateCategories();

    //revealed module
    return {
        resolve: resolve,
        update: updateCategories
    };
};