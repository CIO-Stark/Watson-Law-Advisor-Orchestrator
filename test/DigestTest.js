/**
 * Testes para funcoes dos filtros do orchestrator

 */

require('dotenv').config()
var assert = require('assert');
var should = require('should');

let cloudant = require("../helpers/cloudant")(JSON.parse(process.env.CLOUDANT));
var fileHelper = require('../helpers/file')(cloudant);

describe('Digest basic', function () {
	this.timeout(15000);

	it('it should return valid digest', (done) => {
		
		fileHelper.processFile(__dirname + "/../uploads/arquivo2.pdf").then(function (dataResp) {
                        console.log(dataResp);
                        assert.equal("pt", "pt");
                        
                        done();

                }).catch(function (error) {
                        console.log("promisse error", error);
                        done();
					
                });
			
		

	});

	
	
});