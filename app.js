/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

// require models
var Message = require('./models/message');
var Room = require('./models/room');
var User = require('./models/user');
var RoomCollection = require('./models/room_collection');
var UserCollection = require('./models/user_collection');
var ExternalUserCollection = require('./models/external_user_collection');
var ExternalUser = require('./models/external_user');

// instantiate app
var app = express();

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var server = http.createServer(app);
console.log('server created');
var io = socketIO.listen(server);
console.log('express created');
server.listen(app.get('port'));


/////////////////////////////////////////////////////////////////////////////////////
var newRoomColl = new RoomCollection();
var newUserColl = new UserCollection();
var newExternalUserColl = new ExternalUserCollection();
var chatterApp = chatterApp || {'currentUserList': newUserColl, 'currentRoomList': newRoomColl, 'externalUserList': newExternalUserColl};

io.sockets.on('connection', function(client) {
  console.log('Client connected ...');
  // emit on socket creation
  client.emit('reconnectCheck');

  // client will sent over cookie if it has one, menaing client has changed page,
  //  but was previously logged in. if its undefined then the client just logged in/ got to page
  client.on('connect', function(user_id) {
    if (user_id === null || typeof chatterApp.currentUserList.userList[user_id] === "undefined") {
      var user = new User(client);
      var external_user = new ExternalUser(user);
      chatterApp.currentUserList.userList[user.id] = user;
      // not logged in
      client.emit('connectionEstablished', external_user )
    } else {
      // if user already has a user_id cookie then they have navigated to a new page on site
      chatterApp.currentUserList.userList[user_id].reconnect(client, chatterApp);
    }
  });

  // should only happen once
  client.on('loggedIn', function(data) {
    var user_id = data.user_id;
    var username = data.username;
    var photo_url = data.photo_url;
    var user = chatterApp.currentUserList.userList[user_id].logIn(client, username, photo_url);
    var external_user = user.createExternalUser();
    chatterApp.externalUserList.userList[external_user.id] = external_user;
    // emit current user list when someone logs in
    user.socket.emit('userList', {'userList': chatterApp.externalUserList.userList, 'user': external_user});
    // send new user to rest of logged in users
    user.socket.broadcast.emit('newUser', external_user);
    // shouldnt have any rooms when you first login
  });

  client.on('disconnect', function() {
    // find user, run disconnect function
    var user = chatterApp.currentUserList.findBySocketId(client.id);
    if (typeof user !== "undefined"){
      console.log("user disconeected: " + user.id);
    }
    user ? user.disconnect(chatterApp, io) : console.log("socket not found");
  });

  client.on('createRoom', function(data) {
    var sender =   chatterApp.currentUserList.userList[data.sender_id];
    var receiver = chatterApp.currentUserList.userList[data.receiver_id];
    var room = sender.createRoom(receiver);

    receiver.socket.emit('joinRoom', {'sender': sender.id, 'room': room });
    sender.socket.emit('createRoom', {'sender': sender.id, 'room': room});
    chatterApp.currentRoomList.addRoom(room);
  });
  // this would be to create a room larger than 2 people
  client.on('inviteToRoom', function(room_id, user_id, sender_id) {
    var room = chatterApp.currentRoomList.roomList[room_id];
    var user = chatterApp.currentUserList[user_id];
    var sender = chatterApp.currentUserList.userList[data.sender_id];
    user.joinRoom(room, sender);
  });

  client.on('leaveRoom', function(leaveRoomHash) {
    var user = chatterApp.currentUserList.userList[leaveRoomHash.user_id];
    user.leaveRoom(leaveRoomHash.room_id, chatterApp);
    // clean up rooms
  });

  client.on('message', function(message_hash) {
    var room = chatterApp.currentRoomList.roomList[message_hash.room];
    var sender = chatterApp.currentUserList.userList[message_hash.sender_id]
    room.addMessage(sender, message_hash.text);
  });
});





