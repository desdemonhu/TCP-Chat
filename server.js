'use strict';

const connection = require('./lib/socket.js');

const net = require('net');
const port = 3000;
const server = net.createServer((client) => {
  console.log('Client Connected');
  client.on('end', () => {
    console.log('Client disconnected.');
  })

  client.write('Welcome to my world\r\n');
});


server.on('connection', (socket) => {
  //assign username
  //socketPool
  connection.clientCreate(socket);
  console.log(connection.socketPool);
  let textString = '';

  socket.on('data', (buffer) => {
    ///buffer has text.toString
    let text = buffer.toString();
    textString += text;
// \u0003  \u0085  \u000D
    if(text == '\u0085'){
      console.log(textString);
    }

  })

  /// .write to write to socketPool
});
server.listen(port, () => {
    console.log("Listening on port: ", port);
  });
