$(document).ready(function(){
   
   if (queryString == ""){
      createLandingPage();
      
   // This had better be validated on the REST side! I am not sure whether it
   // would have been better to not even do this check here, just to emphasize
   // that the user could make up any kind of AJAX call.   
   } else if (stringIsAlphanumeric(queryString)){
      
      displayListPage();
      
      // Make an AJAX call to our REST interface to get the list items 
      $.ajax("./serverSide/RestInterface.php/" + queryString,{
         type: "GET",
         dataType: "json",
         success: onListLoad, // fills in title, list items, activates buttons
         error: displayListNotFound
      });
      
   } else {
      displayListInvalid();
   }
});

function createLandingPage(){
   
}

// Sets up the page for displaying a list.
function displayListPage(){
   // Add placeholder for title
   $(".page_body").append('<h2 class="list_name">My List</h2>');
   
   // Create place to add items
   $(".page_body").append('<div class="container to_do_list"></div>');
   
   // Add the footer   
   $("body").append('\
      <footer class="button_footer">\
         <div class="button_footer__contents">\
            <div class="container d-flex justify-content-center">\
               <button type="footer_button" class="btn btn-success btn-md button_footer__btn create_new_item_btn">\
                  <i class="fa fa-plus"></i> Add Item\
               </button>\
               <button type="button" class="btn btn-danger btn-md button_footer__btn record_new_item_btn">\
                  <i class="fa fa-microphone"></i> Record\
               </button>\
            </div>\
         </div>\
      </footer>'
      );
      
   // Add handlers to the footer buttons
   $(".create_new_item_btn").on("click", newItemButtonHandler);
}

// Populates todo list once AJAX call gets through.
function onListLoad(data, textStatus, jqXHR){
   
   $("list_name").contents(data.name);
   
   data.items.forEach(function(element, index){
      addListItem(element.content, index);
   });
}

// Adds an item card to the to do list container
function addListItem(contents, orderIndex){
   var newItem = $(
      '<div class="card item_card">\
         <div class="row  item_card__row">\
            <div class="col-2 col-md-1 d-flex justify-content-end align-items-center">\
               <div class="item_card__checkbox d-flex justify-content-center align-items-center">\
                  <i class="fa fa-check icon-large item_card__checkmark"></i>\
               </div>\
            </div>\
            <div class="col-7 col-md-9 d-flex align-items-center item_card__text">' + contents + '</div>\
            <div class="col-3 col-md-2 d-flex justify-content-end">\
               <button type="button" class="btn btn-default btn-sm item_card__btn item_card__edit_btn"><i class="fa fa-edit"></i></button>\
               <button type="button" class="btn btn-danger btn-sm item_card__btn item_card__delete_btn"><i class="fa fa-times"></i></button>\
            </div>\
         </div>\
      </div>'
      );
   $(".to_do_list").append(newItem);
   newItem.data("order", orderIndex);
   newItem.find(".item_card__edit_btn").on("click", editItemHandler);
   return newItem;
}

// Helper function for finding whether a string is alphanumeric. Can also be
// done with a regex, but probably won't be any faster.
function stringIsAlphanumeric(someString){
   for (let i = 0; i < someString.length; ++i){
      let character = someString[i];
      if (!(
            (character <= 'Z' && character >= 'A')
            || (character <= 'z' && character >= 'a')
            || (character <= '9' && character >= '0')
         )){
            return false;
         }
   }
   return true;
}


function newItemButtonHandler(event){
   
   // Figure out how many items there are already
   var newOrderNumber = $(".item_card").length;
   
   // Create an item
   var newItemCard = addListItem("", newOrderNumber);
   makeItemEditable(newItemCard);
}

// Handles button click on an "edit" button of a list item
function editItemHandler(event){
   makeItemEditable($(this).closest(".item_card"));
}

// Makes a particular item card text editable (for editing or after creation)
function makeItemEditable(itemCard){
   var $itemContents = itemCard.find(".item_card__text").first();
   var itemText = $itemContents.text();
   var $textArea = $('<textArea class="col-7 col-md-9 item_card__text"></textArea>');
   $itemContents.replaceWith($textArea);
   $textArea.focus();
   $textArea.val(itemText);
   $textArea.on("blur", doneEditingItem);
}

// Saves an edited item
function doneEditingItem(event){

   var $textArea = $(this);
   var newItemText = $textArea.val();
   var itemCard = $textArea.closest(".item_card");
   var itemOrderIndex = itemCard.data("order");
   
   // TODO: Save item to the database
   
   // Replace input element with text
   $textArea.replaceWith('<div class="col-7 col-md-9 d-flex align-items-center item_card__text">' + newItemText + '</div>')
}

function displayListInvalid(){
   
}

function displayListNotFound(){
   // TODO: needs to be changed
   $("div").text("List not found");
}
