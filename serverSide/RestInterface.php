<?php
   require_once("./Credentials.php");
   
   // Handle a simple GET request
   if ($_SERVER['REQUEST_METHOD'] == "GET"){

      // Check that the REST identifier (the "slug") is valid. The path starts with '/',
      // so the first element is empty.
      $pathInfo = explode('/', $_SERVER['PATH_INFO']);
      
      if (count($pathInfo) != 2
         || !ctype_alnum($pathInfo[1])){
            
         // 400 is a 'Bad Request' error
         http_response_code(400);
         print('Invalid list identifier (not alphanumeric): ' . $_SERVER['PATH_INFO']);
         exit();
      }
   
      $listSlug = $pathInfo[1];  // first element is empty   
   
      // Create a connection to the database
      $connectionObject = new mysqli("classroom.cs.unc.edu",
         Credentials::$username,
         Credentials::$pw,
         Credentials::$database);

      if ($connectionObject->connect_errno) {
         
         // 500 is an 'Internal Server Error'
         http_response_code(500);
         printf("Database connection error: %s\n", $connectionObject->connect_error);
         exit();
      }
      
      // See if there is a list with the given slug
      $listInfoResultHandle = $connectionObject->query(
         'SELECT listId from Lists WHERE slug = "' . $connectionObject->real_escape_string($listSlug) . '";');
      
      if (!$listInfoResultHandle){  // Check for SQL error
         http_response_code(500);
         print('SQL error: ' . mysqli_error($connectionObject));
         exit();
      }
      
      if ($listInfoResultHandle->num_rows == 0){   // Check for existence of list
         http_response_code(404);
         print('List not found: ' . $listSlug);
         exit();
      }

      // Get all items related to this list
      $listId = $listInfoResultHandle->fetch_array()[0];
      $resultHandle = $connectionObject->query(
         'SELECT content, checked, listOrder FROM Items WHERE listId = ' . $connectionObject->real_escape_string($listId) . ';');
      
      if (!$resultHandle){    // Check for SQL error
         http_response_code(500);
         print('SQL error: ' . mysqli_error($connectionObject));
         exit();
      }
      
      // Get the actual rows from our result handle
      $rowArray = array();
      while ($next_row = $resultHandle->fetch_object()) {   // while there are more rows
         $rowArray[] = $next_row;   // appends to end
      }
      
      // Create the actual JSON response
      header("Content-type: application/json");
      print(json_encode($rowArray));
   }
?>
