<!DOCTYPE html>
<html>
   <head>
      <title>To Do With Voice</title>
      <meta charset="UTF-8">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
      <script>
         var queryString = "<?php print($_SERVER['QUERY_STRING']); ?>";
      </script>
      <script src="clientSide/toDoList.js"></script>
   </head>
   <body>
      <div>To Do items:</div>
      <ul class="to_do_list"></ul>
        
   </body>
</html>