function Writer(stream, N) {
  this.stream = stream;
  this.N = N || 4;
  this.lengthBuffer = new Buffer(this.N);
}

Writer.prototype.write = function(msg) {
  this.lengthBuffer.writeUIntBE(msg.length, 0, this.N);
  this.stream.write(this.lengthBuffer);
  this.stream.write(msg);
};

module.exports = Writer;
