const N = 4; // number of bytes to encode message length
const NodePort = require("./../index");
const reader = new NodePort.Reader(process.stdin, N);
const writer = new NodePort.Writer(process.stdout, N);

reader.on("data", str => {
  if (str === "HALT") {
    writer.write("stopping");
    process.exit(0);
  }
  var data = JSON.parse(str);
  writer.write(`x was ${data.x}`);
});

process.stdin.on("end", () => { process.exit(0); });
