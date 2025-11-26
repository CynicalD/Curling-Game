// Helper function: returns true if this client is allowed to broadcast updates.
// Assumes that HOME_COLOUR and VISITOR_COLOUR are defined globally (or in constants_and_state_vars.js)
// and that isHomeClient and isVisitorClient indicate whether this client controls that team.
function isActivePlayer() {
  if (whosTurnIsIt === HOME_COLOUR && isHomeClient === true) return true;
  if (whosTurnIsIt === VISITOR_COLOUR && isVisitorClient === true) return true;
  return false;
}

function handleTimer() {
  // Update moving string (for status display)
  movingString.x = (movingString.x + 1 * movingString.xDirection);
  movingString.y = (movingString.y + 1 * movingString.yDirection);

  // Advance stone positions in the shooting area.
  allStones.advance(iceSurface.getShootingArea());
  
  // Collision detection: check each pair of stones.
  for (let stone1 of allStones.getCollection()) {
    for (let stone2 of allStones.getCollection()) {
      if ((stone1 !== stone2) &&
          stone1.isTouching(stone2) &&
          (stone1.isStoneMoving() || stone2.isStoneMoving())) {
        setOfCollisions.addCollision(new Collision(stone1, stone2));
      }
    }
  }

  // Remove outdated collisions.
  setOfCollisions.removeOldCollisions();

  // When all stones have stopped, update the turn and score.
  if (allStones.isAllStonesStopped()) {
    if (!shootingQueue.isEmpty()) {
      whosTurnIsIt = shootingQueue.front().getColour();
    }
    score = iceSurface.getCurrentScore(allStones);
    enableShooting = true;
  }

  // Keep moving string within canvas bounds.
  if (movingString.x + movingString.stringWidth > canvas.width) movingString.xDirection = -1;
  if (movingString.x < 0) movingString.xDirection = 1;
  if (movingString.y > canvas.height) movingString.yDirection = -1;
  if (movingString.y - movingString.stringHeight < 0) movingString.yDirection = 1;

  // Draw the updated canvas.
  drawCanvas();

  // --- NEW: If this client is the active player, broadcast updated game state ---
  if (isActivePlayer()) {
    let stonesData = [];
    for (let stone of allStones.getCollection()) {
      stonesData.push({
        colour: stone.getColour(),
        x: stone.x,
        y: stone.y,
        velocityX: stone.velocityX,
        velocityY: stone.velocityY
      });
    }
    // Emit the positionsUpdate event via Socket.io using JSON.
    socket.emit('positionsUpdate', JSON.stringify({
      stones: stonesData,
      score: score,
      whosTurnIsIt: whosTurnIsIt
    }));
  }
}