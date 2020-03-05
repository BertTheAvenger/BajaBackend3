module.exports = {
    id: 0x04,
    length: 9,
    parser: (dataBuffer) => {
    if(dataBuffer) {
        return {
            engineRotationSpeed: dataBuffer.readUInt16BE(1),
            rearWheelRotationSpeed: dataBuffer.readUInt16BE(3),
            frontLeftWheelRotationSpeed: dataBuffer.readUInt16BE(5),
            frontRightWheelRotationSpeed: dataBuffer.readUInt16BE(7)
        };
    }
    return {
        engineRotationSpeed: null,
        rearWheelRotationSpeed: null,
        frontLeftWheelRotationSpeed: null,
        frontRightWheelRotationSpeed: null
    };
},
};