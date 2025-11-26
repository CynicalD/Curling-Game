// Connect to the server using Socket.io
const socket = io();

document.addEventListener('DOMContentLoaded', function() {
  // Called after the browser has loaded the web page

  // Add mouse down listener to our canvas object
  document.getElementById('canvas1').addEventListener('mousedown', handleMouseDown);

  // Add key handlers for the document as a whole
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  // Add button handlers for player registration
  document.getElementById('JoinAsHomeButton').addEventListener('click', handleJoinAsHomeButton);
  document.getElementById('JoinAsVisitorButton').addEventListener('click', handleJoinAsVisitorButton);
  document.getElementById('JoinAsSpectatorButton').addEventListener('click', handleJoinAsSpectatorButton);

  // Initialize the animation timer
  const MILLISECONDS = 5;
  timer = setInterval(handleTimer, MILLISECONDS);

  // Enable the join buttons and set their prompt colours
  let btn = document.getElementById("JoinAsHomeButton");
  btn.disabled = false;
  btn.style.backgroundColor = HOME_PROMPT_COLOUR;
  
  btn = document.getElementById("JoinAsVisitorButton");
  btn.disabled = false;
  btn.style.backgroundColor = VISITOR_PROMPT_COLOUR;
  
  btn = document.getElementById("JoinAsSpectatorButton");
  btn.disabled = false;
  btn.style.backgroundColor = SPECTATOR_PROMPT_COLOUR;

  // Listen for registration state updates from the server
  socket.on('registrationUpdate', (dataJSON) => {
    const registrationState = JSON.parse(dataJSON);
    // Update join buttons based on the registration state
    document.getElementById('JoinAsHomeButton').disabled = !registrationState.homeAvailable;
    document.getElementById('JoinAsVisitorButton').disabled = !registrationState.visitorAvailable;
    // Typically, spectators remain enabled or update as needed.
  });

  // Listen for game state updates (e.g., after a shot)
  socket.on('stateUpdate', (dataJSON) => {
    const gameStateUpdate = JSON.parse(dataJSON);
    // Update local game state variables such as whosTurnIsIt, score, etc.
    if (gameStateUpdate.whosTurnIsIt) {
      whosTurnIsIt = gameStateUpdate.whosTurnIsIt;
    }
    if (gameStateUpdate.score) {
      score = gameStateUpdate.score;
    }
    drawCanvas();
  });

  // NEW: Listen for positions update from the active client to synchronize stone positions
  socket.on('positionsUpdate', (dataJSON) => {
    const data = JSON.parse(dataJSON);
    // Update each stone's position and velocity assuming same order in the collection
    let updatedStones = data.stones;
    for (let i = 0; i < updatedStones.length; i++) {
      let stoneData = updatedStones[i];
      let localStone = allStones.getCollection()[i];
      if (localStone) {
        localStone.x = stoneData.x;
        localStone.y = stoneData.y;
        localStone.velocityX = stoneData.velocityX;
        localStone.velocityY = stoneData.velocityY;
      }
    }
    // Update turn and score if provided
    if (data.whosTurnIsIt) {
      whosTurnIsIt = data.whosTurnIsIt;
    }
    if (data.score) {
      score = data.score;
    }
    drawCanvas();
  });

  // Initial drawing of the canvas
  drawCanvas();
});