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
   
   // Item creation and update
   if ($_SERVER['REQUEST_METHOD'] == "POST"){
      
      $listSlug = $pathInfo[2];
      $listOrder = $pathInfo[3];
      
      // Are we creating an item?
      if ($listOrder == "new"){
         
         // We are updating a list item
         $list = Database::getList($listSlug);
         $item = $list->insertItem(trim($_REQUEST['content'])); // since we don't support whitespace, might as well trim
         exit();
      
      } else if ($listOrder == "delete"){
         
         $listSlug = $pathInfo[2];
         $listOrder = $pathInfo[4];
         $list = Database::getList($listSlug);
         $item = $list->getItem($listOrder);
         $item->delete();
      
      // Otherwise, we are updating an item
      } else {
         $list = Database::getList($listSlug);
         $item = $list->getItem($listOrder);
         
         if (array_key_exists('content', $_REQUEST)){
            $item->changeContents(trim($_REQUEST['content']));
         }
         if (array_key_exists('checked', $_REQUEST)){
            $item->setCheckedStatus(trim($_REQUEST['checked']));
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
      $list = Database::getList($pathInfo[2]);
      $list->rename($_REQUEST['title']);
      exit();
   }

   
// GET to RestInterface/listSlug gives back a JSON with the list name and
// the list items.
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
   
   $listItems = $list->getItemsData();
   
   // Create an object to be serialized and sent back with the name of the list and
   // an array containing the item data.
   $toSend = new FullListResponse($listData->title, $listItems);
      
   // Create the JSON response
   header("Content-type: application/json");
   print(json_encode($toSend));
}//end GET

// Our wwwx server does not support anonymous classes, hence we define the classes
// we need for responses below.
class FullListResponse {
      public $name;
      public $items;
      
      function __construct($listName, $listItems){
         $this->name = $listName;
         $this->items = $listItems;
      }
}

class ListSlugResponse {
   public $slug;
   
   function __construct($slug){
         $this->slug = $slug;
   }
}
?>
