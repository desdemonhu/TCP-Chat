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
  this.nickname = getTime().toString();

  connection.socketPool.push(this);
}

///Get dateTime for starting nickname
function getTime(){
  let date = new Date();
  return date.getTime();
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

///Write message to requester shorthand
function writeMessage(socketIndex, message){
  connection.socketPool[socketIndex].socket.write(message);
  connection.socketPool[socketIndex].socket.write('\r\n');
}

///For messages sent to another user
function directMessage(nicknameIndex, message){
  connection.socketPool[nicknameIndex].socket.write(message);
  connection.socketPool[nicknameIndex].socket.write('\r\n');
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
      directMessage(nicknameIndex, `${connection.socketPool[socketIndex].nickname}(whispers): ${message}`);
    } else {
      writeMessage(socketIndex, `Can't find that user`);

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
    writeMessage(socketIndex, 'User list:');
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
      writeMessage(socketIndex, 'Name changed!');
      console.log(connection.socketPool[socketIndex].nickname);
    } else {
      writeMessage(socketIndex, 'That nickname is currently in use, please choose another. @list to see all current nicknames');
    }
  }
}

///help
let help = {
  name: 'help',
  description: 'Shows list of available commands',
  callback: function(socketIndex, text){
    writeMessage(socketIndex, 'Available commands are:');

    connection.commands.forEach((command) => {
      writeMessage(socketIndex, `@${command.name}: ${command.description}`);
    });
  }
}

///List commands to be used here. Help always has to be first
connection.commands = [help, dm, quit, list, nickname];
