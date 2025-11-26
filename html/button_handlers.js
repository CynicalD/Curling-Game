function handleSubmitButton() {

  //get text from user text input field
  let userText = document.getElementById('userTextField').value
  //clear lines of text in textDiv
  let textDiv = document.getElementById("text-area")
  textDiv.innerHTML = ''

  if (userText && userText !== '') {
    let userRequestObj = {
      text: userText
    }
    let userRequestJSON = JSON.stringify(userRequestObj)
    document.getElementById('userTextField').value = ''
    //alert ("You typed: " + userText);

    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log("data: " + this.responseText)
        console.log("typeof: " + typeof this.responseText)
        //we are expecting the response text to be a JSON string
        let responseObj = JSON.parse(this.responseText)
        movingString.word = responseObj.text
      }
    }
    xhttp.open("POST", "post_data") //API .open(METHOD, URL)
    xhttp.send(userRequestJSON) //API .send(BODY)
  }
}

function handleJoinAsHomeButton() {
  console.log('handleJoinAsHomeButton()');
  let btn = document.getElementById("JoinAsHomeButton");
  btn.disabled = true; // Disable the button.
  btn.style.backgroundColor = "lightgray";

  // Emit join event with a JSON message.
  socket.emit('joinAsHome', JSON.stringify({ clientID: socket.id }));

  if (!isHomePlayerAssigned) {
    isHomePlayerAssigned = true;
    isHomeClient = true;
  }
}

function handleJoinAsVisitorButton() {
  console.log('handleJoinAsVisitorButton()');
  let btn = document.getElementById("JoinAsVisitorButton");
  btn.disabled = true; // Disable the button.
  btn.style.backgroundColor = "lightgray";

  // Emit join event with a JSON message.
  socket.emit('joinAsVisitor', JSON.stringify({ clientID: socket.id }));

  if (!isVisitorPlayerAssigned) {
    isVisitorPlayerAssigned = true;
    isVisitorClient = true;
  }
}

function handleJoinAsSpectatorButton() {
  console.log('handleJoinAsSpectatorButton()');
  let btn = document.getElementById("JoinAsSpectatorButton");
  btn.disabled = true; // Disable the button.
  btn.style.backgroundColor = "lightgray";

  // Emit join event with a JSON message.
  socket.emit('joinAsSpectator', JSON.stringify({ clientID: socket.id }));

  if (!isSpectatorClient) isSpectatorClient = true;
}
