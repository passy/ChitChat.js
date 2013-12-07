// using require.js
define(["chitchat_html", "chitchat_settings", "dev_functions", "jquery", "jquery-cookie/jquery.cookie" ], function(chatterHTML, chatterSettings, devFunctions, $ ) {

  return {
    run_file: function() {
      var node_site_url = chatterSettings.node_server_url;
      var web_app_url = chatterSettings.web_app_url;
      var chatter_port = node_site_url === "localhost" ? "8080" : "80";

      $(document).ready( function() {
        $("head").append("<link rel='stylesheet' type='text/css' href='http://" + node_site_url + ":" + chatter_port + "/stylesheets/chatter.css'>");
        $("head").append("<link href='http://fonts.googleapis.com/css?family=Josefin+Sans:400,400italic' rel='stylesheet' type='text/css'>");
        // $("head").append("<link rel='stylesheet' type='type/css' href='http://netdna.bootstrapcdn.com/bootstrap/3.0.2/css/bootstrap.min.css'>");

        var afterScriptLoad = function () {
          window.chatterApp = window.chatterApp || {'currentUserList': {}, 'userRoomList': {} , 'user': {}};

          chatterApp.chatter_site_url = window.location.hostname;
          window.chatter_username = window.chatter_username || undefined;
          window.chatter_user_avater = window.chatter_user_avater || undefined; // not currertly using chatter avatars
          chatterApp.chatter_js_cookie = "_chatter_" + encodeURIComponent(chatterApp.chatter_site_url);

          // // check every 200 millisecionds for other app to set global user_name variable
          // chatterApp.checkChatterUsername = function() {
          //   devFunctions.devLogger(node_site_url,"running checkChatterUsername");
          //   var chatter_login_interval = window.setInterval( function () {
          //     if (typeof chatter_username !== "undefined") {
          //       window.clearInterval(chatter_login_interval);
          //       devFunctions.devLogger(node_site_url,"user variable set");
          //       $(chatterApp).trigger('userLogin');
          //     }
          //     devFunctions.devLogger(node_site_url, "interval check");
          //   }, 200);
          // };

          chatterApp.setUsername = function(username, callback) {
            window.chatter_username = username;
            $(chatterApp).trigger("userLogin");
            if (callback) {
              $(chatterApp).on("loginSuccess", function () {
                callback;
              });
            }
          };

          var socket = io.connect("http://" + node_site_url + ":" + chatter_port + "/"); // open socket connection to node server

          //events to listen to. events are often emitted in response
          socket.on('reconnectCheck', function() {
            // check for cookie, set cookie to user_id if avalible
            var user_id = $.cookie(chatterApp.chatter_js_cookie);
            $("#chatter-container").remove(); // remove and add chatter-contianer. mostly for testing
            $("body").append("<div id='chatter-container'></div>");
            chatterHTML.bindListeners(socket,chatterApp.chatter_js_cookie); //bind event listeners to chatter-contianer
            devFunctions.devLogger(node_site_url,'recconectCheck');
            devFunctions.devLogger(node_site_url,user_id);
            socket.emit('connect', user_id);
            chatterHTML.appendChatterListHeader();
          });

          // user is not logged in
          socket.on('connectionEstablished', function(user) {
            chatterApp.user = user;
            devFunctions.devLogger(node_site_url, 'made it into connection Establised ' + user.id);
            $.cookie(chatterApp.chatter_js_cookie, user.id); // set cookie userid if its not set
            // user is not logged in, start checking for other app to set global chatter_username variable
            // chatterApp.checkChatterUsername();
          });

          // other app is responsible for triggering user login
          // trigger login with $(chatterApp).trigger('userLogin')
          $(window.chatterApp).on('userLogin' , function() {
            var uuid = $.cookie(chatterApp.chatter_js_cookie);
            devFunctions.devUserSetter(node_site_url); // in localhost you can trigger login using javascript. username gets set to random 5 letter username
            socket.emit('loggedIn', {'user_id': uuid, 'username': window.chatter_username, 'photo_url': window.chatter_user_avater });
          });

          socket.on('reconnect', function(app_hash) {
            devFunctions.devLogger(node_site_url,'reconnected');
            devFunctions.devLogger(node_site_url,app_hash.user);
            // debugger;
            // a user's status is active if they are logged in
            if (app_hash.user.status === "active") {
              // if a user is not logged into the site but is changing pages, they will reconnect sockets, but reload action should not happen
              devFunctions.devLogger(node_site_url,"user is active");
              chatterApp.currentUserList = app_hash.other_users;
              chatterApp.user = app_hash.user;
              $.each(app_hash.rooms, function(ind, room) {
                chatterApp.userRoomList[room.id] = room;
              }); // add users rooms
              chatterHTML.appendChatterListBody(); // add chatter user list back
              chatterHTML.appendAllUsersToChatList($.cookie(chatterApp.chatter_js_cookie)); // add logged in users to list
              var current_user = app_hash.user; // get current user information

              // re-open rooms
              $.each(chatterApp.userRoomList, function(id, room){
                chatterHTML.addNewChat(room, undefined, current_user);
                $.each(room.messages, function(index, message) {
                  if (message.sender_id === current_user.id) {
                    chatterHTML.appendSentMessage(room, message);
                  } else {
                    chatterHTML.appendReceivedMessage(room, message);
                  }
                });
              });
            }
            // } else {
            //   // if user is reconnecting but has not logged in
            //   devFunctions.devLogger(node_site_url, "user is not logged in");
            //   chatterApp.checkChatterUsername();
            // }
            // if user is not logged in then no new action needs to be taken
          });

          // happens after a user logs in
          socket.on('userList', function(userInfo) {
            // debugger;
            // chatterApp.currentUserList = userInfo.userList;
            chatterApp.user = userInfo.user;
            tempguy = "nimit";
            tempguy2 = "kyle";
            window.tempguy3 = "jorge";
            devFunctions.devLogger(node_site_url,'logged in and got userList');
            chatterHTML.appendChatterListBody();
            chatterHTML.appendAllUsersToChatList(userInfo.user.id);
            $(chatterApp).trigger("loginSuccess");
          });

          // another user of the site logs in
          socket.on('newUser', function(newUser) {
            // debugger;
            chatterApp.currentUserList[newUser.id] = newUser;
            devFunctions.devLogger(node_site_url,"new user created!");
            devFunctions.devLogger(node_site_url,newUser);

            // user receives newUser message even if they are not logged in, but we only
            //   add new user to list if the current user is logged in
            if (chatterApp.user.status === "active") {
              chatterHTML.appendUserToChatList(newUser);
            }
          });

          // when a user leaves the site
          socket.on('userDisconnected', function(user_id) {
            devFunctions.devLogger(node_site_url,'into userdisconnected');
            if ( typeof chatterApp.currentUserList[user_id] !== "undefined" ) {
              delete chatterApp.currentUserList[user_id]; // remove user from our list
            }
            chatterHTML.removeUserFromChatList(user_id);

            // notify users who have converations with the user who left, that they have left
            var room_keys = Object.keys(chatterApp.userRoomList);
            for (var i = 0; i < room_keys.length; i++) {
              var room = chatterApp.userRoomList[room_keys[i]];
              if (room.users_array.indexOf(user_id) !== -1) {
                room.users_array.splice(room.users_array.indexOf(user_id),1);
                chatterHTML.removeUserFromChat();
              }
            }
          });

          // action received when a user is invited to chat
          socket.on('joinRoom', function(roomInfo) {
            chatterApp.userRoomList[roomInfo.room.id] = roomInfo.room;
            var sender = chatterApp.currentUserList[roomInfo.sender];
            var current_user = chatterApp.user;
            devFunctions.devLogger(node_site_url,current_user);
            chatterHTML.addNewChat(roomInfo.room, sender, current_user); // add new chat object
            devFunctions.devLogger(node_site_url,sender.username + " created a room");
          });

          // happens when someone when a user invites another user to chat. event is emmited back to
          //  user who initiated the chat
          socket.on('createRoom', function(roomAndUserHash) {
            var room = roomAndUserHash.room;
            chatterApp.userRoomList[room.id] = room;
            var sender = chatterApp.currentUserList[roomAndUserHash.sender];
            var current_user = chatterApp.user;
            devFunctions.devLogger(node_site_url,room);
            chatterHTML.addNewChat(roomAndUserHash.room, sender, current_user);
            devFunctions.devLogger(node_site_url,"you created a room");
          });

          // event emited when we add a third or more user to room. Not currently being used
          socket.on('addUserToRoom', function(roomAndUserHash) {
            // var sender = chatterApp.currentUserList.userList[roomAndUserHash.sender];
            var room = chatterApp.userRoomList[roomAndUserHash.room];
            var new_user = chatterApp.currentUserList.userList[roomAndUserHash.newUser];
            room.users_array = room.users_array.concat(new_user);
            devFunctions.devLogger(node_site_url,room);
          });

          // when a user closes a room they were chatting in
          socket.on('leftRoom', function(roomAndUserHash) {
            var room = chatterApp.userRoomList[roomAndUserHash.room_id];
            room.users_array.splice(room.users_array.indexOf(roomAndUserHash.user_id),1);
            devFunctions.devLogger(node_site_url,"user " + roomAndUserHash.room_id + " left the room");
            var user_leaving = chatterApp.currentUserList[roomAndUserHash.user_id];
            var current_user = chatterApp.currentUserList[$.cookie(chatterApp.chatter_js_cookie)];

            chatterHTML.removeUserFromChat(room, user_leaving, current_user);
          });

          // when a user sends a message to  a room
          socket.on('message', function(message_hash) {
            var room = chatterApp.userRoomList[message_hash.room_id];
            room.messages = room.messages.concat(message_hash.message);
            chatterHTML.appendReceivedMessage(room,message_hash.message);
          });
        };

        $.getScript("http://" + node_site_url + ":" + chatter_port + "/socket.io/socket.io.js").done(afterScriptLoad);
      });
    }
  }
});

