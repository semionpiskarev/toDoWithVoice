/**
   Core client-side code for interacting with the to-do list app.
*/

// Since we use the "order" property as an identifier, we need to keep
// track of the largest order value to insert new items. The database will
// automatically set the order, so this is just for our own record keeping.
var largestListOrder = -1;

// Sets how quickly items appear/disappear when checked and unchecked
const APPEAR_TRANSITION_DURATION = 350;

// Page initialization
$(document).ready(function(){
   
   if (queryString == ""){
      createLandingPage();
      
   // This had better be validated on the REST side! I am not sure whether it
   // would have been better to not even do this check here, just to emphasize
   // that the user could make up any kind of AJAX call.   
   } else if (stringIsAlphanumeric(queryString)){
      
      // Make an AJAX call to our REST interface to get the list items 
      $.ajax("./serverSide/RestInterface.php/" + queryString,{
         type: "GET",
         dataType: "json",
         success: displayListPage, // fills in title, list items, activates buttons
         error: displayListNotFound
      });
      
   } else {
      displayListInvalid();
   }
});

/** 
   Makes a Bootstrap jumbotron and a "create new list" button.
*/
function createLandingPage(){
   $(".page_body").append(
      '<div class="jumbotron">\
        <h1 class="jumbotron__main_title display-4">Do-It (with Voice)</h1>\
        <p class="jumbotron__main_text lead">This is a simple to-do list app with shareable links and voice control in Google Chrome.</p>\
        <hr class="my-4">\
        <p>If you have already created a list, use the shareable link to access it. Otherwise, this button will create a new list and send you there.</p>\
        <p class="jumbotron__sub_text lead">\
          <button class="btn btn-success btn-lg jumbotron__btn_create_list" role="button">Create a List</button>\
        </p>\
      </div>');
      
   $(".jumbotron__btn_create_list").on("click", createListHandler);
}

/**
   Invoked on click of "create list" button on landing page
*/
function createListHandler(event){

   // Make an ajax call and wait to be issued a list slug
   $.ajax("./serverSide/RestInterface.php/Lists/new",{
         type: "POST",
         success: function(data, textStatus, jqXHR){
            
            // Redirect to the new list
            window.location = "./?" + data.slug;
         }
      });
}

/** 
   If user navigated (or was redirected to) a specific list, construct the page
*/
function displayListPage(data, textStatus, jqXHR){
   
   // Display a "shareable link" sub-banner that shows the address of the list
   $(".page_body").append(
      '<div class="shareable_link__div">\
         <span class="shareable_link__label">Link: </span>\
         <span class="shareable_link__span">'+ window.location.href +'</span>\
      <div>');
   
   // Add placeholder list title
   $(".page_body").append(
      '<div class="list_name">\
         <h2 class="list_name__name">' + data.name + '</h2>\
         <i class="fa fa-edit list_name__icon"></i>\
      <div>');
      
   // Attach List title edit button handler
   $(".list_name__icon").on("click", makeTitleEditable);
   
   // Create places to add items
   $(".page_body").append('<div class="container to_do_list"></div>');
   $(".page_body").append('<hr>');              // line separating to-do list from done list
   $(".page_body").append('<div>Done:</div>')
   $(".page_body").append('<div class="container done_list"></div>')
   
   // The items we get are not separated into checked and unchecked (i.e., done and not done),
   // so we separate them out ourselves.
   toDoItems = [];
   doneItems = [];
   
   data.items.forEach(function(element){
      
      // Repackage the data so it's not typed as strings. 
      // The 'checkedOrder' property is nullable so it may not be sent down. If it is,
      // use the value, otherwise make it null.
      var checkedOrder = element.hasOwnProperty("checkedOrder") ? element.checkedOrder : null;
      itemData = {
         checked: parseInt(element.checked),
         order: parseInt(element.listOrder),
         content: element.content,
         checkedOrder: parseInt(checkedOrder)
      }
      
      // Update largestListOrder (since it is an identifier, do this regardless of whether
      // the item is checked or unchecked).
      largestListOrder = Math.max(largestListOrder, itemData.listOrder);
      
      // Separate out the items
      if (itemData.checked){
         doneItems.push(itemData);
      } else {
         toDoItems.push(itemData);
      }
   });
   
   // Sort things according to their order.
   toDoItems.sort(function(a, b){
      return a.listOrder - b.listOrder;
   });
   
   // Done items get sorted in reverse order, since whenever we check one off, it
   // gets added to the top of the done list
   doneItems.sort(function(a, b){
      return b.doneOrder - a.doneOrder;
   });
   
   // Finally, create the actual item divs.
   toDoItems.forEach(function(element){
      addListItem(element);
   });
   doneItems.forEach(function(element){
      addListItem(element);
   });
   
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
   $(".record_new_item_btn").on("click", recordNewItemButtonHandler);
}

