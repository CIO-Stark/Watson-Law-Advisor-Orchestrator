"use strict";
module.exports = function(app, grupos){
    //list all grupos
    app.get("/grupo/load", function(req, res){
    	grupos.load().then(function(data){
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
    //get grupo by id
    app.get("/grupo/get/:id", function(req, res){
    	let id = req.params.id || false;
    	if(id){
    		grupos.get(id).then(function(data){
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
    			message: "grupos:get -> invalid id"
    		});
    	}
    });
    //get grupo by id_area
    app.get("/grupo/getByArea/:id_area", function(req, res){
    	let area = req.params.id_area || false;
    	if(area){
    		grupos.getByArea(area).then(function(data){
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
    			message: "grupos:getByArea -> invalid id"
    		});
    	}
    });
    //create grupo
    app.post("/grupo/create", function(req, res){
    	let id = req.body.id || false;
    	let label = req.body.label || false;
    	let value = req.body.value || false;
    	let id_area = req.body.id_area || false;
    	if(id && label && value && id_area){
    		grupos.create({
    			id: id,
    			label: label,
    			value: value,
    			id_area: id_area
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
    			message: "grupos:create -> invalid data"
    		});
    	}
    });
    //update grupo
    app.post("/grupo/update", function(req, res){
    	let label = req.body.label || false;
    	let value = req.body.value || false;
    	let id_area = req.body.id_area || false;
    	let id_grupo = req.body.id || false;
    	let id = req.body._id || false;
    	let rev = req.body._rev || false;
    	if(label && value && id_area && id_grupo && id && rev){
    		grupos.update({
    			label: label,
    			value: value,
    			id_area: id_area,
    			id: id_grupo
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
    			message: "grupos:update -> invalid data"
    		});
    	}
    });
    //remove grupo
    app.post("/grupo/remove", function(req, res){
    	let id = req.body._id || false;
    	let rev = req.body._rev || false;
    	if(id && rev){
    		grupos.remove(id, rev).then(function(data){
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
    			message: "grupos:remove -> invalid id"
    		});
    	}
    });
};