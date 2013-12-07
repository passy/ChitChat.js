var ExternalUserCollection = function () {
  this.userList = {};
};

ExternalUserCollection.prototype.removeUser = function (user_id) {
  delete this.userList[user_id];
}

module.exports = ExternalUserCollection;
