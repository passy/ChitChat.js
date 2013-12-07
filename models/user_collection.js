var UserCollection = function () {
  this.userList = {};
};

UserCollection.prototype.findBySocketId = function (socket_id) {
  // console.log(this.userList);

  var uuid_keys = Object.keys(this.userList);
  var user;
  for (var i = 0; i < uuid_keys.length; i++) {
    user = this.userList[uuid_keys[i]];
    if (typeof user !== "undefined" &&
        user &&
        typeof user.socket !== "undefined" &&
        user.socket &&
        typeof user.socket.id !== "undefined" &&
        user.socket.id === socket_id) {
      return user;
    }
  }
};

UserCollection.prototype.removeUser = function (user_id) {
  delete this.userList[user_id];
}

// UserCollection.prototype.findUser = function (userId) {
//    if (this.userList[userId]) {
//     return this.userList[userId];
//     } else {
//       var user = new User(socket);
//       this.addUser(user);
//       // more stuff here
//     }
// };

// UserCollection.prototype.addUser = function (user) {
//   this.userList = this.userList.concat(user)
// };
module.exports = UserCollection;
