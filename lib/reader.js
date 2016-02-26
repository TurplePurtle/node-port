const EE = require("events");

function Reader(stream, N, opts) {
  this.stream = stream;
  this.N = N || 4;
  this.emitter = new EE();
  this.lengthBuffer = new Buffer(this.N);
  this.encodedLength = 0;
  this.gotLength = false;
  this.initialized = false;
  this.debug = opts && opts.debug;
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
    var chunk = this.stream.read(this.N);
    if (!chunk) return;
    if (typeof chunk === "string") {
      for (var i = 0; i < 4; i++) {
        this.lengthBuffer[i] = chunk.charCodeAt(i);
      }
    } else {
      chunk.copy(this.lengthBuffer, 0);
    }
    this.encodedLength = this.lengthBuffer.readUIntBE(0, this.N);
    if (this.debug) {
      console.log(`Length: ${this.encodedLength} bytes`);
    }
    this.gotLength = true;
  }
  if (this.gotLength) {
    var chunk = this.stream.read(this.encodedLength);
    if (!chunk) return;
    if (this.debug) {
      console.log(`Received ${chunk.length} bytes`);
    }
    var chunkAsString = chunk.toString();
    this.emitter.emit("data", chunkAsString);
    this.gotLength = false;
  }
};

Reader.prototype.on = function() {
  this.emitter.on.apply(this.emitter, arguments);
};

module.exports = Reader;
