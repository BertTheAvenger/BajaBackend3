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
            if(buf.length <= 0) {
                this.push(null);
                next();
                return;
            }

            const len = buf.readUInt16BE(0);
            if(len < 4 || len > 1024) { buf = buf.slice(1); console.log("Invalid parse."); continue;}
            if(len > buf.length) {break;}

            parsePacket(buf.slice(0, len));


            buf = buf.slice(len);
            next();
            return;
            //console.log(buf);
        }
    }

    _flush(next) {
        console.log("Flushed");
    }
}

class DBwriter extends Writable {
    constructor() {
        super();

    }

}

function parsePacket(buf) {
    if(buf.length < 4) {return null;}
    const len = buf.readUInt16BE(0);
    const packetObj = {};

    for(let head = 2; head < (len - 2); head) {
        switch (buf[head]) {
            case 0x01: //Time packet - len 5
                packetObj.time = buf.readUInt32BE(head + 1);
                head += 5;
                break;
            case 0x03: //Marker button - len 2
                packetObj.marker = true;
                head += 2;
                break;
            default:
                console.log(`Unsupported sensor ID: ${buf[head]}`);
                return null;
        }

    }
    console.log(packetObj);
    return packetObj;
}