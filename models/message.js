var Message = function (sender, text, room_id) {
  this.sender_id = sender.id;
  this.text = text;
  this.sender_name = sender.username;
  this.room_id = room_id;
}

module.exports = Message;
