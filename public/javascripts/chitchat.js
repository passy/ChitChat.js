requirejs.config({
  "paths": {
    "jquery": "https://code.jquery.com/jquery"
  }
});

require(["chitchat_logic","jquery"],function(logic,$){
  logic.run_file();
});


