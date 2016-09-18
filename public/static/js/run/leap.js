let socket = io.connect();

const BALL_SIZE = 0.8;
const NUM_REQUIRED_PATTERNS = 3;

let patterns = {};
let patternsBuffer = {};
let patternCount = 0;
let changeCount = false;

let registering = false;

let resetRegistration = () => {
  document.getElementById('registrationCount').style.display = "none";
  document.getElementById('registerButton').style.backgroundColor = "#4CAF50";

  registering = false;
  registrationPatterns.forEach(patterns => {
    deletePatterns(patterns);
  });
  numCount = NUM_REQUIRED_PATTERNS;
}

let registerLock = () => {
  if (!registering) {
    registering = true;
    deletePatterns(patterns);
    document.getElementById('registerButton').style.backgroundColor = "red";
    document.getElementById('registrationCount').style.display = "block";
    document.getElementById('registrationCount').innerHTML =
      "Patterns Left: <b>" + numCount + "</b>";
  } else {
    resetRegistration();
  }
}

socket.on('registration', (data) => {
  if (data.success) {
    document.getElementById('registerButton').style.pointerEvents = 'auto';
    registration = false;
  }
})

let registrationPatterns = []
let numCount = NUM_REQUIRED_PATTERNS;
let tryAgain = false;

let saveData = (saveBlock) => {
  if (Object.keys(saveBlock).length > 0) {
    let coords = {}

    Object.keys(saveBlock).forEach(key => {
      coords[key] = normalizeVectors(getVectors(normalizeTime(saveBlock[key].map(x => x.coord))));
    });

    let pathTooShort = false;

    Object.keys(coords).forEach(path => {
      if (coords[path].length < SAMPLE_POINTS) {
        pathTooShort = true;
      }
    });

    tryAgain = false;

    if (registering) {
      deletePatterns(patterns);

      if (pathTooShort) {
        document.getElementById('registrationCount').innerHTML =
          "Patterns Left: <b>" + numCount + "</b> PATH TOO SHORT";
      } else {
        if (isValidPath(registrationPatterns, coords)) {
          registrationPatterns.push(coords);
          document.getElementById('registrationCount').innerHTML =
            "Patterns Left: <b>" + --numCount + "</b>";
        } else {
          document.getElementById('registrationCount').innerHTML =
            "Patterns Left: <b>" + numCount + "</b> PATTERN DOES NOT MATCH OTHERS";
          tryAgain = true;
        }

        if (numCount === 0) {
          socket.emit('registerPatterns', registrationPatterns);
          resetRegistration();
        }
      }
    } else {
      if (pathTooShort) {
        document.getElementById("deviceLock").innerHTML = 'Device: <b>Locked</b> PATH TOO SHORT';
      } else {
        socket.emit('verifyPatterns', coords);
      }
    }
  }
}

let resetVerification = false;

socket.on('returnVerification', (data) => {
  if (data.isValid) {
    document.getElementById("deviceLock").innerHTML = 'Device: <b>Unlocked</b>';
  } else {
    document.getElementById("deviceLock").innerHTML = 'Attempt: <b>Failed</b>';
  }
  resetVerification = true;
});

let deletePatterns = (col) => {
  Object.keys(col).forEach(key => {
    patternCount = 0;
    clearPath(col[key]);
    delete col[key];
  });
}

let leapMotionControl = (frame) => {
  document.getElementById("connect-leap").style.display = 'none';

  if (frame.hand) {
    if (frame.hands.length > 0) {
      let hand = frame.hands[0];
      let position = hand.palmPosition;
      let velocity = hand.palmVelocity;
      let direction = hand.direction;
      let locked = false;

      let gesture = getGesture(hand, position, gstate);

      if (!gesture.locked) {
        document.getElementById("deviceLock").innerHTML = 'Device: <b>Locked</b>';
        if (resetVerification) {
          deletePatterns(patterns);
          resetVerification = false;
        }

        document.getElementById("handLock").innerHTML = 'Hand: <b>Drawing</b>';

        if (!patterns.hasOwnProperty(patternCount)) {
          patterns[patternCount] = [];
          patternsBuffer[patternCount] = [];
        }

        let meshes = patterns[patternCount];
        changeCount = true;

        draw(hand, frame, meshes);
      } else {
        document.getElementById("handLock").innerHTML = 'Hand: <b>Locked</b>';

        if (changeCount) {
          patternCount++;
          changeCount = false;
        }

        if (gesture.swipeDirection === SWIPE_LEFT) {
          let tempCount = Math.max(0, patternCount - 1);
          if (patterns.hasOwnProperty(tempCount)) {
            patternCount = tempCount;
            let meshes = patterns[patternCount];
            clearPath(meshes);
            delete patterns[patternCount];
          }
        } else if (gesture.swipeDirection === SWIPE_LEFT) {

        } else if (!gesture.normalUp && gesture.palmDirection === -1) {
          saveData(patterns);
        }
      }
    } else {
      gstate = new GestureState();
    }
  }
}

