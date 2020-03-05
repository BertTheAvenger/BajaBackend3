const stream = require("stream");

const MAX_PACKET_LENGTH = 1024;
const MIN_PACKET_LENGTH = 4;

const typeOp = {
    uint16_t: Buffer.prototype.readUInt16BE,
    uint32_t: Buffer.prototype.readUInt32BE,
    bool: Buffer.prototype.readUInt8,
};

//Parses a passed buffer into an array of packet objects.
class BufferParserStream extends stream.Transform{
    constructor(definition) {
        super({objectMode: true});
        this.buffer =  Buffer.alloc(0);

        this.parser = new PacketParser(definition);

        /*Helper Functions*/
        this.bShift = (i = 1) => this.buffer.slice(i);
        this.isBufferReadable = (b) => //Conditions that will cause new data to be fetched.
                (b.length >= MIN_PACKET_LENGTH) &&
                (b.length > b.readUInt16BE(0));
        this.invalid = 0;
        this.valid = 0;

    }
    _transform(binChunk, encoding, next) {
        this.buffer = Buffer.concat([this.buffer, binChunk]);
        this.bufferArr = [];

        while (this.isBufferReadable(this.buffer)) {

            const len = this.buffer.readUInt16BE(0);

            /*Sanity checks*/

            if(len < MIN_PACKET_LENGTH || len > MAX_PACKET_LENGTH) {this.bShift(); this.invalid++; continue;}
            //Parse dat shitz
            const parsed = this.parser.parse(this.buffer.slice(0, len));
            if(!parsed) {this.bShift(); this.invalid++; console.log("Invalid parse!"); continue;}
            //console.log(len);


            this.bufferArr.push(parsed);

            this.buffer = this.buffer.slice(len);





        }
        this.push(this.bufferArr);
        next();
    }
}

class PacketParser {
    constructor(definition) {
        this.definition = definition;
    }

    parse(packet){
        //console.log(packet);
        //let obj = {};
        //this.parseInto(obj, packet);
        //return obj;
        let packetObj = {};
        let p = packet.slice(2); //Cut off length bytes.
        while (p.length > 2) {
            let sensorId = p[0];

            const def = this.definition[sensorId];
            //console.log(def);
            if(!def) {console.error(`Unsupported sensor ID ${sensorId} encountered!`); return null;}
            let res = this.parseSensor(p, def.format);
            if(!res) {console.error(`Error parsing sensor!`); return null;}
            packetObj = {...packetObj, ...res}; //Combine the new data with the existing data.
            p = p.slice(def.size);
        }
        return packetObj;
    }

    parseInto(target, packet) {

    }

    parseSensor(sensorBuf, format) {
        let sensorObj = {};
        const keys = Object.keys(format);
        keys.forEach((key) => { //Each format is [<offset>, <dataType>]
            const offset = format[key][0];
            const dataType = format[key][1];

            //console.log(typeOp["uint32_t"]);
            let op = typeOp[dataType];
            if(!op) {console.error(`Unsupported dataType ${dataType} encountered!`); return null;}
            //console.log(dataType);
            sensorObj[key] =  op.bind(sensorBuf)(offset);
        });
        return sensorObj;
    }

}

class ArrStreamSplitter extends stream.Transform {
    constructor() {
        super({objectMode: true});

    }

    _transform(arr, encoding, next) {
        arr.forEach(v => this.push(v));
        next();
    }
}

class PacketCsvParser extends stream.Transform {
    constructor(definition) {
        super({objectMode: true});
        this.definition = definition;
        this.keys = Object.values(definition).reduce((acc, def) => [...acc, ...Object.keys(def.format)] , []);
        console.log(this.keys);
        this.push(this.keys.reduce((acc, v) => acc + `${v}, `, "") + "\n"); //Push the inital line to the csv.
    }

    _transform(packetObj, encoding, next) {
        //const str = "";
        const str = this.keys.reduce((acc, v) => acc + (packetObj[v] ? `${packetObj[v]}, ` : `, `), "") + "\n";
        this.push(str);
        next();
    }


}

module.exports = {BufferParserStream, PacketParser, ArrStreamSplitter, PacketCsvParser};