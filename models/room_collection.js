var RoomCollection = function() {
  this.roomList = {};
};

RoomCollection.prototype.addRoom = function (room) {
  this.roomList[room.id] = room;
};

module.exports = RoomCollection;
