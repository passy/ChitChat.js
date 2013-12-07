var uuid = require('node-uuid');

var Message = require('./message');

var Room = function() {
  this.users_array = [];
  // reciver is added in user's joinRoom function
  this.id = uuid.v1(); // get uuid
  this.messages = [];
  return this;
};

Room.prototype.addMessage = function (sender, msg) {
  var message = new Message(sender, msg, this.id);
  sender.updateTimestamp();
  this.messages = this.messages.concat(message);

  sender.socket.broadcast.to(this.id).emit('message', {'room_id': this.id, 'message': message});
};

module.exports = Room;

