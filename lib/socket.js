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
  this.nickname = 'PUMPKIN'; ///TODO: Make this a unique id. Epoch time? But still needs to be a string for toUpperCase

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

  console.log(connection.socketPool);

  return connection.socketPool.map(function(e){
    return e.nickname;
  }).indexOf(textArray[1].toUpperCase());
}

////COMMANDS////

///Direct message a user @dm <nickname> <message>
let dm = {
  name: 'dm',
  description: '<nickname> Directly message another user by nickname',
  callback: function(socketIndex, text){
    let message = parseMessage(this.name, text);
    let nicknameIndex = findNickname(text);

    if(nicknameIndex > -1){
      connection.socketPool[nicknameIndex].socket.write(`${connection.socketPool[socketIndex].nickname}(whispers): ${message}`);
      connection.socketPool[socketIndex].socket.write('\r\n');
    } else {
      connection.socketPool[socketIndex].socket.write(`Can't find that user`);
      connection.socketPool[socketIndex].socket.write('\r\n');
    }
  }
}

///Sends FIN packet
let quit = {
  name: 'quit',
  description: 'Disconnect from chat',
  callback: function(socketIndex, text){
    connection.socketPool[socketIndex].socket.end();
    connection.socketPool.splice(connection.socketPool[socketIndex],1);
  }
}

///Lists all users to user who submitted request
let list = {
  name: 'list',
  description: 'Lists all current users.',
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
  description:'<nickname> Allows you to change your nickname',
  callback: function(socketIndex, text){
    let textArray = text.replace('\r\n', '').split(' ');

    ///Check if nickname is currently in use
    let nickNameIndex = findNickname(text.replace('\r\n', '').toUpperCase());

    if(nickNameIndex === -1){
      connection.socketPool[socketIndex].nickname = textArray[1].toUpperCase();
      connection.socketPool[socketIndex].socket.write('Name changed!\r\n');
      console.log(connection.socketPool[socketIndex].nickname);
    } else {
      connection.socketPool[socketIndex].socket.write('That nickname is currently in use, please choose another. @list to see all current nicknames\r\n');
    }
  }
}

///help
let help = {
  name: 'help',
  description: 'Shows list of available commands',
  callback: function(socketIndex, text){

    connection.socketPool[socketIndex].socket.write('\r\nAvailable commands are:\r\n');

    connection.commands.forEach((command) => {
      connection.socketPool[socketIndex].socket.write(`@${command.name}: ${command.description}\r\n`);
    });
  }
}

///List commands to be used here. Help always has to be first
connection.commands = [help, dm, quit, list, nickname];
