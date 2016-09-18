function GestureState() {
  this.numFists = 0;
  this.openHand = 0;
  this.isFisting = false;
  this.locked = true;
  this.numPalmMovingUp = 0;
  this.numPalmMovingDown = 0;
  this.isPalmMovingUp = false;
  this.isPalmMovingDown = false;
  this.numPalmSwipingRight = 0;
  this.numPalmSwipingLeft = 0;
  this.isPalmSwipingRight = false;
  this.isPalmSwipingLeft = false;
  this.palmSwipeCoolDown = 0;
  this.palmCoolDown = 0;
}

const MIN_VALUE = 0.35;

const MAXXPOS = 400;
const MAXYPOS = 500;
const MAXZPOS = 750;
const PALMMOVEFRAMERATE = 1;
const SWIPEFRAMERATE = 2;
const PALMCOOLDOWN = 50;
const SWIPECOOLDOWN = 20;
const PALMMOVEVELOCTIY = 450;
const LOCKFRAMERATE = 10; // increase to have elongate fisting time

function Gesture(xpos, ypos, zpos, pdirection, sdirection, normalUp, isLocked, swipeDir) {
  if (!isLocked) {
    xpos -= 30;
    ypos += 20;

    this.palmDirection = 0;
    this.normalUp = false;
    this.xpos = xpos;
    this.ypos = ypos;
    this.zpos = zpos;
  } else {
    this.xpos = xpos;
    this.ypos = ypos;
    this.zpos = zpos;
    this.palmDirection = pdirection;
    this.normalUp = normalUp;
  }
  this.locked = isLocked;
  this.swipeDirection = sdirection;
}

function getExtendedFingers(hand) {
  let f = 0;
  for (let i = 0; i < hand.fingers.length; i++) {
    if (hand.fingers[i].extended) {
      f++;
    }
  }
  return f;
}

function checkFist(hand) {
  let sum = 0;

  for (let i = 0; i < hand.fingers.length; i++) {
    let finger = hand.fingers[i];
    let meta = finger.bones[0].direction();
    let proxi = finger.bones[1].direction();
    let inter = finger.bones[2].direction();
    let dMetaProxi = Leap.vec3.dot(meta, proxi);
    let dProxiInter = Leap.vec3.dot(proxi, inter);
    sum += dMetaProxi;
    sum += dProxiInter
  }

  sum = sum / 15;

  if (sum <= MIN_VALUE && getExtendedFingers(hand) == 0) {
    return true;
  } else {
    return false;
  }
}

function checkNormal(hand) {
  return hand.palmNormal[1] > 0;
}

function checkPalm(hand) {
  let velocity = hand.palmVelocity[1];

  if (velocity > PALMMOVEVELOCTIY) {
    return 1;
  } else if (velocity < -PALMMOVEVELOCTIY) {
    return -1;
  }

  return 0;
}

let isLocked = false;
let lockCounter = 1;
let imageMode = false;
let delayLock = false;

const MAPXVELOCITY = 100;
const MAPYVELOCITY = -150;

let getGesture = function(hand, position, gstate) {
  let palmMove = checkPalm(hand);
  let palmMoveDirection = 0;
  let swipeDirection = 0;
  let zero_out_move_direction = false;
  if (gstate.palmCoolDown !== 0) {
    zero_out_move_direction = true;
    gstate.palmCoolDown--;
  }

  let zero_out_swipes = false;
  if (gstate.palmSwipeCoolDown !== 0) {
    zero_out_swipes = true;
    gstate.palmSwipeCoolDown--;
  }

  let swipeMag = (position[0] - 30) / MAXXPOS;
  if (swipeMag < -0.35) {
    gstate.isPalmSwipingLeft = false;
    gstate.numPalmSwipingLeft = 0;
    if (gstate.numPalmSwipingRight++ > SWIPEFRAMERATE) {
      if (!gstate.isPalmSwipingRight) {
        gstate.isPalmSwipingRight = true;
        swipeDirection = 1;
        if (gstate.palmSwipeCoolDown === 0) {
          gstate.palmSwipeCoolDown = SWIPECOOLDOWN;
        }
      }
    }
  } else if (swipeMag > 0.35) {
    gstate.isPalmSwipingRight = false;
    gstate.numPalmSwipingRight = 0;
    if (gstate.numPalmSwipingLeft++ > SWIPEFRAMERATE) {
      if (!gstate.isPalmSwipingLeft) {
        gstate.isPalmSwipingLeft = true;
        swipeDirection = -1;
        if (gstate.palmSwipeCoolDown === 0) {
          gstate.palmSwipeCoolDown = SWIPECOOLDOWN;
        }
      }
    }
  } else { //vertical
    gstate.isPalmSwipingLeft = false;
    gstate.isPalmSwipingRight = false;
    gstate.numPalmSwipingLeft = 0;
    gstate.numPalmSwipingRight = 0;
    swipeDirection = 0;
  }


  if (palmMove === 1) {
    gstate.isPalmMovingDown = false;
    gstate.numPalmMovingDown = 0;
    if (gstate.numPalmMovingUp++ > PALMMOVEFRAMERATE) {
      if (!gstate.isPalmMovingUp) {
        gstate.isPalmMovingUp = true;
        palmMoveDirection = 1;
        if (gstate.palmCoolDown === 0) {
          gstate.palmCoolDown = PALMCOOLDOWN;
        }
      }
    }
  } else if (palmMove === -1) {
    gstate.isPalmMovingUp = false;
    gstate.numPalmMovingUp = 0;
    if (gstate.numPalmMovingDown++ > PALMMOVEFRAMERATE) {
      if (!gstate.isPalmMovingDown) {
        gstate.isPalmMovingDown = true;
        palmMoveDirection = -1;
        if (gstate.palmCoolDown === 0) {
          gstate.palmCoolDown = PALMCOOLDOWN;
        }
      }
    }
  } else {
    gstate.isPalmMovingDown = false;
    gstate.isPalmMovingUp = false;
    gstate.numPalmMovingDown = 0;
    gstate.numPalmMovingUp = 0;
    palmMoveDirection = 0;
  }

  let normalUp = checkNormal(hand);

  if (checkFist(hand)) {
    if (gstate.numFists++ > LOCKFRAMERATE) {
      if (!gstate.isFisting) {
        gstate.isFisting = true;
        gstate.locked = !gstate.locked;
      }
    }
  } else {
    gstate.numFists = 0;
    gstate.isFisting = false;
  }

  if (zero_out_move_direction) {
    palmMoveDirection = 0;
  }
  if (zero_out_swipes) {
    swipeDirection = 0;
  }
  return new Gesture(hand.stabilizedPalmPosition[0], hand.stabilizedPalmPosition[1], hand.stabilizedPalmPosition[2], palmMoveDirection, swipeDirection, normalUp, gstate.locked);
}

const SWIPE_LEFT = 1;
const SWIPE_RIGHT = -1;