define([], function() {
  return {
    devLogger: function(url, output) {
      if (url  === 'localhost') {
        console.log(output);
      }
    },

    makeid: function() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for( var i=0; i < 5; i++ ) {
        text+=possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    },

    devUserSetter: function(url) {
      if (url  === 'localhost') {
        window.chatter_username = window.chatter_username || this.makeid();
        window.chatter_user_avater = window.chatter_user_avater || 'urlllll';
      }
    }
  }
})

