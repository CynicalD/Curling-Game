// Server Code
const http = require("http"); // needed for HTTP
const fs = require("fs");     // needed if you want to read and write files
const url = require("url");   // to parse url strings
const socketio = require('socket.io'); // require Socket.io

// Define constants (could be moved to a common module if desired)
const HOME_COLOUR = 'red';
const VISITOR_COLOUR = 'yellow';

// Global Game State Object: tracks players and turn
let gameState = {
  homeClient: null,         // socket.id for HOME player
  visitorClient: null,      // socket.id for VISITOR player
  spectators: [],           // Array of spectator socket IDs
  whosTurnIsIt: HOME_COLOUR // Initial turn is HOME
};

const ROOT_DIR = "html"; // directory to serve static files from

const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript", // ideally application/javascript
  json: "application/json",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain"
};

// Helper function to get MIME type based on file extension.
function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext];
    }
  }
  return MIME_TYPES["txt"];
}

// Create HTTP server to serve static files and handle simple POST requests.
const server = http.createServer(function(request, response) {
  let urlObj = url.parse(request.url, true, false);
  console.log("\n============================");
  console.log("PATHNAME: " + urlObj.pathname);
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname);
  console.log("METHOD: " + request.method);

  let receivedData = "";
  let dataObj = null;
  let returnObj = null;

  // Collect POST data
  request.on("data", function(chunk) {
    receivedData += chunk;
  });

  request.on("end", function() {
    if (request.method == "POST") {
      // For all POST messages, echo back the data.
      dataObj = JSON.parse(receivedData);
      console.log("received data object: ", dataObj);
      console.log("type: ", typeof dataObj);
      console.log("USER REQUEST: " + dataObj.text);
      returnObj = { text: dataObj.text };
      response.writeHead(200, { "Content-Type": MIME_TYPES["json"] });
      response.end(JSON.stringify(returnObj));
    } else if (request.method == "GET") {
      // Serve static files on GET request.
      var filePath = ROOT_DIR + urlObj.pathname;
      if (urlObj.pathname === "/") filePath = ROOT_DIR + "/index.html";
      fs.readFile(filePath, function(err, data) {
        if (err) {
          console.log("ERROR: " + JSON.stringify(err));
          response.writeHead(404);
          response.end(JSON.stringify(err));
          return;
        }
        response.writeHead(200, { "Content-Type": get_mime(filePath) });
        response.end(data);
      });
    }
  });
});

server.listen(3000, () => {
  console.log("Server Running at PORT 3000  CNTL-C to quit");
  console.log("To Test: http://localhost:3000/curling.html");
});

// Attach Socket.io to the server.
const io = socketio(server);

// Socket.io connection events and handlers.
io.on('connection', (socket) => {
  console.log('New client connected: ' + socket.id);

  // Registration for HOME player
  socket.on('joinAsHome', (dataJSON) => {
    const data = JSON.parse(dataJSON);
    console.log('Client ' + socket.id + ' requests to join as HOME.');
    // Allow only one HOME client (or re-assign if the same client rejoins)
    if (!gameState.homeClient || gameState.homeClient === socket.id) {
      gameState.homeClient = socket.id;
    }
    io.emit('registrationUpdate', JSON.stringify({
      homeAvailable: gameState.homeClient === null,
      visitorAvailable: gameState.visitorClient === null
    }));
  });

  // Registration for VISITOR player
  socket.on('joinAsVisitor', (dataJSON) => {
    const data = JSON.parse(dataJSON);
    console.log('Client ' + socket.id + ' requests to join as VISITOR.');
    if (!gameState.visitorClient || gameState.visitorClient === socket.id) {
      gameState.visitorClient = socket.id;
    }
    io.emit('registrationUpdate', JSON.stringify({
      homeAvailable: gameState.homeClient === null,
      visitorAvailable: gameState.visitorClient === null
    }));
  });

  // Registration for Spectator
  socket.on('joinAsSpectator', (dataJSON) => {
    const data = JSON.parse(dataJSON);
    console.log('Client ' + socket.id + ' requests to join as SPECTATOR.');
    if (!gameState.spectators.includes(socket.id)) {
      gameState.spectators.push(socket.id);
    }
    // Emit registration update even though spectators don't affect home/visitor availability.
    io.emit('registrationUpdate', JSON.stringify({
      homeAvailable: gameState.homeClient === null,
      visitorAvailable: gameState.visitorClient === null
    }));
  });

  // Handle shoot events, validating that only the active player can shoot.
  socket.on('shoot', (dataJSON) => {
    const shootData = JSON.parse(dataJSON);
    console.log('Received shoot event from client ' + socket.id + ': ', shootData);
    
    if ((gameState.whosTurnIsIt === HOME_COLOUR && socket.id === gameState.homeClient) ||
        (gameState.whosTurnIsIt === VISITOR_COLOUR && socket.id === gameState.visitorClient)) {
      
      // Process the shot here (physics, collisions, etc.) - for now we toggle the turn.
      gameState.whosTurnIsIt = (gameState.whosTurnIsIt === HOME_COLOUR) ? VISITOR_COLOUR : HOME_COLOUR;
      
      // Create an updated state object; extend as needed.
      const updatedState = {
        whosTurnIsIt: gameState.whosTurnIsIt,
        // Additional state such as stone positions, scores, etc.
      };
      
      // Broadcast the updated state to all clients.
      io.emit('stateUpdate', JSON.stringify(updatedState));
    } else {
      console.log('Unauthorized shoot attempt by client ' + socket.id);
    }
  });

  // New: Handle positionsUpdate event to relay active client stone positions.
  socket.on('positionsUpdate', (dataJSON) => {
    // Optionally, validate here if necessary before relaying.
    io.emit('positionsUpdate', dataJSON);
  });

  // Handle client disconnections (deregistration).
  socket.on('disconnect', () => {
    console.log('Client disconnected: ' + socket.id);
    
    if (socket.id === gameState.homeClient) {
      gameState.homeClient = null;
    }
    if (socket.id === gameState.visitorClient) {
      gameState.visitorClient = null;
    }
    
    let index = gameState.spectators.indexOf(socket.id);
    if (index > -1) {
      gameState.spectators.splice(index, 1);
    }
    
    io.emit('registrationUpdate', JSON.stringify({
      homeAvailable: gameState.homeClient === null,
      visitorAvailable: gameState.visitorClient === null
    }));
  });
});