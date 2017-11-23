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
         success: onListLoad,
         error: displayListNotFound
      });
      
   } else {
      displayListInvalid();
   }
});

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

function createLandingPage(){
   
}

function displayListInvalid(){
   console.log("no")
}

function displayListNotFound(){
   // TODO: needs to be changed
   $("div").text("List not found");
}

// Function to execute once AJAX call goes through
function onListLoad(data, textStatus, jqXHR){
   
   data.forEach(function(element, index){
      $(".to_do_list").append("<li>" + element.content + "</li>");
   });

}
