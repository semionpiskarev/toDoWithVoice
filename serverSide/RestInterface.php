<?php
require_once("./ORM.php");
   
// GET to RestInterface/listSlug gives back a JSON with the list name and
// the list items.
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

   $list = Database::getList($listSlug);
   $listData = $list->getData();
   $listItems = $list->getItemsData();
   
   // Create an object to be serialized and sent back with the name of the list and
   // an array containing the item data.
   $toSend = new class($listData->title, $listItems){
      public $name;
      public $items;
      
      function __construct($listName, $listItems){
         $this->name = $listName;
         $this->items = $listItems;
      }
   };
      
   // Create the JSON response
   header("Content-type: application/json");
   print(json_encode($toSend));
}//end GET
?>
