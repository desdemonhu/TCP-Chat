'use strict';

let connection = module.exports = {};

connection.socketPool = [];

connection.clientCreate = function(socket){
  let newConnection = new Client(socket);
}

function Client(socket){
  this.socket = socket;
  this.id = connection.socketPool.length +1;
  this.nickname = 'Pumpkin';

  connection.socketPool.push(this);
}
