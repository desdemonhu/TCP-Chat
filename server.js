'use strict';

const connection = require('./lib/socket.js');

const net = require('net');
const port = 3000;
const server = net.createServer((client) => {
  console.log('Client Connected');
  client.on('end', () => {
    console.log('Client disconnected.');
  })

  client.write('Welcome to my world\r\n\r\n');
});


server.on('connection', (socket) => {

  console.log(connection.socketPool);
  let textString = '';

  let socketIndex = connection.clientCreate(socket);

  socket.on('data', (buffer) => {
    let text = buffer.toString();
    textString += text;

///When somene hits return start checking if it's a command or send data
    if(text == '\r\n'){
      console.log(`${socketIndex}: ${textString}`);

      if(textString.startsWith('@')){
        let command = textString.slice(1).split('\r\n').join(' ').split(' ');
        console.log(command);

        ///Looks for command in the command list
        let commandIndex = connection.commands.map(function(e){
          return e.name
        }).indexOf(command[0]);
        console.log(commandIndex);

        ///If command is in list
        if(commandIndex > -1){
          connection.commands[commandIndex].callback(socketIndex, textString);
          textString = '';
        }else {
          socket.write('command not found');
          socket.write(`Available commands are:\r\n`);
          ///TODO: This should be the help menu

          textString = '';
        }
      } else {
        ///Send message to everyone if not a command
        connection.socketPool.forEach((client) => {
          client.socket.write(`${connection.socketPool[socketIndex].nickname}: ${textString}`);
          textString = '';
        })
      }
    }

  })
});

server.listen(port, () => {
    console.log("Listening on port: ", port);
  });
