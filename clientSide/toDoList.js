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

function createListHandler(event){
   // Make an ajax call and wait to be issued a list slug
   $.ajax("./serverSide/RestInterface.php/Lists/new",{
         type: "POST",
         success: onListCreate
      });
}

function onListCreate(data, textStatus, jqXHR){
   // Redirect to the new list
   window.location = "./?" + data.slug;
}

// Sets up the page for displaying a list.
function displayListPage(){
   $(".page_body").append('<div class="shareable_link__div"><span class="shareable_link__label">Link: </span><span class="shareable_link__span"></span><div>');
   
   $(".shareable_link__span").text(window.location.href);
   
   // Add placeholder for title
   $(".page_body").append('<div class="list_name"><h2 class="list_name__name"></h2><i class="fa fa-edit list_name__icon"></i><div>');
   
   // Attach List title edit button handler
   $(".list_name__icon").on("click", makeTitleEditable);
   
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
   $(".record_new_item_btn").on("click", recordNewItemButtonHandler);
}

//TODO: comment, and move up
var largestUncheckedListOrder = -1;

// Populates todo list once AJAX call gets through.
function onListLoad(data, textStatus, jqXHR){
   
   $(".list_name__name").text(data.name);
   
   data.items.forEach(function(element, index){
      largestUncheckedListOrder = Math.max(largestUncheckedListOrder, element.listOrder)
      addListItem(element.content, element.listOrder, element.checked);
   });
}

// Adds an item card to the to do list container
function addListItem(contents, orderIndex, checked=0){
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
   newItem.data("checked", checked);
   
   if (checked == 0){
      newItem.find(".item_card__checkmark").css("display", "none");
   } else {
      newItem.find(".item_card__text").css("text-decoration", "line-through");
   }
   
   newItem.find(".item_card__edit_btn").on("click", editItemHandler);
   newItem.find(".item_card__delete_btn").on("click", deleteItemHandler);
   newItem.find(".item_card__checkbox").on("click", checkBoxClickHandler);
   return newItem;
}

function checkBoxClickHandler(event){
   var $itemCard = $(this).closest(".item_card");
   if ($itemCard.data("checked") != 0){
      // Make it unchecked now
      $itemCard.find(".item_card__checkmark").css("display", "none");
      $itemCard.find(".item_card__text").css("text-decoration", "");
      $itemCard.data("checked", 0);
      
      // Save item to the database
      $.ajax("./serverSide/RestInterface.php/Items/" + queryString + "/" + $itemCard.data("order"),{
         type: "POST",
         dataType: "json",
         data: {
            checked: 0
         }
      });
      
   } else {
      // Make it checked
      $itemCard.find(".item_card__checkmark").css("display", "");
      $itemCard.find(".item_card__text").css("text-decoration", "line-through");
      $itemCard.data("checked", 1);
      
      // Save item to the database
      $.ajax("./serverSide/RestInterface.php/Items/" + queryString + "/" + $itemCard.data("order"),{
         type: "POST",
         dataType: "json",
         data: {
            checked: 1
         }
      });
   }
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
   
   // Create an item
   ++largestUncheckedListOrder;  // it will have order one greater than the last
   var $newItemCard = addListItem("", largestUncheckedListOrder);
   
   // Immediately give the option to edit this item, and mark this as an item being created
   makeItemEditable($newItemCard, true);
}

function deleteItemHandler(event){
   var $itemCard = $(this).closest(".item_card");
   var listOrder = $itemCard.data("order");
   $itemCard.remove();
   
   $.ajax("./serverSide/RestInterface.php/Items/" + queryString + "/delete/" + listOrder,{
      type: "POST"
   });
}

function recordNewItemButtonHandler(event){
   
   // TODO: check what this checks (https? not chrome? not allowed?)
   if (!('webkitSpeechRecognition' in window)) {
     alert("Don't have webkitSpeechRecognition. Must use chrome, and must use https");
     return;
   }

   // Create an item
   ++largestUncheckedListOrder;  // it will have order one greater than the last
   var $newItemCard = addListItem("", largestUncheckedListOrder);
   
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


   // TODO: fill this out
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


// Handles button click on an "edit" button of a list item
function editItemHandler(event){
   makeItemEditable($(this).closest(".item_card"));
}

// Makes a particular item card text editable (for editing or after creation)
// itemIsNew: true if this is a new item
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

// Saves an edited item
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

// Inserts a new item once user is done editing it
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

function displayListInvalid(){
   
}

function displayListNotFound(){
   // TODO: needs to be changed
   $("div").text("List not found");
}

function makeTitleEditable(){
   var $titleText = $(".list_name__name");
   var titleText = $titleText.text();
   var $inputArea = $('<input type="text" class="form_control list_name__name"></input>');
   $titleText.replaceWith($inputArea);
   $inputArea.focus();
   $inputArea.val(titleText);
   
   $inputArea.on("blur", doneEditingTitle);
}

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