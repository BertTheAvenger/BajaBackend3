/*Time value parser*/

//Format: {<uint8 id>, <uint16 (Time interval)>, <uint32 (Time)>}
module.exports = {
    name: "",
    id: 0x06,
    length: 5,
    parser: (dataBuffer) => {
        this.time = this.time === undefined ? 0 : this.time; //Init the time value.
        this.interval = this.interval === undefined ? 0 : this.interval; //Init the time value.


        if(dataBuffer) {
            return {
                time: this.time = dataBuffer.readUInt32BE(3),
            };
        }

        this.time += this.interval;
        return {
            //time: this.time
        }
    }
};