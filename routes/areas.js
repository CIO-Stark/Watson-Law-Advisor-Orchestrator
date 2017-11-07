"use strict";
module.exports = function(app, areas){
    //list all areas
    app.get("/area/load", function(req, res){
    	areas.load().then(function(data){
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
    //get area by id
    app.get("/area/get/:id", function(req, res){
    	let id = req.params.id || false;
    	if(id){
    		areas.get(id).then(function(data){
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
    			message: "areas:get -> invalid id"
    		});
    	}
    });
    //create area
    app.post("/area/create", function(req, res){
    	let id_area = req.body.id_area || false;
    	let label = req.body.label || false;
    	let value = req.body.value || false;
    	if(label && value && id_area){
    		areas.create({
    			id_area: id_area,
    			label: label,
    			value: value
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
    			message: "areas:create -> invalid data"
    		});
    	}
    });
    //update area
    app.post("/area/update", function(req, res){
    	let id = req.body._id || false;
    	let id_area = req.body._id || false;
    	let label = req.body.label || false;
    	let value = req.body.value || false;
    	if(id && label && value && id_area){
    		areas.update({
    			id_area: id_area,
    			label: label,
    			value: value
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
    			message: "areas:update -> invalid data"
    		});
    	}
    });
    //remove area
    app.post("/area/remove", function(req, res){
    	let id = req.body._id || false;
    	let rev = req.body._rev || false;
    	if(id && rev){
    		areas.remove(id, rev).then(function(data){
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
    			message: "areas:remove -> invalid id"
    		});
    	}
    });
};