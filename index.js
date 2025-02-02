import * as THREE from "https://esm.sh/three";
import { OrbitControls } from "https://esm.sh/three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "https://esm.sh/three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://esm.sh/three/examples/jsm/geometries/TextGeometry.js";

// Text variations
const textVariations = ["DOTpdf", "DOTjpg", "DOTpng"];
let currentTextIndex = 0;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Camera
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(15, 12, 19);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.1;
controls.minDistance = 23;
controls.maxDistance = 30;
controls.enablePan = false;

// Scene
const scene = new THREE.Scene();

// Lighting
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(1, 2, 5);
scene.add(dirLight);

// Raycaster for click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Load Font and Create Text
const loader = new FontLoader();
let textMesh;
let loadedFont = null; // Store font globally

loader.load("./helvetiker_regular.typeface.json", function (font) {
    console.log("✅ Font loaded successfully!");
    loadedFont = font; // Store font globally

    createText(textVariations[currentTextIndex]); // Initialize text
    animate();
});

// Function to Create Text
function createText(text) {
    if (!loadedFont) return; // Prevent errors if font is not loaded yet

    // Remove old text if it exists
    if (textMesh) {
        textMesh.geometry.dispose();
        scene.remove(textMesh);
    }

    // Create new text geometry
    const textGeometry = new TextGeometry(text, {
        font: loadedFont, // Ensure font is used
        size: 3.0,
        depth: 2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.3,
        bevelSize: 0.2,
        bevelSegments: 4,
    });

    // Apply both solid and wireframe materials
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const wireframeMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        wireframe: true,
    });

    // Combine materials
    textMesh = new THREE.Mesh(textGeometry, [textMaterial, wireframeMaterial]);

    textMesh.position.set(-7, 9, 0);
    scene.add(textMesh);
}

// Function to Handle Click or Touch
function handleInteraction(event) {
    if (event.touches) {
        // Touch event (Mobile)
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    } else {
        // Mouse event (Desktop)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(textMesh);

    if (intersects.length > 0) {
        currentTextIndex = (currentTextIndex + 1) % textVariations.length;
        createText(textVariations[currentTextIndex]); // Update text
    }
}

// Add both Click and Touch Events
window.addEventListener("click", handleInteraction);
window.addEventListener("touchstart", handleInteraction, { passive: true });

// Responsive Resize Handling
window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Animation Loop
function animate() {
    function renderLoop() {
        requestAnimationFrame(renderLoop);
        if (textMesh) textMesh.rotation.y += 0.0005;
        renderer.render(scene, camera);
        controls.update();
    }
    renderLoop();
}
