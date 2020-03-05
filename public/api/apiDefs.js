const Schema = require("validate/build/schema");

const defGetData = {
    path: "/api/getdata/",
    method: "post",
    schema: new Schema({
        run: {
            type: String,
            required: true,
        },
        times: {
            type: Array,
            required: true,
            each: {type: Number}
        },
        range: {
            type: Number,
            required: false,
        },

    }),
    handler: async function(dbClient, req, res){
        console.log(req.body);
        let bd = req.body;

        let errs = this.schema.validate(bd);
        if(errs.length > 0) {
            let errStr = errs.reduce((acc, v) => (v + "\n"), "");
            res.status(400).json({error: errStr});
        } else {
            let data = await dbClient.getData(bd.run, bd.times, bd.range);
            let filteredData = data.map(v => {
                let {_id, ...data} = v;
                return data;
            });
            res.status(200).json(filteredData);
        }
    }
};

/*RUN UPLOAD API DEF*/
const multer = require("multer");
const FileIngest = require(rPath("FileIngester.js"));
const upload = multer({dest: "uploads/"}); //Puts uploads in /uploads.

const defUploadRun = {
    path: "/api/uploadrun/",
    method: "post",
    intermediates: [upload.single("run")],
    handler: (db, req, res) => {
        console.log("Starting new ingest.");
        let fi = new FileIngest(req.file, db);
        fi.run().then(() => console.log(`Ingest of ${req.file.originalname} completed`));
        res.status(200).send("OK");
    }


};

const  defGetRuns = {
    path: "/api/getruns/",
    method: "post",
    handler: async (db, req, res) => {
        let data = await db.meta.find({});
        res.status(200).json(data);
    }
};

const defTopkek = {
    path: "/api/top/",
    method: "get",
    handler:async (db, req, res) => {
        res.status(200).send("kek");
    }
};

const api = [defGetData, defUploadRun, defGetRuns, defTopkek];

module.exports = api;