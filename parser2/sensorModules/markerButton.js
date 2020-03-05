module.exports = {
    id: 0x03,
    length: 2,
    parser: (dataBuffer) => {
        if(dataBuffer) {
            return {
                marker: true,
            };
        }
        return {
            marker:false,
        }
    },
};