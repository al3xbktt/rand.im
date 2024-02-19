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

$("#chatbar").keypress(function(e) {
  if(e.which == 13 && !e.shiftKey) {
    $("#submitButton").click();
    e.preventDefault();
  }
});

function writeUserMessage() {
    let message= $("#chatbar").val();
    let  text = 
    `<div class="row chat">
      <div class="chatoom messages-chatroom user"> <p class="user text">` + message + `</p> </div>
      <div class="user-time"> <p class="user time">` + getTime() + `</p></div>
      </div>`;
    if (message.length > 0 && message.trim().length > 0){
      $("#chatroom").html($("#chatroom").html() + text);
      $("#chatbar").val('');
      $("#chatbar").scrollTop($("#chatbar")[0].scrollHeight);
      $("#chatroom").stop().animate({ scrollTop: $("#chatroom")[0].scrollHeight}, 1000);
    };
  };

function writeResponderMessage() {
    let message = prompt("WIP RESPOND TEST");
    let  text = 
    `<div class="row chat">
              <div class="chatoom messages-chatroom response"> <p class="response text">` + message + `</p> </div>
              <div class="time"> <p class="response time">` + getTime() + `</p></div>
              </div>`;
    if (message.length > 0 && message.trim().length > 0){
      $("#chatroom").html($("#chatroom").html() + text);
      $("#chatroom").stop().animate({ scrollTop: $("#chatroom")[0].scrollHeight}, 1000);
    };
  };

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