/** 
   Creates an item card either in the to-do list container, or the done list container.
   
   itemData: an object containing "content", "order", and "checked" properties, and
      optionally, "checkedOrder"
*/
function addListItem(itemData){
   var newItem = $(
      '<div class="card item_card">\
         <div class="row  item_card__row">\
            <div class="col-2 col-md-1 d-flex justify-content-end align-items-center">\
               <div class="item_card__checkbox d-flex justify-content-center align-items-center">\
                  <i class="fa fa-check icon-large item_card__checkmark"></i>\
               </div>\
            </div>\
            <div class="col-7 col-md-9 d-flex align-items-center item_card__text">' + itemData.content + '</div>\
            <div class="col-3 col-md-2 d-flex justify-content-end">\
               <button type="button" class="btn btn-default btn-sm item_card__btn item_card__edit_btn"><i class="fa fa-edit"></i></button>\
               <button type="button" class="btn btn-danger btn-sm item_card__btn item_card__delete_btn"><i class="fa fa-times"></i></button>\
            </div>\
         </div>\
      </div>'
      );
      
   // Associate data with the jQuery objects corresponding to the top-level div
   // (the item "card")
   newItem.data({
      order: itemData.order,
      checkedOrder: itemData.checkedOrder,
      checked: itemData.checked
   });
   
   // Append the item into the correct container
   if (itemData.checked != 0){
      $(".done_list").append(newItem);
      newItem.find(".item_card__text").css("text-decoration", "line-through");
   } else {
      $(".to_do_list").append(newItem);
      newItem.find(".item_card__checkmark").css("display", "none");
   }
   
   // Associate handlers with parts of the item that are interactive
   newItem.find(".item_card__edit_btn").on("click", editItemHandler);
   newItem.find(".item_card__delete_btn").on("click", deleteItemHandler);
   newItem.find(".item_card__checkbox").on("click", checkBoxClickHandler);
   return newItem;
}

/**
   Moves the item between the to-do and done lists, and updates database.
*/
function checkBoxClickHandler(event){
   var $itemCard = $(this).closest(".item_card");  // get parent card
   
   // If this was a done item
   if ($itemCard.data("checked") != 0){
      
      // Make it unchecked now
      $itemCard.find(".item_card__checkmark").css("display", "none");
      $itemCard.find(".item_card__text").css("text-decoration", "");
      $itemCard.data("checked", 0);
      
      // Move the item back to to-do section:
      // Find its place
      $toDoItems = $(".to_do_list .item_card");
      var $itemToInsertAfter = null;
      for (let i = 0; i < $toDoItems.length; ++i){
         
         // We insert after the last item that has a smaller order number
         if ($($toDoItems[i]).data("order") < $itemCard.data("order")){
            $itemToInsertAfter = $toDoItems[i];
         } else {
            break;
         }
      }
      
      // Before moving to new location, create a copy at old location that can smoothly
      // disappear while the real one appears
      $itemCopy = $itemCard.clone(false); // don't copy data or event handlers
      $itemCopy.insertAfter($itemCard);
      $itemCard.hide();                   // Start real one hidden so that you can appear smoothly
      
      // If this needs to be the first item in the list
      if ($itemToInsertAfter == null) {
         $(".to_do_list").prepend($itemCard);
      
      } else {
         $itemCard.insertAfter($itemToInsertAfter);
      }
      
      // Make the items disappear/appear smoothly
      $itemCopy.slideUp(APPEAR_TRANSITION_DURATION, function(){$itemCopy.remove();});
      $itemCard.slideDown(APPEAR_TRANSITION_DURATION);
      
      // Save item to the database
      $.ajax("./serverSide/RestInterface.php/Items/" + queryString + "/" + $itemCard.data("order"),{
         type: "POST",
         dataType: "json",
         data: {
            checked: 0
         }
      });
      
   // If the item was not checked before
   } else {
      // Make it checked
      $itemCard.find(".item_card__checkmark").css("display", "");
      $itemCard.find(".item_card__text").css("text-decoration", "line-through");
      $itemCard.data("checked", 1);
      
      // Associate the correct checkedOrder, mostly to update the database later.
      // This should be done before moving the item so we query the correct existing items.
      var newCheckedOrder = 0;
      var $doneItems = $(".done_list .item_card");
      if ($doneItems.length > 0){                     // if there is a done item
         newCheckedOrder = $doneItems.first().data("checkedOrder") + 1; // our item order is 1 higher
      }
      $itemCard.data("checkedOrder", newCheckedOrder);
      
      // Move the item down to the "checked" section:
      // Create a copy that can smoothly disappear while the real one appears
      $itemCopy = $itemCard.clone(false); // don't copy data or event handlers
      $itemCopy.insertAfter($itemCard);
      $itemCard.hide();                   // Start hidden so that you can appear smoothly
      
      // We always insert done items at the top of the done list
      $(".done_list").prepend($itemCard); // moves the real itemCard
      
      // Make the items disappear/appear smoothly
      $itemCopy.slideUp(APPEAR_TRANSITION_DURATION, function(){$itemCopy.remove();});
      $itemCard.slideDown(APPEAR_TRANSITION_DURATION);

      // Save item to the database
      $.ajax("./serverSide/RestInterface.php/Items/" + queryString + "/" + $itemCard.data("order"),{
         type: "POST",
         dataType: "json",
         data: {
            checked: 1,
            checkedOrder: newCheckedOrder
         }
      });
   }
}

