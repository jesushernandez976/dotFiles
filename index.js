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
const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
dirLight.position.set(1, 2, 5);
scene.add(dirLight);

// Raycaster for click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Load Font and Create Text
const loader = new FontLoader();
let textMesh;
let loadedFont = null;

loader.load("./helvetiker_regular.typeface.json", function (font) {
    loadedFont = font;
    createText(textVariations[currentTextIndex]);
    animate();
});

// Function to Create Text
function createText(text) {
    if (!loadedFont) return;
    if (textMesh) {
        textMesh.geometry.dispose();
        scene.remove(textMesh);
    }

    let textSize = window.innerWidth >= 500 ? 6.0 : 3.5;
    let position = window.innerWidth >= 500 ? new THREE.Vector3(-15, 8, 0) : new THREE.Vector3(-8, 9, 0);

    const textGeometry = new TextGeometry(text, {
        font: loadedFont,
        size: textSize,
        depth: 2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.3,
        bevelSize: 0.2,
        bevelSegments: 4,
    });

    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.copy(position);
    scene.add(textMesh);
}

// Handle Click / Touch Events
function handleInteraction(event) {
    let clientX, clientY;

    if (event.touches && event.touches.length > 0) {
        // Touch event
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        // Mouse event
        clientX = event.clientX;
        clientY = event.clientY;
    }

    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(textMesh);

    if (intersects.length > 0) {
        currentTextIndex = (currentTextIndex + 1) % textVariations.length;
        createText(textVariations[currentTextIndex]);
    }
}

window.addEventListener("click", handleInteraction);
window.addEventListener("touchstart", handleInteraction, { passive: true });

// Handle Window Resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    createText(textVariations[currentTextIndex]);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    if (textMesh) textMesh.rotation.y += 0.0009;
    renderer.render(scene, camera);
    controls.update();
}

// **File Conversion Logic**
document.getElementById("convertBtn").addEventListener("click", function () {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        alert("Please select a file first!");
        return;
    }
    const selectedFormat = document.getElementById("dropdownBtn").getAttribute("data-format");
    const file = fileInput.files[0];

    if (file.type === 'application/pdf') {
        // Convert PDF to PNG/JPG
        convertPdfToImage(file, selectedFormat);
    } else if (file.type === 'image/png' || file.type === 'image/jpeg') {
        // Convert Image to PNG/JPG/PDF
        convertImageToFormat(file, selectedFormat);
    } else if (file.type === 'text/plain') {
        // Convert Text to PDF/PNG/JPG
        convertTextToFormat(file, selectedFormat);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.type === 'application/msword') {
        // Convert DOC/DOCX to PDF/PNG/JPG
        convertDocToFormat(file, selectedFormat);
    } else {
        alert("Unsupported file type!");
    }
});

// **Dropdown Format Selection**
document.querySelectorAll(".dropdown-item").forEach(item => {
    item.addEventListener("click", function () {
        const selectedFormat = item.getAttribute("data-format");
        const iconPath = `${selectedFormat}.png`;
        document.getElementById("dropdownBtn").innerHTML = `<img src="${iconPath}" alt="${selectedFormat}" width="40">`;
        document.getElementById("dropdownBtn").setAttribute("data-format", selectedFormat);
    });
});

// **Display Selected File Name**
document.getElementById("fileInput").addEventListener("change", function (event) {
    const fileNameDisplay = document.getElementById("fileNameDisplay");
    fileNameDisplay.textContent = event.target.files.length > 0 ? event.target.files[0].name : "No file selected";
});

// **Gradient Background**
function createGradientBackground() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 512;
    canvas.height = 512;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#191970");
    gradient.addColorStop(1, "#778899");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    scene.background = new THREE.CanvasTexture(canvas);
}

createGradientBackground();

const { jsPDF } = window.jspdf; // Ensure jsPDF is available


// **Convert PDF to Image (PNG/JPG)**
function convertPdfToImage(file, format) {
    const reader = new FileReader();
    reader.onload = function () {
        const loadingTask = pdfjsLib.getDocument(reader.result);
        loadingTask.promise.then(function (pdf) {
            // Ensure that the PDF is loaded
            if (!pdf) {
                console.error("Failed to load the PDF document.");
                return;
            }
            
            pdf.getPage(1).then(function (page) {
                const scale = 2; // Adjust this scale to fit your needs
                const viewport = page.getViewport({ scale: scale });

                // Create a canvas element to render the page into
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                // Render the page into the canvas
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                page.render(renderContext).promise.then(function () {
                    const imageData = canvas.toDataURL(`image/${format}`);
                    if (imageData) {
                        downloadImage(imageData, `converted.${format}`);
                    } 
                });
            });
        }).catch(error => console.error("PDF loading error:", error));
    };
    reader.readAsArrayBuffer(file);
}



// **Convert Image to JPG/PNG/PDF**
function convertImageToFormat(file, format) {
    const reader = new FileReader();
    reader.onload = function () {
        const img = new Image();
        img.src = reader.result;
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            if (format === 'pdf') {
                const pdf = new jsPDF();
                pdf.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 10, 10);
                pdf.save('converted.pdf');
            } else {
                const imageData = canvas.toDataURL(`image/${format}`);
                downloadImage(imageData, `converted.${format}`);
            }
        };
    };
    reader.readAsDataURL(file);
}

// **Convert Text to PDF/PNG/JPG**
function convertTextToFormat(file, format) {
    const reader = new FileReader();
    reader.onload = function () {
        const text = reader.result;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 800;
        context.font = '20px Arial';
        context.fillText(text, 10, 30);

        if (format === 'pdf') {
            const pdf = new jsPDF();
            pdf.text(text, 10, 10);
            pdf.save('converted.pdf');
        } else {
            const imageData = canvas.toDataURL(`image/${format}`);
            downloadImage(imageData, `converted.${format}`);
        }
    };
    reader.readAsText(file);
}

// **Convert DOC/DOCX to PDF/PNG/JPG**
function convertDocToFormat(file, format) {
    const reader = new FileReader();
    
    reader.onload = function () {
        const arrayBuffer = reader.result;

        // Convert DOCX to text using Mammoth.js
        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
            .then(result => {
                const text = result.value;
                
                if (format === "pdf") {
                    const doc = new jsPDF();
                    doc.text(text, 10, 10);
                    doc.save("converted.pdf");
                } else {
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d");
                    canvas.width = 600;
                    canvas.height = 800;
                    context.font = "20px Arial";
                    context.fillText(text, 10, 30);

                    const imageData = canvas.toDataURL(`image/${format}`);
                    downloadImage(imageData, `converted.${format}`);
                }
            })
            .catch(error => console.error("Error extracting DOCX content:", error));
    };

    reader.readAsArrayBuffer(file);
}

// **Download Image Helper**
function downloadImage(imageData, filename) {
    const a = document.createElement('a');
    a.href = imageData;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


