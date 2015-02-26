# Zetta Store and Forward

Buffer device data going to the cloud until a peer is connected or reconnects. This module is an app that plugs into [Zetta](http://zettajs.org) By default this module stores events in an in memory FIFO that starts to overwrite it's self after 100,000 events. However this can be swapped out using the `db` option.

## Install

`npm install zetta-store-and-forward`

## Usage


```js

var zetta = require('zetta');
var Photocell = require('zetta-photocell-mock-driver');
var StoreAndForward = require('zetta-store-and-forward');

var store = new StoreAndForward();

zetta()
  .use(store)
  .use(Photocell)
  .link('http://localhost:5000')
  .listen(1337);

```

## Init Options

`peer`: A peer's url that is used in `.link` this will limit store and forward to store when that particular peer is disconnected. Otherwise without this option data is stored when at least 1 peer is connected.

`db`: The actual db implementation used by the app. See below about Db

`sendDelay`: When sending device data back to the connected peer, set a delay between each event sent in ms.

`compare`: Provide a compare function on the event topic. This could be used to store only a particular device type when not connected.

### Storage Implementation

#### .push(event)

Add an event to the storage

#### .shift()

Remove an event from the storage. Must return `null` when storage is empty.