(function() {
  let getParam = (name) => {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    let regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    let results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  let initScene = (element) => {
    window.scene = new THREE.Scene();
    window.renderer = new THREE.WebGLRenderer({
      alpha: 1,
      antialias: true,
      clearColor: 0xffffff
    });

    renderer.setSize(window.innerWidth, window.innerHeight);

    element.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0x888888));

    let axis = new THREE.AxisHelper(8);
    axis.position.set(0, -9, 0);
    scene.add(axis);

    let pointLight = new THREE.PointLight(0xFFffff);
    pointLight.position = new THREE.Vector3(-20, 9, 0);
    pointLight.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(pointLight);

    window.camera = new THREE.PerspectiveCamera(110, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.set(0, 12, 35);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    window.controls = new THREE.TrackballControls(camera);
    scene.add(camera);

    let material = new THREE.MeshBasicMaterial({
      color: '#708BD6'
    });

    let pusheenElem = document.getElementById("pusheen");
    let pusheenTexture = THREE.ImageUtils.loadTexture(pusheenElem.src);
    let pusheenMaterial = new THREE.MeshLambertMaterial({
      map: pusheenTexture
    });
    let geometry = new THREE.BoxGeometry(40, 1, 40);
    let mesh = new THREE.Mesh(geometry, pusheenMaterial);
    mesh.position.set(0, -9, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    scene.add(mesh);

    geometry = new THREE.SphereGeometry(BALL_SIZE);
    material = new THREE.MeshLambertMaterial({
      color: '#828282',
      opacity: 1
    });

    pusheenElem = document.getElementById("pusheen-dot");
    pusheenTexture = THREE.ImageUtils.loadTexture(pusheenElem.src);
    pusheenMaterial = new THREE.MeshLambertMaterial({
      map: pusheenTexture
    });

    window.pathQuantum = new THREE.Mesh(geometry, pusheenMaterial);
    pathQuantum.castShadow = true;
    pathQuantum.receiveShadow = true;

    window.gstate = new GestureState();

    window.dataPoints = [];

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      controls.handleResize();

      return renderer.render(scene, camera);
    }, false);

    return renderer.render(scene, camera);
  };

  initScene(document.body);

  (new Leap.Controller).use('playback', {
    timeBetweenLoops: 20
  }).use('riggedHand', {
    parent: scene,
    renderFn: () => {
      renderer.render(scene, camera);
      return controls.update();
    },
    materialOptions: {
      wireframe: getParam('wireframe')
    },
    dotsMode: getParam('dots'),
    camera: camera
  }).connect().on('frame', leapMotionControl);
}).call(this);

let getCoord = (hand) => {
  return {
    'x': hand.palmPosition[0] * 0.07,
    'y': hand.palmPosition[1] * 0.05 - 7.5,
    'z': hand.palmPosition[2] * 0.07
  }
}

let clearPath = (meshes) => meshes.forEach(x => scene.remove(x['mesh']));
let drawPath = (meshes) => meshes.forEach(x => scene.add(x['mesh']));

let draw = (hand, frame, meshes) => {
  if (hand) {
    let mesh = pathQuantum.clone();
    let coord = getCoord(hand);
    mesh.position.copy(coord);

    let json = {
      'mesh': mesh,
      'coord': coord
    };

    meshes.push(json);

    scene.add(mesh);
  }
}