let socket = io.connect();

const BALL_SIZE = 1;

let patterns = {};
let patternsBuffer = {};
let patternCount = 0;
let patternCountBuf = patternCount;
let changeCount = false;

let saveData = (saveBlock) => {
  Object.keys(saveBlock).forEach(key => {
    saveBlock[key] = normalizeTime(saveBlock[key].map(x => x.coord));
  });

  socket.emit('verifyPatterns', saveBlock);
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
        document.getElementById("lockDraw").innerHTML = 'Drawing';
        if (!patterns.hasOwnProperty(patternCount)) {
          patterns[patternCount] = [];
          patternsBuffer[patternCount] = [];
        }

        let meshes = patterns[patternCount];
        let meshesBuffer = patternsBuffer[patternCount];
        changeCount = true;

        drawPath(hand, frame, meshes, meshesBuffer);
      } else {
        document.getElementById("lockDraw").innerHTML = 'Locked';
        if (changeCount) {
          patternCount++;
          patternCountBuf = patternCount;
          changeCount = false;
        }

        if (gesture.swipeDirection === SWIPE_LEFT) {
          patternCount = Math.max(0, patternCount - 1);
          patternCountBuf = patternCount;
          if (patterns.hasOwnProperty(patternCount)) {
            let meshes = patterns[patternCount];
            clearPath(meshes);
            delete patterns[patternCount];
          }
        } else if (gesture.swipeDirection === SWIPE_LEFT) {
          patternCountBuf = Math.min(patternCountBuf + 1, Object.keys(patternsBuffer).length - 1);
          if (patterns.hasOwnProperty(patternCountBuf)) {
            let meshes = patternCountBuf[patternCountBuf];
          }
        }

        if (!gesture.normalUp && gesture.palmDirection === -1) {
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
    axis.position.set(0, -10.5, 0);
    scene.add(axis);

    let pointLight = new THREE.PointLight(0xFFffff);
    pointLight.position = new THREE.Vector3(-20, 10, 0);
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
    let pusheenMaterial = new THREE.MeshLambertMaterial( { map: pusheenTexture } );
    let geometry = new THREE.BoxGeometry(40, 1, 40);
    let mesh = new THREE.Mesh(geometry, pusheenMaterial);
    mesh.position.set(0, -10, 0);
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
    pusheenMaterial = new THREE.MeshLambertMaterial( { map: pusheenTexture } );

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
    'y': hand.palmPosition[1] * 0.05 - 7,
    'z': hand.palmPosition[2] * 0.07
  }
}

let clearPath = (meshes) => meshes.forEach(x => scene.remove(x['mesh']));

let drawPath = (hand, frame, meshes, meshesBuffer) => {
  if (hand) {
    let mesh = pathQuantum.clone();
    let coord = getCoord(hand);
    mesh.position.copy(coord);
    let json = {'mesh' : mesh, 'coord' : coord};
    meshes.push(json);
    meshesBuffer.push(json);
    scene.add(mesh);
  }
}
