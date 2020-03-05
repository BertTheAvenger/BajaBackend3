const {BufferParserStream, PacketParser, ArrStreamSplitter, PacketCsvParser} = require("./dataParser");
const fs = require("fs");

const stream = require("stream");
const defintion = JSON.parse(fs.readFileSync("./sensorDef.json"));
fs.createReadStream("./testFiles/D11.bin")
  .pipe(new BufferParserStream(defintion))
  .pipe(new ArrStreamSplitter())
  .pipe(new PacketCsvParser(defintion))
  .pipe(fs.createWriteStream("./test.csv"));