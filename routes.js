"use strict";
module.exports = function(app, modules){
    require("./routes/auth")(app, modules.auth);
    require("./routes/users")(app, modules.users);
    require("./routes/areas")(app, modules.areas);
    require("./routes/grupos")(app, modules.grupos);
    require("./routes/assuntos")(app, modules.assuntos);
    require("./routes/file")(app, modules.file, modules.updateCategories);
//health
    app.get("/", function(req, res){
        res.send({
           status: true
       });
    });
};