/**
   Creates new item inside to-do list container.
*/
function newItemButtonHandler(event){
   
   // Create an item
   ++largestListOrder;  // it will have order one greater than the last
   var $newItemCard = addListItem({
      content: "",
      order: largestListOrder,
      checked: 0,
      checkedOrder: null
   });
   
   // Immediately give the option to edit this item, and mark this as an item being created
   makeItemEditable($newItemCard, true);
}

/**
   Item deletion handler
*/
function deleteItemHandler(event){
   var $itemCard = $(this).closest(".item_card");
   var listOrder = $itemCard.data("order");
   $itemCard.remove();
   
   $.ajax("./serverSide/RestInterface.php/Items/" + queryString + "/delete/" + listOrder,{
      type: "POST"
   });
}

/** 
   Adds items using speech recognition
*/
function recordNewItemButtonHandler(event){
   
   // TODO: check what this checks (https? not chrome? not allowed?)
   if (!('webkitSpeechRecognition' in window)) {
     alert("Don't have webkitSpeechRecognition. Must use chrome, and must use https");
     return;
   }

   // Create an item
   ++largestListOrder;  // it will have order one greater than the last
   var $newItemCard = addListItem({
      content: "",
      order: largestListOrder,
      checked: 0,
      checkedOrder: null
   });
   
   var $itemContents = $newItemCard.find(".item_card__text").first();
   var $textArea = $('<textArea class="col-7 col-md-9 item_card__text"></textArea>');
   $itemContents.replaceWith($textArea);
   
   // However, actually disable typing within the item, and give a special class to the text area
   $textArea.attr("disabled", "").addClass("recording_text_area");
   
   // Get an object to interact with the voice recognizer
   var recognition = new webkitSpeechRecognition();
   var finalTranscript = '';
   var recognitionFailed = false;
   
   // Stop recognition when user pauses
   recognition.continuous = false;
   
   // Gather interim results as user speaks
   recognition.interimResults = true;

   // TODO: fill this out to give better error messages
   recognition.onerror = function(event) {
      if (event.error == 'no-speech') {
         recognitionFailed = true;
      }
      if (event.error == 'audio-capture') {
         recognitionFailed = true;
      }
      if (event.error == 'not-allowed') {
         alert("Must use chrome, must use https");
         recognitionFailed = true;
      }
   };
   
   // This gets called after every few words. Once the speech recognition thinks 
   // it is done, the results are marked as final
   recognition.onresult = function(event) {
      var interimTranscript = '';
      for (var i = event.resultIndex; i < event.results.length; ++i) {
         if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
         } else {
            interimTranscript += event.results[i][0].transcript;
         }
      }
      
      // Capitalize the first letter of the resulting sentence
      finalTranscript = finalTranscript.charAt(0).toUpperCase() + finalTranscript.slice(1);
      
      // Place the resulting text in the actual text area
      $(".recording_text_area").val(interimTranscript+finalTranscript);
   };

   // At the very end, update the database
   recognition.onend = function() {
      
      // If something went wrong, we'll still display a blank entry
      if (recognitionFailed) {
         finalTranscript = "";
      }
      
      // Pass the text area that we have been adding text to to our function
      // that completes new item creation.
      doneCreatingItem.call($(".recording_text_area").get(0));
      
   };

   recognition.start();
}

