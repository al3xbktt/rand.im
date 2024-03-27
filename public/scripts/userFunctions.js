var passNeeded = false;
var passNotYet = true;
var registrationMode = false;
document.getElementById('custom-button').addEventListener('click', function() {
    const name = document.getElementById('nameInput').value;

    if (name && passNotYet && !registrationMode) {

      const data = {
        username: name
        }

        $.post("/api/login/check", data,function (data) {
            console.log("done");
            passNeeded = data;
            if (passNeeded){
                alreadyRegistered(name);
                passNotYet = false;
            }
            else{
                alert(`Welcome: ${name}`);
                window.location.href = "chatroom";
            }
        });
        
        
    }

    
    else if (!name && passNotYet && !registrationMode) {
      alert('Please type your name before joining.');
    }

    if (passNeeded && !registrationMode){
    const pass = document.getElementById('passInput').value;
    if (name && pass) {        
        
        const data = {
            username: name,
            password: pass        
        }
    
      $.post("/api/login/authenticate", data,function (data) {
        console.log("done");
        authenticated = data;
        if (authenticated){
            alert(`Welcome: ${name}`);
            window.location.href = "chatroom";
        }
        else{
            alert('Incorrect password provided');
        }
    });
   
    } else {
      alert('Please enter your name and password before logging in.');
    }
  }

  if (passNeeded && registrationMode){
    const pass = document.getElementById('passInput').value;
    if (name && pass) {        
        
        const data = {
            username: name,
            password: pass        
        }
    
      $.post("/api/login/create", data,function (data) {
        console.log("done");
        alert(`Welcome: ${name}`);
        window.location.href = "chatroom";
   
    }); 
    }
    else {
      alert('Please enter a name and password before logging in.');
    }
  }
    return false;
  });

// when enter is hit, allow it to do the function of the button
$('#nameInput').on( "keydown", function(e) {
    if(e.which == 13 && !e.shiftKey) {
     $("#custom-button").trigger("click");
     e.preventDefault();
    }
});

$('#passInput').on( "keydown", function(e) {
    if(e.which == 13 && !e.shiftKey) {
     $("#custom-button").trigger("click");
     e.preventDefault();
    }
});

// Changes html from "Enter Username" to "Enter Username and Password"
function alreadyRegistered(name){
    $('#registration').empty();
    $( "#passInput" ).remove();
    passNeeded = true;
    var registerText = `This username is already registered!`;
    $('#alreadyRegistered').html($("#alreadyRegistered").html() + registerText);
    var passInput = `<input type="password" style="color:white;" 
    id="passInput" placeholder="Type your password here...">`
    $('#inputArea').html($("#inputArea").html() + passInput);
    $('#userImage').css('width','250px');
    $('#userImage').css('height','250px');
    $('#nameInput').css('width','250px');
    $('#passInput').css('width','250px');
    $('#nameInput').val(name);    

};

function registration(name,button){
    button.disabled = true;
    passNeeded = true;
    registrationMode = true;
    var registerText = `Type in password to register username ` + name;
    $('#registration').html($("#registration").html() + registerText);
    var passInput = `<input type="password" style="color:white;" 
    id="passInput" placeholder="Type your password here...">`
    $('#inputArea').html($("#inputArea").html() + passInput);
    $('#userImage').css('width','250px');
    $('#userImage').css('height','250px');
    $('#nameInput').css('width','250px');
    $('#passInput').css('width','250px');
    $('#nameInput').val(name);    

};