function writeUserMessage() {
    let message= $("#chatbar").val();
    let  text = 
    `<div class="row chat">
      <div class="chatoom messages-chatroom user"> <p class="user text">` + message + `</p> </div>
      <div class="user-time"> <p class="user time">10:30pm</p></div>
      </div>`;

    $("#chatroom").html($("#chatroom").html() + text);
    $("#chatbar").val('');
};

function writeResponderMessage() {
    let message = prompt("WIP RESPOND TEST");
    let  text = 
    `<div class="row chat">
              <div class="chatoom messages-chatroom response"> <p class="response text">` + message + `</p> </div>
              <div class="time"> <p class="response time">10:30pm</p></div>
              </div>`;

    $("#chatroom").html($("#chatroom").html() + text);
};

