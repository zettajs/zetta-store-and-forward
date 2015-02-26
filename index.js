var MemoryDb = require('./memory_db');

var StoreAndForward = module.exports = function(options) {
  var self = this;
  options = options || {};
  this.compare = options.compare || this._compare;
  this.db = options.db || new MemoryDb();
  
  return function() {
    self.init.apply(self, arguments);
  };
};

StoreAndForward.prototype.init = function(server) {
  var self = this;
  var peers = [];
  var orig = server.pubsub.publish;

  server.pubsub.publish = function(topic, event) {    
    if (peers.length < 1) {
      if (self.compare(topic)) {
        self.db.push(event);
      }
    }

    orig.apply(server.pubsub, arguments);
  }


  server.pubsub.subscribe('_peer/connect', function(e, msg) {
    if (!msg.peer.url) return;
    peers.push(msg.peer.url);
    
    function send() {
      var event = self.db.shift();
      if (event === null) {
        return;
      }
      console.log(event.topic)
      orig.call(server.pubsub, event.topic, event);
      setTimeout(send, 10);
    }
    send();
  });

  server.pubsub.subscribe('_peer/disconnect', function(e, msg) {
    if (!msg.peer.url) return;
    var idx = peers.indexOf(msg.peer.url);
    if (idx > -1) {
      idx.splice(idx, 1)
    }
  });

};

StoreAndForward.prototype._compare = function(topic) {
  return /.*\/.*\/.*/.test(topic);
};


