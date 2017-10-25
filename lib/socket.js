'use strict';

let connection = module.exports = {};

connection.socketPool = [];

///creates client, adds to socketPool, and returns index for refernce in command callbacks
connection.clientCreate = function(socket){
  let newConnection = new Client(socket);
  return newConnection.id;
}

function Client(socket){
  this.socket = socket;
  this.id = connection.socketPool.length;
  this.nickname = 'PUMPKIN';

  connection.socketPool.push(this);
}

///Takes a line removes everything but the message. used for @dm
let parseMessage = function(command, text){
  let textArray = text.split(' ')
  return text.split('@'+ command).join(' ').split(textArray[1]).join(' ').trim();
}

///Returns index of a nickname in the connection.socketPool
let findNickname = function(text){
  let textArray = text.split(' ');
  let nickname = textArray[1].toUpperCase();

  return connection.socketPool.map(function(e){
    return e.nickname;
  }).indexOf(nickname);
}

////COMMANDS////

///Direct message a user @dm <nickname> <message>
let dm = {
  name: 'dm',
  callback: function(socketIndex, text){
    let message = parseMessage(this.name, text);
    let nicknameIndex = findNickname(text);

    if(nicknameIndex > -1){
      connection.socketPool[nicknameIndex].socket.write(`${connection.socketPool[socketIndex].nickname}(whispers): ${message}`);
    } else {
      connection.socketPool[socketIndex].socket.write(`Can't find that user`);
    }
  }
}

///Sends FIN packet
let quit = {
  name: 'quit',
  callback: function(socketIndex, text){
    connection.socketPool[socketIndex].socket.end();
    connection.socketPool.splice(connection.socketPool[socketIndex],1);
  }
}

///Lists all users to user who submitted request
let list = {
  name: 'list',
  callback: function(socketIndex, text){
    connection.socketPool[socketIndex].socket.write('User list: ');
    connection.socketPool.forEach((client) => {
      connection.socketPool[socketIndex].socket.write(`${client.nickname}, `);
    })
    connection.socketPool[socketIndex].socket.write('\r\n');
  }
}

///Change your nickname
let nickname = {
  name: 'nickname',
  callback: function(socketIndex, text){
    let textArray = text.split(' ');
    connection.socketPool[socketIndex].nickname = textArray[1].toUpperCase();
    connection.socketPool[socketIndex].socket.write('Name changed!\r\n');
    console.log(connection.socketPool[socketIndex].nickname);
  }
}

///help

///List commands to be used here
connection.commands = [dm, quit, list, nickname];
