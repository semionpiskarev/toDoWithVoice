<!DOCTYPE html>
<html lang="en">
   <head>
      <title>Do-It</title>
   
      <!-- Required meta tags for Bootstrap -->
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

      <!-- Bootstrap CSS -->
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">
      <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
      
      <!-- Our CSS -->
      <link rel="stylesheet" href="clientSide/toDoList.css">
    
      <!-- Scripts with defer will only execute after html is done parsing. These can be placed at the bottom
      of the body element instead as well, but might start being downloaded later. -->
      <script defer src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    
      <!-- Scripts for Bootstrap -->
      <script defer src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js" integrity="sha384-vFJXuSJphROIrBnz7yo7oB41mKfc8JzQZiCq4NCceLEaO4IHwicKwpJf9c9IpFgh" crossorigin="anonymous"></script>
      <script defer src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/js/bootstrap.min.js" integrity="sha384-alpBpkh1PFOepccYVYDB4do5UnbKysX5WZXm3XxPqe5iKTfUKjNkCk9SaVuEZflJ" crossorigin="anonymous"></script>
      
      <!-- Our scripts. Careful- we can't defer inline JS, so jQuery is not available inline -->
      <script>
         var queryString = "<?php print($_SERVER['QUERY_STRING']); ?>";
      </script>
      <script defer src="clientSide/toDoList.js"></script>
   </head>
   <body>
      <nav class="navbar navbar-dark">
         <a href="<?php 
            // We want this to link back to home page, but this will differ depending only
            // which server this is running on (wwwx or wwwp)
            print(strtok($_SERVER['REQUEST_URI'], '?')); // gets everything before '?'
            ?>" class="navbar-brand">Do-It</a>
      </nav>
      
      <div class="page_body"></div>
   </body>
</html>