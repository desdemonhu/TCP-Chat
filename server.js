'use strict';

const net = require('net');
const port = 3000;
const server = net.createServer((client) => {
  console.log('Client Connected');
  client.on('end', () => {
    console.log('Client disconnected.');
  })

  client.write('hello\r\n');
  client.pipe(client);
});


server.on('connection', (socket) => {
  //assign username
  //socketPool
  console.log(socket);

  socket.on('data', (buffer) => {
    ///buffer has text.toString
    let text = buffer.toString();
    console.log(text);
  })

  /// .write to write to socketPool
});
server.listen(port, () => {
    console.log("Listening on port: ", port);
  });
