<?php
require_once("./Credentials.php");

# A static class for interacting with the database on the level of whole lists
class Database
{
   # We store the connection object so that we don't form a new connection if
   # we have to make more than one request.
   static private $connectionObject = false;   
   
   # Meant to be used by other ORM classes
   static function getConnection(){
      if (!Database::$connectionObject){
         Database::$connectionObject = new mysqli("classroom.cs.unc.edu",
            Credentials::$username,
            Credentials::$pw,
            Credentials::$database);
      
         if (Database::$connectionObject->connect_errno) {
         
            // 500 is an 'Internal Server Error'
            http_response_code(500);
            printf("Database connection error: %s\n", Database::$connectionObject->connect_error);
            Database::$connectionObject = false;
            exit();
         }
      }
      
      return Database::$connectionObject;
   }
   
   # Creates a new list entry in the database, with default title. Returns the slug
   # of the newly created list.
   static function createList(){
      // Create a list
      
      // Insert it into the database
      
      // Return the slug
      
   }
   
   # Gives an object for manipulating a list. Note that a SQL query is only issued
   # one something specific is requested, to avoid unnecessary queries. To get an
   # actual row from the "Lists" table, call getData() on the resulting object.
   static function getList($listSlug){
      return new ToDoList($listSlug);
   }
}

# Class for manipulating lists in the database
class ToDoList
{
   private $slug;
   
   # We store data to avoid duplicate SQL queries, since we frequently get the list
   # data and then use the list id from the data to get list items. However note that
   # this "caching" has to be kept in mind if the list is updated.
   private $data = false;
   
   # Constructor
   function __construct($slug){
      $this->slug = $slug;
   }
   
   # Gets the actual row in the "Lists" database
   function getData(){
      if (!$this->data){
         
         $connectionObject = Database::getConnection();
         
         $listDataResultHandle = $connectionObject->query(
            'SELECT * from Lists WHERE slug = "' . $connectionObject->real_escape_string($this->slug) . '";');
      
         if (!$listDataResultHandle){  // Check for SQL error
            http_response_code(500);
            print('SQL error: ' . mysqli_error($connectionObject));
            exit();
         }
         
         if ($listDataResultHandle->num_rows == 0){   // Check for existence of list
            http_response_code(404);
            print('List not found: ' . $this->slug);
            exit();
         }

         $this->data = $listDataResultHandle->fetch_object();
      }
      
      return $this->data;
   }
   
   # Updates the "name" field of the list. Note that this either needs to update
   # the cached "data" variable, or set it to false.
   function rename(){
      
   }

   # Gets all the item rows associated with this list. This gives the actual row data, not
   # objects for manipulating the rows.
   function getItemsData(){
      $connectionObject = Database::getConnection();
      $listId = $this->getData()->listId;
      
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
      
      return $rowArray;
   }
   
   # Gives an object for manipulating a particular item in the list.
   function getItem($orderNumber){
      return new Item($this, $orderNumber);
   }
   
   function getSlug(){
      return $this->slug;
   }
   
   function insertItem($content){
      $connectionObject = Database::getConnection();
      $resultHandle = $connectionObject->query(
         'INSERT INTO Items (listId, content, listOrder, checked)'
         . ' SELECT Lists.listId, "' . $connectionObject->real_escape_string($content) . '"'
         . ', MAX(Items.listOrder)+1, false'
         . ' FROM Lists JOIN Items ON Lists.listId = Items.listId'
         . ' WHERE Lists.slug = "' . $connectionObject->real_escape_string($this->getSlug()) . '"'
         . ' GROUP BY Lists.listId'
      );
      
      if (!$resultHandle){  // Check for SQL error
         http_response_code(500);
         print('SQL error: ' . mysqli_error($connectionObject));
         exit();
      }
   }
}
   
class Item
{
   # Knowledge of the parent list is mainly needed for the list slug
   private $parentList;
   private $listOrder;
   
   function __construct($parent, $orderNumber){
      $this->parentList = $parent;
      $this->listOrder = $orderNumber;
   }
   
   function changeContents($newContents){

      $connectionObject = Database::getConnection();
      $resultHandle = $connectionObject->query(
         'UPDATE Items JOIN Lists ON Items.listId = Lists.listId' 
         . ' SET Items.content = "' . $connectionObject->real_escape_string($newContents) . '"'
         . ' WHERE Lists.slug = "' . $connectionObject->real_escape_string($this->parentList->getSlug()) . '"'
         . ' AND Items.listOrder = ' . $connectionObject->real_escape_string($this->listOrder)
      );
      
      if (!$resultHandle){  // Check for SQL error
         http_response_code(500);
         print('SQL error: ' . mysqli_error($connectionObject));
         exit();
      }
   }
   
   function changeOrder($newOrderNumber){
      
   }
   
   function check(){
      
   }
   
   function uncheck(){
      
   }
   
   function getData(){

   }
   
   function delete(){
      
   }
}
?>