var ExternalUser = function (user) {
  this.username = user.username;
  this.photo_url = user.photo_url;
  this.id = user.id;
  this.status = user.status;
  return this;
};

ExternalUser.prototype.logIn = function (username, photo_url, status) {
  this.username = username;
  this.photo_url = photo_url;
  this.status = status;
  return this;
};

module.exports = ExternalUser;
