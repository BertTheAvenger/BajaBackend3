const cliProgress = require('cli-progress');


const fs = require("fs");
const {Writable} = require("stream");
const {ParserStream} = require(rPath("PacketParser"));

const uploadDir = "uploads";

module.exports = class FileIngester {
    constructor(file, database) {
        this.file = file;
        this.db = database;

    }

    async run(file = this.file) {
        const runId = file.filename;
        if (!file) {
            console.error("TRIED TO INGEST NONEXISTANT FILE!");
            return;
        }
        const meta = await this.db.meta;
        if ((await meta.find({size: file.size}, {fileName: file.originalname}).toArray()).length > 0) {
            console.log("File already exists!");
            return;
        }
        await meta.insertOne({
            run: runId,
            size: file.size,
            fileName: file.originalname,
            realTime: false,
            completed: false,
            timeIngested: Date.now()
        });

        const ps = new ParserStream(file.size);
        const rs = fs.createReadStream(rPath(uploadDir, file.filename));
        const bs = new DBWriter(this.db, runId, file.size);

        rs.pipe(ps).pipe(bs);
        await new Promise(res => bs.on("finish", () => res()));

        console.log("Upload done.");

        await meta.updateOne({run: runId}, {$set: {completed: true}});


    }
};

class DBWriter extends Writable {
    constructor(database, id, totalSize) {
        super({objectMode: true});
        this.db = database;
        this.runs = null;
        this.id = id;

        this.loadBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        this.loadBar.start(totalSize, 0);
    }

    _write(packets, encoding, next) {
        this.insertPackets(packets).then(next);
    }

    async insertPackets(packets) {
        if (!this.runs) {
            this.runs = await this.db.runs;
        }
        let bytes = 0;
        const ops = packets.map(v => {
            bytes += v.size;
            v.run = this.id;
            return {insertOne: {"document": v}}
        });


        await this.runs.bulkWrite(ops);
        this.loadBar.increment(bytes);
    }

    _final(next) {
        this.loadBar.stop();
        next();
    }
}