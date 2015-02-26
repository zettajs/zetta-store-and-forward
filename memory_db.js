var RingBuffer = require('ringbufferjs');

var Storage = module.exports = function(location) {
  this.size = 100000;
  this._ring = new RingBuffer(this.size);
};

Storage.prototype.push = function(event) {
  return this._ring.enq(event);
};

Storage.prototype.shift = function() {
  if (this._ring.size() === 0) {
    return null;
  }
  return this._ring.deq();
};
