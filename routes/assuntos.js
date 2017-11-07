"use strict";
module.exports = function(app, assuntos){
    //list all assuntos
    app.get("/assunto/load", function(req, res){
    	assuntos.load().then(function(data){
    		res.send({
    			status: true,
    			data: data
    		});
    	}).catch(function(error){
    		res.send({
    			status: false,
    			message: error.message
    		});
    	});
    });
    //get assunto by id
    app.get("/assunto/get/:id", function(req, res){
    	let id = req.params.id || false;
    	if(id){
    		assuntos.get(id).then(function(data){
    			res.send({
    				status: true,
    				data: data
    			});
    		}).catch(function(error){
    			res.send({
    				status: false,
    				message: error.message
    			});
    		});
    	}
    	else{
    		res.send({
    			status: false,
    			message: "assuntos:get -> invalid id"
    		});
    	}
    });
    //get assunto by id_grupo
    app.get("/assunto/getByGrupo/:id_grupo", function(req, res){
    	let grupo = req.params.id_grupo || false;
    	if(grupo){
    		assuntos.getByGrupo(grupo).then(function(data){
    			res.send({
    				status: true,
    				data: data
    			});
    		}).catch(function(error){
    			res.send({
    				status: false,
    				message: error.message
    			});
    		});
    	}
    	else{
    		res.send({
    			status: false,
    			message: "assuntos:getByGrupo -> invalid id"
    		});
    	}
    });
    //create assunto
    app.post("/assunto/create", function(req, res){
    	let label = req.body.label || false;
    	let value = req.body.value || false;
    	let groups_id = req.body.groups_id || false;
    	if(label && value && groups_id){
    		assuntos.create({
    			label: label,
    			value: value,
    			groups_id: groups_id
    		}).then(function(data){
    			res.send({
    				status: true,
    				data: data
    			});
    		}).catch(function(error){
    			res.send({
    				status: false,
    				message: error.message
    			});
    		});
    	}
    	else{
    		res.send({
    			status: false,
    			message: "assuntos:create -> invalid data"
    		});
    	}
    });
    //update assunto
    app.post("/assunto/update", function(req, res){
    	let label = req.body.label || false;
    	let value = req.body.value || false;
    	let groups_id = req.body.groups_id || false;
    	let id = req.body._id || false;
    	let rev = req.body._rev || false;
    	if(label && value && groups_id && id && rev){
    		assuntos.update({
    			label: label,
    			value: value,
    			groups_id: groups_id
    		}, id).then(function(data){
    			res.send({
    				status: true,
    				data: data
    			});
    		}).catch(function(error){
    			res.send({
    				status: false,
    				message: error.message
    			});
    		});
    	}
    	else{
    		res.send({
    			status: false,
    			message: "assuntos:update -> invalid data"
    		});
    	}
    });
    //remove assunto
    app.post("/assunto/remove", function(req, res){
    	let id = req.body._id || false;
    	let rev = req.body._rev || false;
    	if(id && rev){
    		assuntos.remove(id, rev).then(function(data){
    			res.send({
    				status: true,
    				data: data
    			});
    		}).catch(function(error){
    			res.send({
    				status: false,
    				message: error.message
    			});
    		});
    	}
    	else{
    		res.send({
    			status: false,
    			message: "assuntos:remove -> invalid id"
    		});
    	}
    });
};