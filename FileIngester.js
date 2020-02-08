const metaCollection = "runmeta";
const fs = require("fs");
const {Writable, Transform} = require("stream");
const {parseBuffer, parsePacket} = require(rPath("PacketParser"));

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
        if((await meta.find({size: file.size}, {fileName: file.originalname}).toArray()).length > 0) {console.log("File already exists!"); return;}
        await meta.insertOne({
                                 run: runId,
                                 size: file.size,
                                 fileName: file.originalname,
                                 realTime: false,
                                 completed: false,
                                 timeIngested: Date.now()
                             });

        const ps = new ParserStream();
        const rs = fs.createReadStream(rPath(uploadDir, file.filename));
        const bs = new DBWriter(this.db, runId);
        rs.pipe(ps).pipe(bs);

        await bs.finished();
        console.log("Upload done.");

        meta.updateOne({run: runId}, {$set: {completed: true}});


    }
};

class ParserStream extends Transform {
    constructor() {
        super({objectMode: true});
        this.buf = Buffer.from([]); //Empty buffer.
        this.packetCount = 0;
    }

    _transform(chunk, encoding, next) {
        this.buf = Buffer.concat([this.buf, chunk]);
        let packets = parseBuffer(this.buf);
        this.packetCount += packets.length;
        packets.forEach(p => this.push(p));
        next();
    }

    _flush(next) {
        console.log(`Parsed ${this.packetCount} packets.`);
        //console.log("Flushed");
    }
}

class DBWriter extends Writable {
    constructor(database, id) {
        super({objectMode: true});
        this.db = database;
        this.runs = null;
        this.id = id;
    }

    _write(packet, encoding, next) {
        this.insertPacket(packet).then(next);
    }

    finished() {
        const self = this;
        return new Promise( (res, rej) => {
            self.on("end", () => {res();})
        });
    }

    async insertPacket(packet){
        if(!this.runs) {
            this.runs = await this.db.collection("runs");
        }

        packet.run = this.id;

        await this.runs.insertOne(packet);
    }

    _final(next) {

    }
}
