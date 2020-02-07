const multer = require("multer");
const FileIngester = require(rPath("FileIngester.js"));

const upload = multer({dest: "uploads/"});

let db = null;


module.exports = (app, dbClient) => {
    db = dbClient;
    app.post("/api/uploadrun/", upload.single("run"),  (req, res, next) => {
        console.log(req.file);
        res.status(200).send("OK");
        let fi = new FileIngester(req.file, db);
        fi.run().then(() => console.log(`Ingest of ${req.file.originalname} completed`));
    });
};