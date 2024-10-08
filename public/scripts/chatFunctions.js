var timeout;

//functionality = get the current time and write it into a readable format
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

//functionality = when the user hits enter and only enter, trigger the send button
$('#chatbar').on( "keydown", function(e) {
  if(e.which == 13 && !e.shiftKey) {
   $("#submitButton").trigger("click");
   e.preventDefault();
   emitTyping(false);
  }
} );


//functionality = on keypress, emit that the user is typing to the other and set a timeout
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
function setResponder(name) {
    name=name.toUpperCase();
    let length=8;
    if (name.length <=10){
      $("#rUser").html(name);
      $("#rUser").attr('title', name);
    }
    else{
      $("#rUser").html(name.slice(0,length) + "...")
      $("#rUser").attr('title', name);
      }
};

//functionality = pull the client's username and set their username as it
function setUser(name) {
    name = name.toUpperCase();
    let length=8;
    if (name.length <=10){
      $("#uName").html(name);
      $("#uName").attr('title', name);
    }
    else{
      $("#uName").html(name.slice(0,length) + "...");
      $("#uName").attr('title', name);
      }
};

//functionality = clear chatroom
function clearChat() {
    $('#chatroom').empty();
};
    
//functionality = emit the timeout from typing
function timeoutFunction() {
      emitTyping(false);
};

//functionality = show the loading modal
function showLoadModal(){
  $("#load-modal").attr("style","display:block");
}
    
//functionality = hide the loading modal
function hideLoadModal(){
  $("#load-modal").attr("style","display:hidden");
}

function showMediaModal(){
  $("#media-modal").attr("style","display:block");
}
    
//functionality = hide the loading modal
function hideMediaModal(){
  $("#media-modal").attr("style","display:hidden");
}

function mediaResponse(answer){

  hideMediaModal();
  mediaAnswer(answer);


}

//functionality = write introduction to other user with username
function introduce(name){
  let length = 20;
  if (name.length > length){
    name = name.slice(0,length);
    var text = `<div class="center" style="color:#fff; margin-top:2vw; width:auto; 
    text-align:center;"><p>You're now chatting with ` + name + `..., say Hi!</p><hr style="color:#fff;height:1vh;"></div>`;
  }
  else{
    var text = `<div class="center" style="color:#fff; margin-top:2vw; width:auto; 
    text-align:center;"><p>You're now chatting with ` + name + `, say Hi!</p><hr style="color:#fff;height:1vh;"></div>`;
  }
  
  $("#chatroom").html($("#chatroom").html() + text);

};

//functionality = write to the chatroom div that the remaining user's peer has left the chatroom
function leaveRoom(name){
  let length = 20;
  if (name.length > length){
    name = name.slice(0,length);
    var text = `<div class="center" style="color:#fff; margin-top:2vw; width:auto; 
    text-align:center;"><p>` + name + `... has left, hit "Reroll!" to find a new partner!</p></div>`;
  }
  else {
    var text = `<div class="center" style="color:#fff; margin-top:2vw; width:auto; 
    text-align:center;"><p>` + name + ` has left, hit "Reroll!" to find a new partner!</p></div>`; 
  }

  $("#chatroom").html($("#chatroom").html() + text);

};

//functionality = remove current users typing ability
function textAbility(check){

  if (check)
    $('#chatbar').prop("disabled",false);
  else
    $('#chatbar').prop("disabled",);
  
};

function clearChatBar(){
      $("#chatbar").val('');
}

function replaceCard(isUser,name){
  name = name.toUpperCase();
  if (isUser){
    var text = `
    <img src="/public/images/user.png" style="border-radius: 50%; width:10vw;" class="center">
    <center><h2 class="card-title"id="uName" style="color:#fff; font-size:2.5vw; font-weight:bold;">`+ name + `</h2></center>
  `
    $('#userVideo').html(text);
  }
  else {
    var text = `
    <img src="/public/images/user.png" style="border-radius: 50%; width:10vw;" class="center">
    <center><h2 class="card-title" id="rUser" style="color:#fff; font-size:2.5vw; font-weight:bold;" data-toggle="tooltip" data-placement="bottom">` + name  +`</h2></center>
  `
    $('#peerVideo').html(text);

  }

}

function switchMic(isUser,micSwitch){
  if (isUser && micSwitch){
    var text = `<h1><i class="bi bi-mic"></i></h1>`
        $('#userMicSpot').html(text)
  }
  else if (isUser && !micSwitch){
    var text = `<h1><i class="bi bi-mic-mute"></i></h1>`
        $('#userMicSpot').html(text)
  }

  else if (!isUser && micSwitch){
    var text = `<h1><i class="bi bi-mic"></i></h1>`
      $('#peerMicSpot').html(text)
  }

  else if (!isUser && !micSwitch){
    var text = `<h1><i class="bi bi-mic-mute"></i></h1>`;
        $('#peerMicSpot').html(text)
  }

  }