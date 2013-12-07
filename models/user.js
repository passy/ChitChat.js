// create a new user when an app connects if not in userList
var uuid = require('node-uuid');
var ExternalUser = require('./external_user');
var Room = require('./room');

var User = function (socket) {
  this.socket = socket;
  this.id = uuid.v1(); // make uuid
  this.username = null;
  this.photo_url = null;
  this.status = "connected";
  this.timestamp = new Date();
  this.rooms = [];
  // emit user uuid back to user, store as cookie
  return this;
};

// user has changed pages load all data again
User.prototype.reconnect = function (socket, chatterApp) {
  this.socket = socket;
  this.status = this.username !== null ? "active" : "connected";
  this.updateTimestamp();
  var users_rooms = [];
  for (var i = 0; i < this.rooms.length; i ++) {
    this.socket.join(this.rooms[i]);
    users_rooms = users_rooms.concat(chatterApp.currentRoomList.roomList[this.rooms[i]]);
  }

  var external_user = this.createExternalUser();
  ////////////////////////// come back adn add stuff here ///////////////
  this.socket.emit('reconnect', { 'other_users': chatterApp.externalUserList.userList,  'rooms': users_rooms, 'user': external_user });
};

User.prototype.logIn = function (socket, username, photo_url) {
  this.socket = this.socket !== socket ? socket : this.socket;
  this.username = username;
  this.photo_url = photo_url || null;
  this.status = "active";
  this.updateTimestamp();
  return this;
};

User.prototype.disconnect = function (chatterApp, io) {
  this.status = "disconnected";
  this.updateTimestamp();
  var self = this;
  console.log('in disconnect function');
  // users will disconnect every time they naviagate to a new page, and also when they
  //  log out or exit the site. After 60 seconds, we should check if they are still on the
  //   site or if they have truly left the site.
  setTimeout(function() {
    self.leftSite(chatterApp, io)
  }, 5000); // ~1 min
};

User.prototype.leftSite = function (chatterApp, io) {
  console.log('in leftsite function');
  // only tak ethis action if the user has not reconnected to the site
  if (this.status === "disconnected") {
    for (var i = 0; i < this.rooms.length; i ++) {
      var room = chatterApp.currentRoomList[this.rooms[i]];
      if (typeof room !== "undefined") {
        room.users_array.splice(this.rooms.users_array.indexOf(this.id),1);
      }
    }
    chatterApp.currentUserList.removeUser(this.id);
    chatterApp.externalUserList.removeUser(this.id);
    io.sockets.emit('userDisconnected', this.id ); // to all other clients
    // browsers should remove client from all rooms.
    this.socket = null;
    console.log(chatterApp.currentUserList);
  }
};

User.prototype.joinRoom = function (room, inviter) {
  this.rooms = this.rooms.concat(room.id);
  room.users_array = room.users_array.concat(this.id);
  this.socket.join(room.id);
  this.socket.broadcast.to(room.id).emit('addedUserToRoom', {'room': room, 'newUser': this.id, 'sender': inviter.id});
};

User.prototype.createRoom = function(receiver) {
  var room = new Room();
  this.rooms = this.rooms.concat(room.id);
  room.users_array = room.users_array.concat(this.id);
  this.socket.join(room.id);
  receiver.joinRoom(room, this);
  return room;
}

User.prototype.leaveRoom = function (room_id, chatterApp) {
  this.rooms.splice(this.rooms.indexOf(room_id), 1);
  var room = chatterApp.currentRoomList.roomList[room_id];
  room.users_array.splice(room.users_array.indexOf(this.id),1);
  this.socket.leave(room.id);
  this.socket.broadcast.to(room_id).emit('leftRoom', {'user_id': this.id, 'room_id': room_id});
  this.updateTimestamp();
};

User.prototype.updateTimestamp = function () {
  this.timestamp = new Date();
};

User.prototype.createExternalUser = function() {
  var user = new ExternalUser(this);
  return user;
};

module.exports = User;

