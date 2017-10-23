'use strict';

const net = require('net');
const port = 3000;
const server = net.createServer();

server.on('connection', (socket) => {
  //assign username
  //socketPool
  console.log(port);
  server.on('data', (buffer) => {
    ///buffer has text.toString
  })

  /// .write to write to socketPool

});
