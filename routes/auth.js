"use strict";
module.exports = function(app, auth){
    //login
    app.post("/auth/login", function(req, res){
        let username = req.body.username || false,
        password = req.body.password || false;
        if(username && password){
            auth.login(username, password).then(function(data){
                res.send({
                    status: true,
                    user: {
                        email: data.email,
                        profile: data.profile
                    }
                });
            }).catch(function(error){
                res.send({
                    status: false,
                    message: error.message,
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "auth:login -> invalid request"
            });
        }
    });
    //logout
    app.post("/auth/logout", function(req, res){
        let username = req.body.username || false;
        if(username){
            auth.logout(username).then(function(data){
                res.send({
                    status: true
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
                message: "auth:logout -> invalid request"
            });
        }
    });
};