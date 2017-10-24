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

  console.log(connection.socketPool);
  let textString = '';

  let socketIndex = connection.clientCreate(socket);

  socket.on('data', (buffer) => {
    ///buffer has text.toString
    let text = buffer.toString();
    textString += text;
// \u0003  \u0085  \u000D
    if(text == '\r\n'){
      console.log(textString);

      if(textString.startsWith('@')){
        let command = textString.slice(1).split(' ');
        console.log(command);
        let commandIndex = connection.commands.map(function(e){
          return e.name
        }).indexOf(command[0]);

        console.log(commandIndex);
        if(commandIndex > -1){
          connection.commands[commandIndex].callback(socketIndex, textString);
          textString = '';
        }else {
          socket.write('command not found');
          socket.write(`Available commands are: ${connection.commands}`);
          textString = '';
        }
      } else {
        connection.socketPool.forEach((client) => {
          client.socket.write(`${client.nickname}: ${textString}`);
          textString = '';
        })
      }
    }

  })

  /// .write to write to socketPool
});
server.listen(port, () => {
    console.log("Listening on port: ", port);
  });
