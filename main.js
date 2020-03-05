const path = require("path");
global["rPath"] = (...arg) => path.join(__dirname, ...arg);

const express = require('express');
const fs = require("fs");
const {promisify} = require('util');
const DBDriver = require("./DBDriver");
const api = require("./public/api/apiDefs");



/*Setup the mongo client*/
const url = 'mongodb://localhost:27017';

let dbDriver = new DBDriver(url, {useUnifiedTopology: true});

/*Setup the express server*/
const port = 80;
const uploadDir = "uploads";

let app = null; //Keep a global reference to the express server.



/*Immediately invoke an async func to start everything up*/
(async () => {
    //Delete any previously uploaded files B/C they probably didn't finish.
    if(fs.existsSync(rPath(uploadDir))) {
        fs.readdirSync(rPath(uploadDir)).forEach(v => fs.unlinkSync(rPath(uploadDir, v)));
    }

    await dbDriver.initialize();

    await setupServer();

    await dbDriver.getData("00885f09d5c9a096ef1f85079a76d64e", 866);


    console.log(`CP Baja server started on port ${port}!`);
})();







async function setupServer() {
    const apiPath = rPath("public/api/");
    app = express();

    //Use the JSON middleware for ez clap JSON parsing.
    app.use(express.json());

    /*Register all API definitions from apiDefs.js.*/

    for(let def of api) {
        def.intermediates = def.intermediates instanceof Array ? def.intermediates : [];
        app[def.method](def.path, ...def.intermediates, (...arg) => def.handler(dbDriver, ...arg));
    }

    /*Setup static server*/
    app.use(express.static("public/www/"));

    //Register the error page last.
    app.get('*', function(req, res){
        res.status(404).sendFile("public/www/err/404.html", {root: __dirname});
    });

    //Finally, start the server up.
    console.log("Starting express server...");
    await promisify(app.listen.bind(app))(port);
    console.log("Express server started.");
}