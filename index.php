<?php 
   // Redirect to https if necessary.
   if ($_SERVER['HTTPS'] != "on"){
      header("Location: https://" . $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"]);
      exit();
   }
?><!DOCTYPE html>
<html lang="en">
   <head>
      <title>Do-It</title>
   
      <!-- Required meta tags for Bootstrap -->
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

      <!-- Bootstrap CSS -->
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">
      <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
      
      <!-- Our CSS -->
      <link rel="stylesheet" href="clientSide/toDoList.css">
    
      <!-- Scripts with defer will only execute after html is done parsing. These can be placed at the bottom
      of the body element instead as well, but might start being downloaded later. -->
      <script defer src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    
      <!-- Scripts for Bootstrap -->
      <script defer src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js" integrity="sha384-vFJXuSJphROIrBnz7yo7oB41mKfc8JzQZiCq4NCceLEaO4IHwicKwpJf9c9IpFgh" crossorigin="anonymous"></script>
      <script defer src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/js/bootstrap.min.js" integrity="sha384-alpBpkh1PFOepccYVYDB4do5UnbKysX5WZXm3XxPqe5iKTfUKjNkCk9SaVuEZflJ" crossorigin="anonymous"></script>
      
      <!-- Scripts for jQuery UI -->
      <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css">
      <script defer src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
      
      <!-- Our scripts. Careful- we can't defer inline JS, so jQuery is not available inline -->
      <script>
         var queryString = "<?php print($_SERVER['QUERY_STRING']); ?>";
      </script>
      <script defer src="clientSide/toDoList.js"></script>
   </head>
   <body>
      <nav class="navbar navbar-dark page_navbar">
         <a href="<?php 
            // We want this to link back to home page, independent of the server
            print(strtok($_SERVER['REQUEST_URI'], '?')); // gets everything before '?'
            ?>" class="navbar-brand">Do-It</a>
      </nav>
      
      <div class="page_body"></div>
      
      <!-- Modals (i.e., the various popups) -->
      <!-- Modal for setting a password -->
      <div class="modal fade" id="lock_list_modal" tabindex="-1" role="dialog" aria-labelledby="lock_list_modal_title" aria-hidden="true">
         <div class="modal-dialog" role="document">
            <div class="modal-content">
               <div class="modal-header">
                  <h5 class="modal-title" id="lock_list_modal_title">Lock list?</h5>
                  
                  <!-- The "x" for closing the modal-->
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                     <span aria-hidden="true">&times;</span>
                  </button>
               </div>
               <div class="modal-body">
                  <p>Your list currently does not require a password, meaning that it can be accessed by anyone who knows the shareable link.</p>
                  <p>If you set a password here, you would need both the shareable link and the password to see your list. The password can be removed later, but only if you know it.</p>
                  <div class="row">
                     <div class="col-4">
                     </div>
                     <div class="col-8 set_password_error_text modal_error_text">
                     </div>
                  </div>
                  <div class="row modal_grid_row">
                     <div class="col-4">
                        <label for="lock_list_modal__password">Password:</label>
                     </div>
                     <div class="col-8">
                        <input type="password" id="lock_list_modal__password"></input>
                     </div>
                  </div>
                  <div class="row modal_grid_row">
                     <div class="col-4">
                        <label for="lock_list_modal__password">Confirm password:</label>
                     </div>
                     <div class="col-8">
                        <input type="password" id="lock_list_modal__confirm_password"></input>
                     </div>
                  </div>
                  <div class="row modal_grid_row">
                     <div class="col-4">
                     </div>
                     <div class="col-8">
                        <button type="button" class="btn btn-warning set_password_btn">Set List Password</button>
                     </div>
                  </div>
               </div>
               <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
               </div>
            </div>
         </div>
      </div>
      
      <!-- Modal for removing a password -->
      <div class="modal fade" id="unlock_list_modal" tabindex="-1" role="dialog" aria-labelledby="unlock_list_modal_title" aria-hidden="true">
         <div class="modal-dialog" role="document">
            <div class="modal-content">
               <div class="modal-header">
                  <h5 class="modal-title" id="unlock_list_modal_title">Unlock list?</h5>
                  
                  <!-- The "x" for closing the modal-->
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                     <span aria-hidden="true">&times;</span>
                  </button>
               </div>
               <div class="modal-body">
                  <p>Your list currently requires a password.</p>
                  <p>To remove the password, making the list accessible to anyone with the shareable link, press this button.</p>
                  <div class="row modal_grid_row">
                     <div class="col-4">
                     </div>
                     <div class="col-8">
                        <button type="button" class="btn btn-warning remove_password_btn">Remove Password</button>
                     </div>
                  </div>
               </div>
               <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
               </div>
            </div>
         </div>
      </div>
      
      <!-- Modal for entering a password on a locked list -->
      <div class="modal fade" data-backdrop="static" data-keyboard="false" id="enter_password_modal" tabindex="-1" role="dialog" aria-labelledby="enter_password_modal_title" aria-hidden="true">
         <div class="modal-dialog" role="document">
            <div class="modal-content">
               <div class="modal-header">
                  <h5 class="modal-title" id="enter_password_modal_title">Password?</h5>
               </div>
               <div class="modal-body">
                  <p>This list is locked with a password.</p>
                  <div class="row">
                     <div class="col-4">
                     </div>
                     <div class="col-8 modal_error_text enter_password_error_text">
                     </div>
                  </div>
                  <div class="row modal_grid_row">
                     <div class="col-4">
                        <label for="enter_password_modal__password">Password:</label>
                     </div>
                     <div class="col-8">
                        <input type="password" id="enter_password_modal__password"></input>
                     </div>
                  </div>
                  <div class="row modal_grid_row">
                     <div class="col-4">
                     </div>
                     <div class="col-8">
                        <button type="button" class="btn btn-info enter_password_modal__submit">Proceed</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
      
   </body>
</html>