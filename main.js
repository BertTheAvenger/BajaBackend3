const path = require("path");
global["rPath"] = (...arg) => path.join(__dirname, ...arg);

const express = require('express');
const fs = require("fs");
const {promisify} = require('util');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;




/*Setup the mongo client*/
const dbName = "baja";
const url = 'mongodb://localhost:27017';

let mongoclient = new MongoClient(url, {useUnifiedTopology: true});
let db = null;

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

    await setupDb();


    await setupServer();
    console.log(`CP Baja server started on port ${port}!`);
})();










/*Different functions below here to handle parts of startup*/
async function setupDb() {
    console.log("Connecting to DB...");
    await mongoclient.connect();
    db = await mongoclient.db(dbName);

    try {
        //await db.dropCollection("runs");
        //await db.dropCollection("runmeta");
    } catch (e) {}



    const runmeta = await db.collection("runmeta");
    const runs = await db.collection("runs");

    runs.createIndex({run: 1, time: 1});

    //Clean up runs - make the realtime static + complete, and delete uncompleted ingests.
    await runmeta.updateMany({realTime: true}, {$set : {realTime: false, completed: true}});

    //Clean out any runs that failed to fully parse.
    const uncompleted = await runmeta.find({completed: false}).toArray();
    if(uncompleted) {
        console.log(`Deleting ${uncompleted.length} incomplete runs.`);
        for(const v of uncompleted) {
            await db.collection("runmeta").deleteOne({run: v.run});
            await db.collection("runs").removeMany({run: v.run});
        }
    }

    console.log("Connected to DB.");
}










async function setupServer() {
    const apiPath = rPath("public/api/");
    app = express();
    app.use(express.json());


    /*Register all express API listeners.*/
    //This "one-liner" just loops through all JS in the api folder,
    // requires it with the express app and DB, and counts
    // how many it went through.
    let numRegistered = fs.readdirSync("public/api")
                          .reduce((count, v) => {
                              require(apiPath + v)(app, db);
                              return count+1;
                          }, 0);
    console.log(`Registered ${numRegistered} express API handlers.`);


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