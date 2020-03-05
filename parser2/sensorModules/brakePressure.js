module.exports = {
    id: 0x05,
    length: 5,
    parser: (dataBuffer) => {
        if(dataBuffer) {
            return {
                frontBrakePressure: dataBuffer.readUInt16BE(1),
                rearBrakePressure: dataBuffer.readUInt16BE(3),
            };
        }
        return {
            frontBrakePressure: null,
            rearBrakePressure: null,
        }
    },
};