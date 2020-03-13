const stream = require("stream");
const fs = require("fs");




class parser2 extends stream.Transform {
    constructor(indexedModules){
        super({objectMode: true});
        this.indexedModules = indexedModules;

        console.log(this.indexedModules);

        this.buffer = Buffer.alloc(0);
    }

    _transform(chunk, encoding, next) {
        this.buffer = Buffer.concat([this.buffer, chunk]);

        while(this.buffer.length > 2){
            const len = this.buffer.readUInt16BE(0);

            if(this.buffer.length < len) {break;}

            let packet = this.buffer.slice(0, len);

            const ops = this.packetToObj(packet);
            if(!ops) {console.error("Error parsing packet"); return;}

            let packetObj = {};

            this.indexedModules.forEach((v, i) => {
                const op = ops[i] ? ops[i] : null;
                const data = v.parser(op); //Pass either buffer or null. Returns a flat arr with parsed data.

                packetObj = {...packetObj, ...data}; //Add the data to the packet object.

            });

            //console.log(packetObj);
            this.push(packetObj);

            this.buffer = this.buffer.slice(len);

        }

        console.log("next");
        next();


    }

    /*This function takes a Buffer (representing a packet from the length bytes to checksum) and generates a sparse array
    * containing buffers that represent sensor data present in the packet. The index of a given sensor buffer is its
    * ID as defined in the corrosponding sensorModule.
    * */
    packetToObj(packetBuf) {
        const len = this.buffer.readUInt16BE(0);
        const checksum = this.buffer.readUInt16BE(packetBuf.length - 2); //Checksum is inclusive - start one further back.

        packetBuf = packetBuf.slice(2, packetBuf.length - 2); //Slice off the length and checksum - we already have it.


        let ops = []; //Any index i holds either a Buffer reigon reference if there was data in the packet, or nothing.
        while (packetBuf.length > 0) { //Loop until packetBuffer has been fully read.

            let id = packetBuf.readUInt8(0);
            let sensModule = this.indexedModules[id];
            if(!sensModule) {
                console.error(`Sensor parser module not found for ID ${id}`);
                return null;
            }

            //Add the sensor buffer to the operation array.
            ops[sensModule.id] = packetBuf.slice(0, sensModule.length);

            packetBuf = packetBuf.slice(sensModule.length);
        }

        return ops;
    }
}

class CSVTransform extends stream.Transform {
    constructor() {
        super({objectMode: true});
        this.initialized = false;
    }
    _transform(packetObj, encoding, next) {
        if(!this.initialized) {
            this.push(Object.keys(packetObj).reduce((acc, key) => acc + `${key},`, "") + "\n");
            this.initialized = true;
        }
        const str = Object.values(packetObj).reduce((acc, val) => acc + `${val ? val : ""},`, "") + "\n";
        this.push(str);
        next();
    }

}

let modules = fs.readdirSync("./sensorModules").map(v => require(__dirname + "\\sensorModules\\" + v));
let indexedModules = [];
modules.forEach(v => indexedModules[v.id] = v); //Map the modules to the sparse array.
let rs = fs.createReadStream("../testFiles/D15.bin");
let csv = new CSVTransform(indexedModules);
let p2 = new parser2(indexedModules);

rs.pipe(p2).pipe(csv).pipe(fs.createWriteStream("test.csv"))

module.exports = {CSVTransform, parser2};