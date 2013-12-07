// using require.js
define(["chatter_settings", "jquery"], function(chatterSettings, $) {

  (function($) {
    $.fn.scrollDown = function() {
      if ($(this).get(0).scrollHeight > this.height()) {
        this.scrollTop(this.get(0).scrollHeight);
        return $(this);
      }
    };
  })($);

  var node_site_url = chatterSettings.node_server_url;
  var web_app_url = chatterSettings.web_app_url;
  var chatter_port = node_site_url === "localhost" ? "8080" : "80";

  return {
    appendChatterListHeader: function() {
      var header_title = "Sign in to use Chatter";
      var chatterFriendlistHeaderHTML = "<div id='chatter-friendlist-widget'>\
            <div id='chatter-friendlist-header' class='chatter-header'>\
              <button class='glyph-btn'>\
                <img src='http://" + node_site_url + ":" + chatter_port + "/images/down_arrow.png' class='chatter-slide-glyph'>\
              </button>\
              <p id='chatter-friendlist-title'>" + header_title + "</p>\
            </div>\
        </div>";
      $("#chatter-container").append(chatterFriendlistHeaderHTML);
    },

    appendChatterListBody: function() {
      $("#chatter-friendlist-title").text("Chatter Users");
      var chatterFriendlistBodyHTML = "<div class='clearfix'></div>\
        <div id='chatter-friendlist' class='chatter-list-div'>\
        </div>";
      $("#chatter-friendlist-widget").append(chatterFriendlistBodyHTML);
    },

    appendUserToChatList: function(user) {
      var chatterFriendlistBox = $('#chatter-friendlist');
      $("<a id='LIST" + user.id + "' class='chatter-username' href='#'>" + user.username + "</a>").appendTo(chatterFriendlistBox);
    },

    appendAllUsersToChatList: function(user_id) {
      var user_keys = Object.keys(chatterApp.currentUserList);
      for (var i = 0; i < user_keys.length; i++ ) {
        if (user_keys[i] !== user_id && typeof chatterApp.currentUserList[user_keys[i]] !== "null") {
          this.appendUserToChatList(chatterApp.currentUserList[user_keys[i]]);
        }
      }
    },

    removeUserFromChatList: function(user_id) {
      var chatterFriendlistBox = $('#chatter-friendlist');
      $("#LIST" + user_id).remove();
    },

    addNewChat: function(room, sender, current_user) {
      var chatterChatBox = $("#" + room.id + " .chatter-chat-box");
      var chatWidth = 0;
      $("#chatter-container").children().each(function() { chatWidth += ($(this).width() + 5) });
      var chatTitle = this.listUserNames(room, current_user);

      var chatterBoxHTML = "<div id='" + room.id + "' class='chatter-chat-widget' style='right:" + (chatWidth) + "px'>\
            <div class='chatter-chat-box-header chatter-header'>\
              <button class='glyph-btn'>\
                <img src='http://" + node_site_url + ":" + chatter_port + "/images/down_arrow.png' class='chatter-slide-glyph'>\
              </button>\
              <p class='chatter-chat-title'>" + chatTitle + "</p>\
              <button class='glyph-btn-remove'>\
                <img src='http://" + node_site_url + ":" + chatter_port + "/images/remove.png' class='chatter-remove-glyph'>\
              </button>\
            </div>\
            <div class='clearfix'></div>\
            <div class='chatter-list-div'>\
              <div class='chatter-chat-box'></div>\
              <form class='chatter-input-form'>\
                <textarea class='chatter-chat-input' placeholder='Talk about it' rows='2'></textarea>\
              </form>\
            </div>\
          </div>";

      if (chatWidth > $(window).width()) {
        alert('your chat with ' + sender.username + 'will not fit on the page');
      } else {
        $("#chatter-container").append(chatterBoxHTML);
        var chatBox = $("#" + room.id + " .chatter-chat-box");
        if (sender != current_user && typeof sender !== "undefined") {
          $(chatBox).append("<p class='chatter-received'>" + sender.username + " has invited you to chat</p>");
          $(chatterChatBox).scrollDown();
        }
      }
    },

    addUserToChat: function(room, current_user) {
      var chatTitle = $("#" + room_id + " .chatter-chat-title");
      chatTitle.text(this.listUserNames(room, current_user));
    },

    removeUserFromChat: function(room, leaving_user, current_user) {
      var chatterChatBox = $("#" + room.id + " .chatter-chat-box");
      $(chatterChatBox).append("<p class='chatter-received'>" + leaving_user.username + " has left chat</p>");
      $("#" + room.id + " .chatter-chat-title").text(this.listUserNames(room, current_user));
      $(chatterChatBox).scrollDown();
    },

    listUserNames: function(room, current_user) {
      var userNames = "";
      for (i = 0; i < room.users_array.length; i++ ) {
        if (room.users_array[i] !== current_user.id) {
          userNames = userNames + chatterApp.currentUserList[room.users_array[i]].username + ", ";
        }
      }
      if (userNames === "") {
        return "no users :(";
      } else {
        return userNames.substr(0, userNames.length - 2);
      }
    },

    appendReceivedMessage: function(room, message) {
      var chatterChatBox = $("#" + room.id + " .chatter-chat-box");
      // $("<p class='chatter-received chatter-sender-name'>" + message.sender_name + " :</p>").appendTo(chatterChatBox);
      $("<p class='chatter-received'>" + message.sender_name + ": " + message.text + "</p>" ).appendTo(chatterChatBox);
      $(chatterChatBox).scrollDown();
    },

    appendSentMessage: function(room, message) {
      var chatterChatBox = $("#" + room.id + " .chatter-chat-box");
      $("<p class='chatter-sent'>" + message.text + "</p>").appendTo(chatterChatBox);
      $(chatterChatBox).scrollDown();
    },

    removeChatWindow: function(room, left) {
      $("#" + room.id).remove();
      console.log("in chat remove");
      $(".chatter-chat-widget").each( function(index, el) {
        $(this).animate({right: (205 + (index * 215)) + "px" })
      });
    },

    bindListeners: function(socket, chatter_js_cookie) {
      var chatterGliph = $('.glyph-btn');
      var chatterChatInput = $('.chatter-chat-input');
      var chatterUser = $('.chatter-username');
      var chatterAppContainer = $("#chatter-container");
      var self = this;

      chatterAppContainer.on('chatterSlideDown', '.glyph-btn', function(e) {
        $(this).parent().siblings('.chatter-list-div').slideToggle(600, function() {
          console.log($(this).css("display") === "none")
          if ($(this).css("display") === "none" ) {
            // debugger;
            $(this).siblings(".chatter-header").find(".chatter-slide-glyph").attr("src", "http://" + node_site_url + ":" + chatter_port + "/images/up_arrow.png");
          } else {
            $(this).siblings(".chatter-header").find(".chatter-slide-glyph").attr("src", "http://" + node_site_url + ":" + chatter_port + "/images/down_arrow.png");
          }
        });
      });

      chatterAppContainer.on('click', '.glyph-btn', function(e) {
        $(this).trigger('chatterSlideDown');
      });

      chatterAppContainer.on('submitChat', '.chatter-chat-input', function(e) {
        e.preventDefault();
        var sender = chatterApp.currentUserList[$.cookie(chatterApp.chatter_js_cookie)];
        var message_text = $(this).val().trim();
        var room_id = $(this).closest('.chatter-chat-widget').attr('id');
        var room = chatterApp.userRoomList[room_id]; // find room
        var message = {'sender_id': sender.id, 'text': message_text, 'sender_name': sender.username, 'room': room_id};
        room.messages = room.messages.concat(message);
        socket.emit('message', message); // remitting from in the HTML page, idk brah
        self.appendSentMessage(room, message);
        $(this).val('');
      });

      chatterAppContainer.on('keyup', '.chatter-chat-input', function(e) {
        if (e.keyCode === 13) {
          $(this).trigger('submitChat');
        }
      });

      chatterAppContainer.on('createChat', ".chatter-username", function(e) {
        e.preventDefault();
        var receiver_id = $(this).attr('id').replace(/LIST/, "");
        socket.emit('createRoom', {'sender_id': $.cookie(chatterApp.chatter_js_cookie), 'receiver_id': receiver_id} );

      });

      chatterAppContainer.on('click',  ".chatter-username", function(e) {
        $(this).trigger('createChat');
      });

      chatterAppContainer.on('leaveChat', ".glyph-btn-remove", function(e) {
        e.preventDefault();
        var room_widget = $(this).closest('.chatter-chat-widget');
        var room_id = $(room_widget).attr('id');
        var room = chatterApp.userRoomList[room_id]; // find room
        var left = $(room_widget).position().left;
        self.removeChatWindow(room, left);
        socket.emit('leaveRoom', {'user_id': $.cookie(chatteraApp.chatter_js_cookie), 'room_id': room_id} );
      });

      chatterAppContainer.on('click', ".glyph-btn-remove", function(e) {
        $(this).trigger("leaveChat");
      });
    }
  }
});

