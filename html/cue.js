class Cue {

  constructor(x,y){
    this.cueTipX = x
    this.cueTipY = y
    this.cueEndX = x
    this.cueEndY = y
  }

  static VELOCITY_SCALE_FACTOR(){return 0.06}

  setCueEnd(x,y){this.cueEndX = x, this.cueEndY = y}
  getVelocity(){
    //get the velocity represented by this cue
    return {vx: (this.cueTipX-this.cueEndX) * Cue.VELOCITY_SCALE_FACTOR(),
            vy: (this.cueTipY-this.cueEndY) * Cue.VELOCITY_SCALE_FACTOR() }
  }

  length(fromPoint, toPoint){
    //point1 and point2 assumed to be objects like {x:xValue, y:yValue}
    //return "as the crow flies" distance between fromPoint and toPoint
    return Math.sqrt(Math.pow(this.cueTipX - this.cueEndX, 2) + Math.pow(this.cueTipY - this.cueEndY, 2))
  }

    draw(context){
    //draw line representing the shooting cue
    const CUE_COLOUR = 'black'
    context.fillStyle = CUE_COLOUR
    context.strokeStyle = CUE_COLOUR
    context.strokeWeight = 3

    context.beginPath()
    context.moveTo(this.cueTipX,this.cueTipY)
    context.lineTo(this.cueEndX,this.cueEndY)
    context.stroke()
  }
}
