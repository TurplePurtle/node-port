const EE = require("events");

function Reader(stream, N) {
  this.stream = stream;
  this.N = N || 4;
  this.encoding = "utf8";
  this.emitter = new EE();
  this.lengthBuffer = new Buffer(this.N);
  this.encodedLength = 0;
  this.gotLength = false;
  this.initialized = false;
  this.init();
}

Reader.prototype.init = function() {
  if (this.initialized) return;
  var reader = this;
  this.stream.on("readable", () => reader.readHandler());
  this.initialized = true;
};

Reader.prototype.readHandler = function() {
  if (!this.gotLength) {
    this.stream.setEncoding("binary");
    var chunk = this.stream.read(this.N);
    if (!chunk) return;
    if (typeof chunk === "string") {
      this.lengthBuffer.write(chunk, 0);
    } else {
      chunk.copy(this.lengthBuffer, 0);
    }
    this.encodedLength = this.lengthBuffer.readUIntBE(0, this.N);
    this.gotLength = true;
  }
  if (this.gotLength) {
    this.stream.setEncoding(this.encoding);
    var chunk = this.stream.read(this.encodedLength);
    if (!chunk) return;
    this.emitter.emit("data", { target: this.stream, data: chunk });
    this.gotLength = false;
  }
};

Reader.prototype.on = function() {
  this.emitter.on.apply(this.emitter, arguments);
};

module.exports = Reader;
