requirejs.config({
  "paths": {
    "jquery": "https://code.jquery.com/jquery"
  }
});

require(["dos_chatter","jquery"],function(dos_chatter,$){
  dos_chatter.run_file();
});


