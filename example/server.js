var zetta = require('zetta');
var LED = require('zetta-led-mock-driver');
var Photocell = require('zetta-photocell-mock-driver');
var StoreAndForward = require('../');

// store last 100,000 events when disconnceted from localhost:5000
var app = new StoreAndForward({ });

zetta()
  .name('peer-1')
  .use(app)
  .use(LED)
  .link('http://localhost:2000')
  .listen(1335);




