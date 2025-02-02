import * as THREE from "three";
import { OrbitControls} from "jsm/controls/OrbitControls.js";

//1. renderer
const w = window.innerWidth
const h = window.innerHeight
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

//2. camera
const fov = 75;
const aspect = w/h;
const near = 0.1;
const far = 15; 
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far );
camera.position.z = 2; 

const controls = new OrbitControls(camera, renderer.domElement); //move around 
controls.enableDamping = true;
controls.DampingFactor = 0.02;
//3. scene
const scene = new THREE.Scene();

const geo = new THREE.IcosahedronGeometry(1.0, 3); //geo object, size and detail
const mat = new THREE.MeshStandardMaterial({ // standard material
    color: 0xffffff,
    flatShading: true
});
const mesh = new THREE.Mesh(geo, mat);//passing both container 
scene.add(mesh);//adding to scene

const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true
})

const wireMesh = new THREE.Mesh(geo, wireMat);
wireMesh.scale.setScalar(1.001);
mesh.add(wireMesh);

const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500);//lighting
scene.add(hemiLight); //adding to scene

function animate(t = 0) { //animate object
    requestAnimationFrame(animate);
    mesh.rotation.y = t * 0.0001;
    renderer.render(scene, camera);
    controls.update();
}

animate();

