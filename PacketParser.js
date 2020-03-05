
function parsePacket(buf) {
    if(buf.length < 4) {return null;}
    const len = buf.readUInt16BE(0);
    const packetObj = {size: buf.length};

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
            case 0x04:
                head += 9;
                break;
            default:
                console.log(`Unsupported sensor ID: ${buf[head]}`);
                return null;
        }

    }
    return packetObj;
}







function parseBuffer(buf) {
    let packets = [];
    while (true) {
        //Not enough to parse a length, break and get more stuffs.
        if(buf.length < 2) { break; }

        const len = buf.readUInt16BE(0);

        //If not enough buffer to parse the packet, break and get more.
        if(len > buf.length) { break; }

        //If the length is invalid, slice the first byte off and try again on remaining.
        if(len < 4 || len > 1024) { buf = buf.slice(1); console.log("Invalid parse."); continue;}


        let packetObj = parsePacket(buf.slice(0, len));

        //If the parsed packet is invalid, slice first byte off and try again on remaining.
        if(!packetObj) {buf = buf.slice(1); console.log("Invalid Packet."); continue;}

        packets.push(packetObj);
        buf = buf.slice(len);
    }
    return {packets, buf};
}


class ParserStream extends require("stream").Transform {
    constructor(totalSize) {
        super({objectMode: true});
        this.buf = Buffer.from([]); //Empty buffer.
    }

    _transform(chunk, encoding, next) {
        this.buf = Buffer.concat([this.buf, chunk]);
        let {packets, buf} = parseBuffer(this.buf);
        this.buf = buf;
        this.push(packets);

        next();
    }
}

class ArraySeparator extends require("stream").Transform {
    constructor(totalSize) {
        super({objectMode: true});
    }

    _transform(arr, encoding, next) {
        arr.forEach(v => this.push(v));
        next();
    }
}

module.exports = {parseBuffer, parsePacket, ParserStream, ArraySeparator};