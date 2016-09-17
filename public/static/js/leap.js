const minValue = 1;

let renderer;
let scene;
let camera;
let controlsl
let stats;
let material;
let size = 3;
var info, drawGeo, palm, fingers = [];

init();
let dataPoints = [];
function init() {
  // Basics
  renderer = new THREE.WebGLRenderer({
    alpha: 1,
    antialias: true,
    clearColor: 0xffffff
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.set(-50, 500, 600);
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(-50, 50, 100);

  let light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(500, 500, 0);
  // light.castShadow = true;
  scene.add(light);
  // light.shadowCameraVisible = true;

  light = new THREE.DirectionalLight(0xffffff, 1);
  light.castShadow = true;
  light.position.set(-500, 500, 0);
  scene.add(light);

  // Assets
  let material = new THREE.MeshBasicMaterial({
    color: '#708BD6'
  });

  let geometry = new THREE.CubeGeometry(600, 20, 300);
  let mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  // geometry = new THREE.CubeGeometry(100, 20, 80);
  // material = new THREE.MeshNormalMaterial();
  // palm = new THREE.Mesh(geometry, material);
  // palm.castShadow = true;
  // palm.receiveShadow = true;
  // scene.add(palm);

  geometry = new THREE.CubeGeometry(16, 12, 20);
  material = new THREE.MeshNormalMaterial();

  // for (var j = 0; j < 5; j++) {
  //   mesh = new THREE.Mesh(geometry, material);
  //   mesh.castShadow = true;
  //   mesh.receiveShadow = true;
  //   scene.add(mesh);
  //   fingers.push(mesh);
  // }

  geometry = new THREE.SphereGeometry(size);
  material = new THREE.MeshLambertMaterial({
    color: '#D64E13',
    opacity: 0.7
  });
  drawGeo = new THREE.Mesh(geometry, material);
  drawGeo.castShadow = true;
  drawGeo.receiveShadow = true;

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

let gstate = new GestureState();

let getCoord = (hand) => {
  return {'x': hand.palmPosition[0], 'y': hand.palmPosition[1], 'z': hand.palmPosition[2]}
}

let visualizeFingers = function(hand, frame) {
  let len = frame.pointables.length;
  if (hand) {
    let mesh = drawGeo.clone();
    let coord = getCoord(hand);
    mesh.position.copy(coord);
    dataPoints.push(coord);
    // mesh.translateZ(-10 - pointable.length);
    // mesh.lookAt(direction.add(finger.position));
    scene.add(mesh);
  } else {
    drawGeo.material = new THREE.MeshLambertMaterial({
      color: '#D64E13',
      opacity: 0.7
    });
  }
  // if (len > 0) {
  //   for (var i = 0; i < 5; i++) {
  //     let finger = frame.pointables[i];
  //     // console.log(finger);
  //     // if (i < len) {
  //       let pointable = frame.pointables[i];
  //       let direction = v(pointable.direction[0] , pointable.direction[1], pointable.direction[2]); // best so far
  //     // } else {
  //     //   fingers[i].visible = false;
  //     // }
  //   }
  // }
  // else if (palm.hasFingers) {
    // for (var i = 0; i < 5; i++) {
    //   fingers[i].visible = false;
    // }
    // drawGeo.material = new THREE.MeshLambertMaterial({
    //   color: '#D64E13',
    //   opacity: 0.7
    // });
    // palm.hasFingers = false;
  // }
}



Leap.loop({
  background: true,
  enableGestures: true
}, function(frame) {
  let direction;
  let hand;
  // console.log(camera.position)
  if (frame.hands.length > 0) {
    hand = frame.hands[0];
    let position = hand.palmPosition;
    let velocity = hand.palmVelocity;
    let direction = hand.direction;
    let locked = false;
    // console.log(hand.direction);
    let gesture = getGesture(hand, position, gstate);

    // palm.position.set(gesture.xpos, gesture.ypos, gesture.zpos);
    // direction = v(hand.direction[0], hand.direction[1], hand.direction[2]); // best so far
    // palm.lookAt(direction.add(palm.position));

    // palm.rotation.z = Math.atan2(hand.palmNormal[0], hand.palmNormal[1]);
    // palm.visible = true;
    // palm.hasFingers = true;
    if (!gesture.locked) {
      // console.log(gesture);
  visualizeFingers(hand, frame);
    }
  } else {
    // palm.visible = false;
    gstate = new GestureState();
  }
});

// visualizeHand(Leap.loopController);

function v(x, y, z) {
  return new THREE.Vector3(x, y, z);
}

// visualizeHand(Leap.loopController)