"use strict";
module.exports = function(fields){
    //thresholds
    let threshold = {
        entity: 0.8,
        keyword: 0.8
    };
    //classes for html replacement
    let classes = {
        fields: "discovery fields",
    };

    //get sisjur fields
    let getCampos = function(htmlString){
        let result = {};
        fields.forEach(function(field){
            field.regex.forEach(function(reg){
                let regex = new RegExp(reg, "gi");
                let match = htmlString.match(regex);
                if(match){
                    if(!result.hasOwnProperty(field.value)){
                        result[field.value] = {
                            label: field.label,
                            value: field.value,
                            regex: regex,
                            data: match
                        };
                    }
                    else{
                        result[field.value].data = result[field.value].data.concat(match);
                    }
                }
            })
        });
        return result;
    }

    //parse result
    let parseCampos = function(campos){
        let result = [];
        for(let campo in campos){
            result.push({
                label: campos[campo].label,
                value: campos[campo].value,
                data: campos[campo].data
            });
        }
        return result;
    };

    //replace fields on htmlString
    let replaceFields = function(htmlString, campos){
        for(let campo in campos){
            campos[campo].data.forEach(function(match){
                let replace = "<span class=\""+ classes.fields +"\"  data-campo=\""+ campo +"\">"+ match +"</span>";
                htmlString = htmlString.replace(match, replace);
            });
        }
        return htmlString;
    };

    //replave html tags
    let replaceHTML = function(htmlString, data){
        htmlString = replaceFields(htmlString, data.campos);
        return htmlString;
    };
    
    //resolve data
    let resolve = function(data){
        let campos = getCampos(data.html);
        let html = replaceHTML(data.html, {
            campos: campos
        });
        return {
            html: html,
            data: parseCampos(campos)
        };
    };

    //revealed module
    return function(data){
        return resolve(data);
    };
};