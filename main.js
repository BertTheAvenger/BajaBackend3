const path = require("path");
global["rPath"] = (...arg) => path.join(__dirname, ...arg);

const express = require('express');
const fs = require("fs");
const {promisify} = require('util');
const bodyParser = require('body-parser');

const DBDriver = require("./DBDriver");



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

    await dbDriver.intialize();

    await setupServer();

    await dbDriver.getData("00885f09d5c9a096ef1f85079a76d64e", 866);


    console.log(`CP Baja server started on port ${port}!`);
})();







async function setupServer() {
    const apiPath = rPath("public/api/");
    app = express();
    app.use(express.json());


    /*Register all express API listeners.*/
    //This "one-liner" just loops through all JS in the api folder,
    // requires it with the express app and DB, and counts
    // how many it went through.
/*
    let numRegistered = fs.readdirSync("public/api")
                          .reduce((count, v) => {
                              require(apiPath + v)(app, db);
                              return count+1;
                          }, 0);
    console.log(`Registered ${numRegistered} express API handlers.`);

*/

    //Register statics

    app.use(express.static("public/www/"));



    //Register the error page last.
    app.get('*', function(req, res){
        res.status(404).sendFile("public/www/err/404.html", {root: __dirname});
    });

    console.log("Starting express server...");
    await promisify(app.listen.bind(app))(port);
    console.log("Express server started.");
}