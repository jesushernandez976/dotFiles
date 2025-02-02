import * as THREE from "https://esm.sh/three";
import { OrbitControls } from "https://esm.sh/three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "https://esm.sh/three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://esm.sh/three/examples/jsm/geometries/TextGeometry.js";

// 1. Renderer (Optimized)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel density for performance
document.body.appendChild(renderer.domElement);

// 2. Camera (Wide-angle for mobile compatibility)
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(10, 12, 19);

// 3. Controls (Smooth movement)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.1; // Limits vertical rotation
controls.minDistance = 23; // Prevents zooming too close
controls.maxDistance = 30; // Prevents zooming too far
controls.enablePan = false; // Disable panning/ Disable excessive zoom on mobile

// 4. Scene
const scene = new THREE.Scene();

// 5. Lighting (Balanced for text visibility)
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(1, 2, 5);
scene.add(dirLight);

// 6. Load Font and Create Text
const loader = new FontLoader();
loader.load("./helvetiker_regular.typeface.json", function (font) {
    console.log("✅ Font loaded successfully!");

    const textGeometry = new TextGeometry("DOTpdf", {
        font: font,
        size: 2.5,  // Adjusted for mobile fit
        depth: 2,  // Reduced depth for performance
        curveSegments: 12,  // Less complexity = better performance
        bevelEnabled: true,
        bevelThickness: 0.3,
        bevelSize: 0.2,
        bevelSegments: 4,
    });

    // Main text material
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-7, 9, 0);
    scene.add(textMesh);

    // Wireframe Overlay (Slightly larger to create a glowing effect)
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const wireMesh = new THREE.Mesh(textGeometry, wireMat);
    wireMesh.scale.setScalar(1.0);
    textMesh.add(wireMesh);

    animate(textMesh);
});

// 7. Responsive Resize Handling
window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Prevents excessive rendering on mobile
});

// 8. Animation (Smooth FPS and better loop handling)
function animate(mesh) {
    function renderLoop() {
        requestAnimationFrame(renderLoop);
        if (mesh) mesh.rotation.y += 0.0005; // Slightly faster rotation
        renderer.render(scene, camera);
        controls.update();
    }
    renderLoop();
}
