<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

/**
   TODO: Write a header that explains the REST interface
   
   Explain that we couldn't use DELETE
*/
require_once("./ORM.php");
   
$pathInfo = explode('/', $_SERVER['PATH_INFO']);

// See if we're manipulating items
if ($pathInfo[1] == "Items"){ // first entry is blank (starts with '/')
   
   // Make sure we are allowed to edit items
   $listSlug = $pathInfo[2];
   $list = Database::getList($listSlug);
   $listData = $list->getData();
   verifyThatListIsAccessible($listData); // exits if credentials invalid

   // Item creation and update
   if ($_SERVER['REQUEST_METHOD'] == "POST"){
      
      $listOrder = $pathInfo[3];
      
      // Are we creating an item?
      if ($listOrder == "new"){
         
         // We are updating a list item
         $item = $list->insertItem(trim($_REQUEST['content'])); // since we don't support whitespace, might as well trim
         exit();
      
      // Are we deleting an item?
      } else if ($listOrder == "delete"){
         
         $listOrder = $pathInfo[4];
         
         $item = $list->getItem($listOrder);
         $item->delete();
      
      // Otherwise, we are updating an item
      } else {
         
         $item = $list->getItem($listOrder);
         
         if (array_key_exists('content', $_REQUEST)){
            $item->setContents(trim($_REQUEST['content']));
         }
         if (array_key_exists('checked', $_REQUEST)){
            $item->setCheckedStatus(trim($_REQUEST['checked']));
         }
         if (array_key_exists('checkedOrder', $_REQUEST)){
            $item->setCheckedOrder(trim($_REQUEST['checkedOrder']));
         }
         exit();
      }
   }
   
// See if we're updating or creating a list
} else if ($pathInfo[1] == 'Lists'){
   if ($pathInfo[2] == 'new'){
      
      $listSlug = Database::createList();
      
      // Return the slug
      $toSend = new ListSlugResponse($listSlug);
      
      header("Content-type: application/json");
      print(json_encode($toSend));
      exit();
      
   // Otherwise, we're updating the list data
   } else {
      
      // Only allow this if the list is already unlocked
      $list = Database::getList($pathInfo[2]);
      $listData = $list->getData();      
      verifyThatListIsAccessible($listData); // exits if credentials invalid
      
      // If we're requesting to remove password protection
      if (array_key_exists('passwordProtected', $_REQUEST) && $_REQUEST['passwordProtected'] == 0){
         $list->unlock();
         exit();
         
      // If we're requesting to set a password
      } else if (array_key_exists('newPassword', $_REQUEST)){
         $hash = password_hash($_REQUEST['newPassword'], PASSWORD_DEFAULT);
         print($hash);
         $list->lock($hash);
         
      // Otherwise, we're updating the title.
      } else if (array_key_exists('title', $_REQUEST)){
         $list->rename($_REQUEST['title']);
      }
      exit();
   }//end if not new list

   
// GET to RestInterface/listSlug is the main access point for getting list information.
// It acts differently depending on whether the list is password protected, and on
// whether a password was provided.
} else if ($_SERVER['REQUEST_METHOD'] == "GET"){

   // Check that the REST identifier (the "slug") is valid. The path starts with '/',
   // so the first element is empty.
   if (count($pathInfo) != 2
      || !ctype_alnum($pathInfo[1])){
         
      // 400 is a 'Bad Request' error
      http_response_code(400);
      print('Invalid list identifier (not alphanumeric): ' . $_SERVER['PATH_INFO']);
      exit();
   }

   $listSlug = $pathInfo[1];  // first element is empty   

   $list = Database::getList($listSlug);
   $listData = $list->getData();
   
   // Make sure list exists
   if ($listData == NULL){   // Check for existence of list
      http_response_code(404);
      print('List not found: ' . $this->slug);
      exit();
   }
   
   // Check whether list is not password protected
   if ($listData->passwordProtected == 0){      
      $listItems = $list->getItemsData();
      
      // Create an object to be serialized and sent back with the name of the list and
      // an array containing the item data.
      $toSend = new FullListResponse($listData->title, $listItems, $listData->passwordProtected);
         
      // Create the JSON response
      header("Content-type: application/json");
      print(json_encode($toSend));
      exit();
   
   // If the list is password protected
   } else {
      // If a password was not provided, this is a request to find out if a password
      // is needed.
      if (!array_key_exists('password', $_REQUEST)){
         
         // Create the JSON response
         header("Content-type: application/json");
         print(json_encode(new PasswordProtectedResponse()));
         exit();
         
      // If a password was provided, and the list is protected...
      } else {
         
         // Compare to the actual password
         if (password_verify($_REQUEST['password'], $listData->hashedPassword)){
         
            // Get the data and send it back
            $listItems = $list->getItemsData();
            $toSend = new FullListResponse($listData->title, $listItems, $listData->passwordProtected);
               
            // Create the JSON response
            header("Content-type: application/json");
            print(json_encode($toSend));
            exit();            
            
         } else {
            http_response_code(401);
            print('Incorrect password.');
            exit();
         }
      }//end if password provided
   }//end if password protected   
}//end GET

/**
   Utility function that sends back an error response if the list is locked and the
   password does not match.
*/
function verifyThatListIsAccessible($listData){
   
   // If list is not locked, or if the password is correct.
   if ($listData->passwordProtected == 0 
   || (array_key_exists('password', $_REQUEST) && password_verify($_REQUEST['password'], $listData->hashedPassword))){
      return;
      
   // Otherwise, give an error response
   } else {
      print($listData->hashedPassword);
      print("\n");
      print($_REQUEST['password']);
      http_response_code(401);
      print('Invalid credentials.');
      exit();
   }
}

// Our wwwx server does not support anonymous classes, hence we define the classes
// we need for responses below.
class FullListResponse {
   public $name;
   public $items;
   public $passwordProtected;
   
   function __construct($listName, $listItems, $passwordProtected = 0){
      $this->name = $listName;
      $this->items = $listItems;
      $this->passwordProtected = $passwordProtected;
   }
}
class ListSlugResponse {
   public $slug;
   
   function __construct($slug){
         $this->slug = $slug;
   }
}
class PasswordProtectedResponse {
   public $passwordProtected;
   
   function __construct(){
      $this->passwordProtected = 1;
   }
}
?>
