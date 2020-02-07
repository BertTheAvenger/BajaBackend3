const metaCollection = "runmeta";
const fs = require("fs");
const {Writable, Transform} = require("stream");
const runCollection = "runs";
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
        const meta = await this.db.collection(metaCollection);
        await meta.insertOne({
                                 runId: runId,
                                 size: file.size,
                                 fileName: file.originalname,
                                 realTime: false,
                                 completed: false,
                                 timeIngested: Date.now()
                             });
        const ps = new ParserStream();
        const rs = fs.createReadStream(rPath(uploadDir, file.filename));
        rs.pipe(ps);

    }

};

class ParserStream extends Transform {
    constructor() {
        super();
        this.buf = Buffer.from([]); //Empty buffer.
    }

    _transform(chunk, encoding, next) {
        let buf = this.buf = Buffer.concat([this.buf, chunk]);
        while (true) {
            console.log(buf);
            const len = buf.readInt16LE(0);
            if(len < 4 || len > 1024) { buf = buf.slice(1); console.log("Invalid parse."); continue;}
            if(len > buf.length) {break;}
            buf = buf.slice(len);
            console.log(buf);
        }
    }

    flush(next) {

    }
}

class DBwriter extends Writable {
    constructor() {
        super();

    }

}