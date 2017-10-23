'use strict';

const net = require('net');
const port = 3000;
const server = net.createServer();

server.listen(port, ()=>{
    console.log("Listening on port: ", port);
  });

server.on('connection', (socket) => {
  //assign username
  //socketPool

  server.on('data', (buffer) => {
    ///buffer has text.toString
  })

  /// .write to write to socketPool
});
