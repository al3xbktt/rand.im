var timeout;

function getTime() {
  var now = new Date(Date.now());
  var hours = now.getHours();
  var amPM = hours >= 12 ? 'pm' : 'am';
  hours = (hours % 12 ) || 12;
  var minutes = now.getMinutes();
  if (minutes<10) minutes = "0" + minutes;
  var time = hours + ":" + minutes + amPM;
  return time
}

$('#chatbar').on( "keydown", function(e) {
  if(e.which == 13 && !e.shiftKey) {
   $("#submitButton").trigger("click");
   e.preventDefault();
   emitTyping(false);
  }
} );


$('#chatbar').on( "keypress", function() {
    emitTyping(true);
    timeout = setTimeout(timeoutFunction,10000);
  
 });


// functionality = when the client is detected typing, the socket will mark check to true for the user on the other end 
function isTyping(check=false) {
  if (check){
    var indicator = 
    `<div class="row chat isTyping" style="margin-bottom:10px;"> 
    <div class="chatoom messages-chatroom response"> <div class="response text"> <div class="typingIndicatorBubbleDot"></div>
    <div class="typingIndicatorBubbleDot"></div> <div class="typingIndicatorBubbleDot"></div></div></div></div>`;
      $("#chatroom").html($("#chatroom").html() + indicator);
    }
  if (!check){
    $('.isTyping').remove();
  }
  return check;
}

// functionality = writes the message in a chat bubble from string, detects if it's the user through boolean
function writeMessage(message, ownMessage) {
  var text;
  if (ownMessage && message.length > 0){
    text = 
    `<div class="row chat">
      <div class="chatoom messages-chatroom user"> <p class="user text">` + message + `</p> </div>
      <div class="user-time"> <p class="user time">` + getTime() + `</p></div>
      </div>`;
  }

  else if (!ownMessage && message.length > 0) {
    text = 
    `<div class="row chat">
              <div class="chatoom messages-chatroom response"> <p class="response text">` + message + `</p> </div>
              <div class="time"> <p class="response time">` + getTime() + `</p></div>
              </div>`;
  }
  $("#chatroom").html($("#chatroom").html() + text);
  $("#chatbar").scrollTop($("#chatbar")[0].scrollHeight);
  $("#chatroom").stop().animate({ scrollTop: $("#chatroom")[0].scrollHeight}, 1000);
  };
  
  //functionality = pull the other user's 
  function setResponder() {
    let responder = prompt("WIP SET RESPONDER NAME").toUpperCase();
    let length=8;
    if (responder.length <=10){
      $("#rUser").html(responder);
      $("#rUser").attr('title', responder);
    }
    else{
      $("#rUser").html(responder.slice(0,length) + "...")
      $("#rUser").attr('title', responder);
      }
    };

  //functionality = pull the client's username and set their username as it
  function setUser() {
    let queryString = window.location.search;
    let urlParam = new URLSearchParams(queryString);
    let user = urlParam.get('name');
    user = user.toUpperCase();
    let length=8;
    if (user.length <=10){
      $("#uName").html(user);
      $("#uName").attr('title', user);
    }
    else{
      $("#uName").html(user.slice(0,length) + "...");
      $("#uName").attr('title', user);
      }
    };

    function clearChat() {
      $('#chatroom').empty();
    };
    
    function timeoutFunction() {
      emitTyping(false);
    };

    function showModal(){

      $("#load-modal").attr("style","display:block");
    }
    
    function hideModal(){

      $("#load-modal").attr("style","display:hidden");
    }

    function introduce(name){

      var text = `<div class="center" style="color:#fff; margin-top:2vw; width:auto; 
      text-align:center;"><p>You're now chatting with ` + name + `, say Hi!</p><hr style="color:#fff;height:1vh;"></div>`;

      $("#chatroom").html($("#chatroom").html() + text);

    };

    function leaveRoom(name){
      var text = `<div class="center" style="color:#fff; margin-top:2vw; width:auto; 
      text-align:center;"><p>` + name + ` has left, hit "Reroll!" to find a new partner!</p></div>`;

      $("#chatroom").html($("#chatroom").html() + text);

    }

    function textAbility(check){

      if (check)
        $('#chatbar').prop("disabled",false);
      else
        $('#chatbar').prop("disabled",);


    }

    function uNameTest(){

      let name = prompt("enter name");
      acceptUsername(name);
    }

    function clearChatBar(){
      $("#chatbar").val('');
    }