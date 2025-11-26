function getCanvasMouseLocation(e) {
  //provide the mouse location relative to the upper left corner
  //of the canvas

  /*
  This code took some trial and error. If someone wants to write a
  nice tutorial on how mouse-locations work that would be great.
  */
  let rect = canvas.getBoundingClientRect()

  //account for amount the document scroll bars might be scrolled

  //get the scroll offset
  const element = document.getElementsByTagName("html")[0]
  let scrollOffsetX = element.scrollLeft
  let scrollOffsetY = element.scrollTop

  let canX = e.pageX - rect.left - scrollOffsetX
  let canY = e.pageY - rect.top - scrollOffsetY

  return {
    x: canX,
    y: canY
  }
}

function handleMouseDown(e) {
  if(enableShooting === false) return //cannot shoot when stones are in motion
  if(!isClientFor(whosTurnIsIt)) return //only allow controlling client

  let canvasMouseLoc = getCanvasMouseLocation(e)
  let canvasX = canvasMouseLoc.x
  let canvasY = canvasMouseLoc.y
  //console.log("mouse down:" + canvasX + ", " + canvasY)

  stoneBeingShot =allStones.stoneAtLocation(canvasX, canvasY)

  if(stoneBeingShot === null){
    if(iceSurface.isInShootingCrosshairArea(canvasMouseLoc)){
      if(shootingQueue.isEmpty()) stageStones()
      //console.log(`shooting from crosshair`)
      stoneBeingShot = shootingQueue.front()
      stoneBeingShot.setLocation(canvasMouseLoc)
      //we clicked near the shooting crosshair
    }
  }

  if (stoneBeingShot != null) {
    shootingCue = new Cue(canvasX, canvasY)
    document.getElementById('canvas1').addEventListener('mousemove', handleMouseMove)
    document.getElementById('canvas1').addEventListener('mouseup', handleMouseUp)

  }

  // Stop propagation of the event and stop any default
  //  browser action
  e.stopPropagation()
  e.preventDefault()

  drawCanvas()
}

function handleMouseMove(e) {


  let canvasMouseLoc = getCanvasMouseLocation(e)
  let canvasX = canvasMouseLoc.x
  let canvasY = canvasMouseLoc.y

  //console.log("mouse move: " + canvasX + "," + canvasY)

  if (shootingCue != null) {
    shootingCue.setCueEnd(canvasX, canvasY)
  }

  e.stopPropagation()

  drawCanvas()
}

function handleMouseUp(e) {
  e.stopPropagation();
  if (shootingCue != null) {
    let cueVelocity = shootingCue.getVelocity();
    if (stoneBeingShot != null) {
      stoneBeingShot.addVelocity(cueVelocity);
      // Emit the shoot event as a JSON message with stone data.
      socket.emit('shoot', JSON.stringify({
        stoneID: stoneBeingShot.toString(), // Replace with a unique ID if available.
        velocity: cueVelocity,
        stoneLocation: stoneBeingShot.getLocation()
      }));
    }
    shootingCue = null;
    shootingQueue.dequeue();
    enableShooting = false; // Disable shooting until the stone stops.
  }

  // Remove mousemove and mouseup listeners while leaving mousedown intact.
  document.getElementById('canvas1').removeEventListener('mousemove', handleMouseMove);
  document.getElementById('canvas1').removeEventListener('mouseup', handleMouseUp);

  drawCanvas(); // Redraw the canvas.
}