/** 
   Handles button click on an "edit" button of a list item
*/
function editItemHandler(event){
   makeItemEditable($(this).closest(".item_card"));
}

/**
   Makes a particular item card text editable (for editing or after creation)
     
   itemIsNew: true if this is a new item, which changes the interaction with the
      database.
*/
function makeItemEditable(itemCard, itemIsNew){
   var $itemContents = itemCard.find(".item_card__text").first();
   var itemText = $itemContents.text();
   var $textArea = $('<textArea class="col-7 col-md-9 item_card__text"></textArea>');
   $itemContents.replaceWith($textArea);
   $textArea.focus();
   $textArea.val(itemText);
   
   // The SQL call will differ depending on whether we are creating this item or updating it.
   if (itemIsNew){
      $textArea.on("blur", doneCreatingItem);
   } else {
      $textArea.on("blur", doneEditingItem);
   }
}

/**
   Saves an edited item.
*/
function doneEditingItem(event){

   var $textArea = $(this);
   var newItemText = $textArea.val();
   var $itemCard = $textArea.closest(".item_card");
   var itemOrderIndex = $itemCard.data("order");
   
   // Save item to the database
   $.ajax("./serverSide/RestInterface.php/Items/" + queryString + "/" + $itemCard.data("order"),{
      type: "POST",
      dataType: "json",
      data: {
         content: newItemText
         }
   });

   // Replace input element with text
   $textArea.replaceWith('<div class="col-7 col-md-9 d-flex align-items-center item_card__text">' + newItemText + '</div>');
   
   if ($itemCard.data("checked") != 0){
      $itemCard.find(".item_card__text").css("text-decoration", "line-through");
   }
}

/**
   Inserts a new item once user is done editing it
*/
function doneCreatingItem(event){

   var $textArea = $(this);
   var newItemText = $textArea.val();
   var $itemCard = $textArea.closest(".item_card");
   var itemOrderIndex = $itemCard.data("order");
   
   // Save item to the database
   $.ajax("./serverSide/RestInterface.php/Items/" + queryString + "/new",{
      type: "POST",
      dataType: "json",
      data: {
         content: newItemText
         }
   });

   // Replace input element with text
   $textArea.replaceWith('<div class="col-7 col-md-9 d-flex align-items-center item_card__text">' + newItemText + '</div>');
}

/**
   Creates the page displayed when a list slug contains invalid characters
*/
function displayListInvalid(){
   $(".page_body").append('<h2 class="error_header">List Invalid</h2>');
   $(".page_body").append('<div class="error_text">This list address is invalid.</div>');
}

/**
   Creates the page displayed when a list with a specific slug is not found
*/
function displayListNotFound(){
   $(".page_body").append('<h2 class="error_header">List Not Found</h2>');
   $(".page_body").append('<div class="error_text">We did not find this list.</div>');
}

/**
   Handles click of the title edit button
*/
function makeTitleEditable(){
   var $titleText = $(".list_name__name");
   var titleText = $titleText.text();
   var $inputArea = $('<input type="text" class="form_control list_name__name"></input>');
   $titleText.replaceWith($inputArea);
   $inputArea.focus();
   $inputArea.val(titleText);
   
   $inputArea.on("blur", doneEditingTitle);
}

/**
   Saves edited title
*/
function doneEditingTitle(){
   var $inputArea = $(this);
   var newTitleText = $inputArea.val();
   
   // Save title to the database
   $.ajax("./serverSide/RestInterface.php/Lists/" + queryString,{
      type: "POST",
      dataType: "json",
      data: {
         title: newTitleText
         }
   });

   // Replace input element with text
   $inputArea.replaceWith('<h2 class="list_name__name">' + newTitleText + '</h2>');
}

/**
   Helper function for finding whether a string is alphanumeric. Can also be
   done with a regex, but probably won't be any faster.
*/
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