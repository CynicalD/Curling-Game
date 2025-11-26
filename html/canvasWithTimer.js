//leave this moving word for fun and for using it to
//provide status info to client.
let movingString = {
  word: "Moving",
  x: 100,
  y: 100,
  xDirection: 1, //+1 for rightwards, -1 for leftwards
  yDirection: 1, //+1 for downwards, -1 for upwards
  stringWidth: 50, //will be updated when drawn
  stringHeight: 24
} //assumed height based on drawing point size

let timer //timer for animating motion
let canvas = document.getElementById('canvas1') //our drawing canvas
let iceSurface = new Ice(canvas)

allStones = new SetOfStones() //set of all stones. sorted by lying score
homeStones = new SetOfStones() //set of home stones in no particular order
visitorStones = new SetOfStones() //set of visitor stones in no particular order
shootingQueue = new Queue() //queue of stones still to be shot
let shootingArea = iceSurface.getShootingArea()
let stoneRadius = iceSurface.nominalStoneRadius()

//create stones
for(let i=0; i<STONES_PER_TEAM; i++){
  let homeStone = new Stone(0, 0, stoneRadius, HOME_COLOUR)
  let visitorStone = new Stone(0, 0, stoneRadius, VISITOR_COLOUR)
  homeStones.add(homeStone)
  visitorStones.add(visitorStone)
  allStones.add(homeStone)
  allStones.add(visitorStone)
}


function stageStones(){
  //stage the stones in the shooting area by lining them vertically on either side
  //add stones to the shooting order queue based on the value
  //of whosTurnIsIt state variable

  if(whosTurnIsIt === HOME_COLOUR){
    for(let i=0; i<STONES_PER_TEAM; i++){
      shootingQueue.enqueue(homeStones.elementAt(i))
      shootingQueue.enqueue(visitorStones.elementAt(i))
      homeStones.elementAt(i).setLocation({x:shootingArea.x + stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
      visitorStones.elementAt(i).setLocation({x:shootingArea.x + shootingArea.width - stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})

    }
  }
  else {
    for(let i=0; i<STONES_PER_TEAM; i++){
      shootingQueue.enqueue(visitorStones.elementAt(i))
      shootingQueue.enqueue(homeStones.elementAt(i))
      homeStones.elementAt(i).setLocation({x:shootingArea.x + stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
      visitorStones.elementAt(i).setLocation({x:shootingArea.x + shootingArea.width - stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
    }

  }
}

stageStones()

//console.log(`stones: ${allStones.toString()}`)

let setOfCollisions = new SetOfCollisions()

let stoneBeingShot = null //Stone instance: stone being shot with mouse
let shootingCue = null //Cue instance: shooting cue used to shoot ball with mouse


let fontPointSize = 18 //point size for chord and lyric text
let editorFont = 'Courier New' //font for your editor -must be monospace font

function distance(fromPoint, toPoint) {
  //point1 and point2 assumed to be objects like {x:xValue, y:yValue}
  //return "as the crow flies" distance between fromPoint and toPoint
  return Math.sqrt(Math.pow(toPoint.x - fromPoint.x, 2) + Math.pow(toPoint.y - fromPoint.y, 2))
}

function drawCanvas() {

  const context = canvas.getContext('2d')

  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height) //erase canvas


  //draw playing surface
  iceSurface.draw(context, whosTurnIsIt)

  context.font = '' + fontPointSize + 'pt ' + editorFont
  context.strokeStyle = 'blue'
  context.fillStyle = 'red'

  //used for debugging. No used in the simulation
  movingString.stringWidth = context.measureText(movingString.word).width
  context.fillText(movingString.word, movingString.x, movingString.y)

  //draw the stones
  allStones.draw(context, iceSurface)
  if (shootingCue != null) shootingCue.draw(context)

  //draw the score (as topmost feature).
  iceSurface.drawScore(context, score)
}
