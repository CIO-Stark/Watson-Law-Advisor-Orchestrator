"use strict";
require('dotenv').config({ silent: true });
let env = require("cfenv").getAppEnv();

//middleware load
let app = require("express")();
let compression = require("compression");
let cors = require("cors");
let bodyParser = require("body-parser");
let cookieSession = require("cookie-session");
let cookieParser = require("cookie-parser");
let cloudant = require("./helpers/cloudant")(JSON.parse(process.env.CLOUDANT));
let buildCategories = require("./helpers/file/categories")(cloudant);
let resolveData = require("./helpers/file/resolveData")({
	cloudant: cloudant,
	categories: buildCategories
});

//express setup
app.use(compression());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(cookieParser());
app.use(cookieSession({
    secret: "starkSquad",
    maxAge: 86400000
}));

//app modules
let file = require("./helpers/file")(cloudant, resolveData.resolve);
let auth = require("./helpers/auth")(cloudant("users"));
let users = require("./helpers/users")(cloudant("users"));
let areas = require("./helpers/areas")(cloudant("area_judicial"));
let grupos = require("./helpers/grupos")(cloudant("grupo_de_assunto"), resolveData.update);
let assuntos = require("./helpers/assuntos")(cloudant("assunto"), resolveData.update);

//set routes
require("./routes")(app, {
    file: file,
    auth: auth,
    users: users,
    areas: areas,
    grupos: grupos,
    assuntos: assuntos,
    updateCategories: resolveData.update
});

//start server
app.listen(env.port, function(){
    console.log("law advisor orchestrator running on port", env.port);
});