/*Time value parser*/

//Format: {<uint8 id>, <uint16 (Time interval)>, <uint32 (Time)>}
module.exports = {
    id: 0x01,
    length: 5,
    parser: (dataBuffer) => {
        if(dataBuffer) {
            return {
                time: dataBuffer.readUInt32BE(1),
            };
        }
        return {time: null}
    }
};