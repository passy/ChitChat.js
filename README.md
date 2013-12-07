chatterJS-V1
============

renamed, ChitChat.js

ChitChat.js easiest way to integrate a chat client into any web app. Simply follow the instructions below 
and within an hour your users will be able to chat from your site.

1. Clone this repository
2. In the /public/javascripts/chatter_settings.js file, specify where you are deploying the node server to and what site
    you will be adding ChitChat.js to (note, you may not know where the node server is going to be deployed until after
    you deploy, this is ok just change the node_server_url once you do know)
3. Ensure the app has a Procfile with "web: node web.js" in it. This is required for deploying on heroku
4. Git commit your changes
5. Deploy to heroku (follow the walkthrough below or, https://devcenter.heroku.com/articles/getting-started-with-nodejs)
  in your console type each of these comands:
  1. heroku create
  2. git push heroku master
  3. heroku ps:scale web=1
  4. maybe write "heroku config:set NODE_ENV=production" // because node server is using Express
  5. heroku labs:enable websockets
  6. if you need to update the node_server_url, do so now and re-git commit and git push heroku master
6. Install ChitChat.js in your web app
  1. in your global HTML file add two script files, include two scrpt tags:
  <pre><code>&lt;script src="https://code.jquery.com/jquery.js" &gt;&lt;/script&gt;
  &lt;script data-main="http://localhost/javascripts/chatter"src="http://localhost/javascripts/require.js"&gt;&lt;/script&gt;</code></pre>
    * note: replace "localhost" with the node_server_url
    * note2: ChitChat.js is dependant on jQuery. JQuery must be loaded before loading ChitChat.js
  2. add code to notify ChitChat.js when a user logs into your site
    in the simplest case, a user will visit a sign in/sign up page and then be rerouted to a new page. If this is the use case for your app, use the code below:
    <pre><code>&lt;script&gt;
        var form = $("#new_user"); // set form to the signin/signup form
        $(form).on("submit", function(e) {
          e.preventDefault();
          chatter_username = $("#user_name").val(); // set the global chater_username variable for the user
          var self = this;
          $(chatterApp).trigger('userLogin', [function() { $(self).submit(); }]);
          // this will trigger the login event on the global chatterApp variable and pass the login submit event 
          // to ChitChat.js. ChitCHat.js will trigger the login once the node server has succesfully received the login 
          // event.
        });
&lt;/script&gt;</code></pre>
7. Customize the ChitChat.js CSS
  * customizations can be done to the public/stylesheets/chatter.css file
  
8. And thats it! Test it out with a few users. Please feel free to reach out if any part of this walkthrough is not clear

Contributing:
Please feel free to contribute to this project. I am new to the world of open source code but am very receptive to comments/
  suggestions.
