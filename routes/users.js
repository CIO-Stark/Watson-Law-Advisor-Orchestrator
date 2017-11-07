"use strict";
module.exports = function(app, users){
    //load all users
    app.get("/users/load", function (req, res) {
        users.load().then(function(data){
            res.send({
                status: true,
                data: data
            });
        }).catch(function(error){
            res.send({
                status: false,
                message: "users:load -> error"
            });
        });
    });
    //retrieve user by id
    app.get("/users/:id", function (req, res) {
        let id = req.params.id || false;
        if(id){
            users.get(id).then(function(data){
                res.send({
                    status: true,
                    data: data
                });
            }).catch(function(error){
                res.send({
                    status: false,
                    error: error,
                    message: "users:get -> error"
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "users:get -> invalid id"
            });
        }
    });
    //create user
    app.post("/users/create", function(req, res){
        let email = req.body.email || false,
        password = req.body.password || false,
        profile = req.body.profile || "user";
        if(email && password){
            users.create({
                email: email,
                password: password,
                profile: profile
            }).then(function(response){
                res.send({
                    status: true,
                    data: response
                });
            }).catch(function(error){
                res.send({
                    status: false,
                    error: error,
                    message: "user:create -> error"
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "user:create -> invalid data"
            });
        }    
    });
    //update user
    app.post("/users/update", function(req, res){
        let email = req.body.email || false,
        password = req.body.password || false,
        profile = req.body.profile || "user",
        id = req.body._id;
        if(email && password && id){
            users.update({
                email: email,
                password: password,
                profile: profile
            }, id).then(function(response){
                console.log("user update", response);
                res.send({
                    status: true,
                    data: {
                        id: id,
                        rev: response.rev
                    }
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
                message: "user:update -> invalid data"
            })
        };
    });
    //delete user
    app.post("/users/delete", function(req, res){
        let id = req.body._id || false,
        rev = req.body._rev || false;
        if(id && rev){
            users.remove(id, rev).then(function(data){
                res.send({
                    status: true,
                    data: data
                });
            }).catch(function(error){
                res.send({
                    status: false,
                    error: error,
                    message: "user:delete -> error"
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "user:delete -> invalid user"
            });
        }
    });
};