var zetta = require('zetta');
var LED = require('zetta-led-mock-driver');
var Photocell = require('zetta-photocell-mock-driver');

var StoreAndForward = require('../');


// store data in circular buffer up to 1mb, to .restore path for all devices and streams. 
// when a peer is not subscribed to stream
var app = new StoreAndForward({ maxSizeKb: 1000,
                                location: './.restore'
                              });

var z = zetta()
  .use(app)
  .use(LED)
  .use(Photocell)
  .listen()

setTimeout(function(){
  z.link('http://localhost:5000')
}, 30000)






