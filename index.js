var url = require('url');
var MemoryDb = require('./memory_db');

var StoreAndForward = module.exports = function(options) {
  var self = this;
  options = options || {};

  this.peer = (options.peer) ? url.parse(options.peer).hostname : null;
  this.compare = options.compare || this._compare;
  this.db = options.db || new MemoryDb();  
  this.sendDelay = options.sendDelay || 25;

  this._connectedPeers = [];
  this._orig = null;
  this._server = null;

  return function() {
    self._init.apply(self, arguments);
  };
};

StoreAndForward.prototype._init = function(server) {
  var self = this;
  this._orig = server.pubsub.publish;
  this._server = server;
  server.pubsub.publish = function(topic, event) {    
    // if not connected and topic matches
    if (!self.isConnected() && self.compare(topic)) {
      self.db.push(event);
    }
    self._orig.apply(server.pubsub, arguments);
  };

  server.pubsub.subscribe('_peer/connect', function(e, msg) {
    if (!msg.peer.url) return;

    // if filtering by peer
    if (self.peer && url.parse(msg.peer.url).hostname !== self.peer) {
      return;
    }
    
    self._connectedPeers.push(msg.peer.url);
    // delay for a moment while pubsub is being connected to
    setTimeout(self._onConnected.bind(self), 250);
  });

  server.pubsub.subscribe('_peer/disconnect', function(e, msg) {
    if (!msg.peer.url) {
      return
    }

    // if filtering by peer
    if (self.peer && url.parse(msg.peer.url).hostname !== self.peer) {
      return;
    }

    var idx = self._connectedPeers.indexOf(msg.peer.url);
    if (idx > -1) {
      self._connectedPeers.splice(idx, 1)
    }
  });

};

StoreAndForward.prototype.isConnected = function() {
  return this._connectedPeers.length > 0;
};

StoreAndForward.prototype._onConnected = function() {
  var self = this;
  function send() {
    // if not connected anymore, stop sending
    if (!self.isConnected()) {
      return;
    }

    var event = self.db.shift();
    if (event === null) {
      return;
    }

    self._publishEvent(event.topic, event);
    setTimeout(send, self.delay);
  }
  send();
};

StoreAndForward.prototype._publishEvent = function(topic, event) {
  var listeners = this._server.pubsub._listeners;
  if (!listeners[topic]) {
    return;
  }
  
  listeners[topic].forEach(function(l) {
    // dont send to local pubsub
    if (typeof l.listener !== 'object') {
      return;
    }
    
    l.actual(event);
  });
};

StoreAndForward.prototype._compare = function(topic) {
  return /.*\/.*\/.*/.test(topic);
};


