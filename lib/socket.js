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

let parseMessage = function(command, text){
  let textArray = text.split(' ')
  return text.split('@'+ command).join(' ').split(textArray[1]).join(' ').trim();
}

let findNickname = function(text){
  let textArray = text.split(' ');

  return connection.socketPool.map(function(e){
    return e.nickname;
  }).indexOf(textArray[1].toUpperCase());
}

///commands
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

connection.commands = [dm];
