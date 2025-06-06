const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 40, 120);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solarCanvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add stars
function addStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 2000;
  const positions = [];
  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    positions.push(x, y, z);
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}
addStars();

// Sun
const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planet data: [radius, distance from sun, color, orbital speed, rotation speed]
const planetsData = [
  { name: "Mercury", radius: 1, distance: 16, color: 0xaaaaaa, orbitSpeed: 0.04, rotSpeed: 0.02 },
  { name: "Venus",   radius: 1.8, distance: 22, color: 0xffcc99, orbitSpeed: 0.015, rotSpeed: 0.018 },
  { name: "Earth",   radius: 2, distance: 30, color: 0x3399ff, orbitSpeed: 0.01, rotSpeed: 0.02 },
  { name: "Mars",    radius: 1.5, distance: 38, color: 0xff3300, orbitSpeed: 0.008, rotSpeed: 0.018 },
  { name: "Jupiter", radius: 4, distance: 50, color: 0xffcc66, orbitSpeed: 0.004, rotSpeed: 0.03 },
  { name: "Saturn",  radius: 3.5, distance: 65, color: 0xffee99, orbitSpeed: 0.003, rotSpeed: 0.028 },
  { name: "Uranus",  radius: 2.5, distance: 80, color: 0x66ffff, orbitSpeed: 0.002, rotSpeed: 0.025 },
  { name: "Neptune", radius: 2.4, distance: 95, color: 0x3366ff, orbitSpeed: 0.001, rotSpeed: 0.024 }
];

const planets = [];
const orbits = [];

planetsData.forEach(data => {
  // Planet mesh
  const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: data.color });
  const mesh = new THREE.Mesh(geometry, material);

  // Orbit group
  const orbit = new THREE.Object3D();
  orbit.add(mesh);
  mesh.position.x = data.distance;
  scene.add(orbit);

  // Store for animation
  planets.push({ mesh, orbit, ...data });
  orbits.push(orbit);

  // Optional: Add orbit ring
  const ringGeometry = new THREE.RingGeometry(data.distance - 0.05, data.distance + 0.05, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  // Saturn's ring
  if (data.name === "Saturn") {
    const saturnRingGeometry = new THREE.RingGeometry(data.radius + 1, data.radius + 3, 64);
    const saturnRingMaterial = new THREE.MeshBasicMaterial({ color: 0xcccc99, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const saturnRing = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
    saturnRing.rotation.x = Math.PI / 2;
    mesh.add(saturnRing);
  }
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2, 500);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Speed control setup
const controlsDiv = document.getElementById('controls');
const planetSpeeds = {};
let cameraTarget = { x: 0, y: 40, z: 120 };
let cameraLookAt = { x: 0, y: 0, z: 0 };
let cameraAnimating = false;
let cameraAnimStart = null;
let cameraAnimFrom = null;
let cameraAnimTo = null;
let cameraLookFrom = null;
let cameraLookTo = null;

function animateCamera(to, lookTo, duration = 1000) {
  cameraAnimating = true;
  cameraAnimStart = performance.now();
  cameraAnimFrom = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  cameraAnimTo = to;
  cameraLookFrom = { x: cameraLookAt.x, y: cameraLookAt.y, z: cameraLookAt.z };
  cameraLookTo = lookTo;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

if (controlsDiv) {
  let html = '';
  planetsData.forEach((planet, idx) => {
    planetSpeeds[planet.name] = 1.0;
    html += `
      <div style="margin-bottom:6px;">
        <label for="speed_${idx}" id="label_${idx}" style="color:white;width:80px;display:inline-block;cursor:pointer;">${planet.name}:</label>
        <input type="range" id="speed_${idx}" min="0.1" max="5" value="1" step="0.1" style="width:100px;">
        <span id="speed_val_${idx}">1.0x</span>
      </div>
    `;
  });
  html += `<button id="pauseBtn">Pause</button> <button id="resumeBtn" disabled>Resume</button> <button id="resetViewBtn">Reset View</button>`;
  controlsDiv.innerHTML = html;

  planetsData.forEach((planet, idx) => {
    const slider = document.getElementById(`speed_${idx}`);
    const valueLabel = document.getElementById(`speed_val_${idx}`);
    slider.addEventListener('input', function() {
      planetSpeeds[planet.name] = parseFloat(this.value);
      valueLabel.textContent = this.value + 'x';
    });
    // Camera focus on label click
    const label = document.getElementById(`label_${idx}`);
    label.addEventListener('click', function() {
      // Find planet mesh position
      const planetObj = planets.find(p => p.name === planet.name);
      if (planetObj) {
        // Camera target: a bit away from the planet, looking at the planet
        const mesh = planetObj.mesh;
        const worldPos = new THREE.Vector3();
        mesh.getWorldPosition(worldPos);
        // Move camera to a position offset from the planet
        const offset = 15 + planet.radius * 2;
        const camPos = { x: worldPos.x + offset, y: worldPos.y + offset, z: worldPos.z + offset };
        animateCamera(camPos, { x: worldPos.x, y: worldPos.y, z: worldPos.z });
      }
    });
  });

  // Pause and Resume logic
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  pauseBtn.addEventListener('click', function() {
    isPaused = true;
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
  });
  resumeBtn.addEventListener('click', function() {
    isPaused = false;
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
    animate();
  });
  // Reset View
  const resetViewBtn = document.getElementById('resetViewBtn');
  resetViewBtn.addEventListener('click', function() {
    animateCamera({ x: 0, y: 40, z: 120 }, { x: 0, y: 0, z: 0 });
  });
}

let isPaused = false;
function animate() {
  if (isPaused) return;
  requestAnimationFrame(animate);

  // Camera animation
  if (cameraAnimating) {
    const now = performance.now();
    const t = Math.min(1, (now - cameraAnimStart) / 1000);
    camera.position.x = lerp(cameraAnimFrom.x, cameraAnimTo.x, t);
    camera.position.y = lerp(cameraAnimFrom.y, cameraAnimTo.y, t);
    camera.position.z = lerp(cameraAnimFrom.z, cameraAnimTo.z, t);
    cameraLookAt.x = lerp(cameraLookFrom.x, cameraLookTo.x, t);
    cameraLookAt.y = lerp(cameraLookFrom.y, cameraLookTo.y, t);
    cameraLookAt.z = lerp(cameraLookFrom.z, cameraLookTo.z, t);
    if (t >= 1) cameraAnimating = false;
  }
  camera.lookAt(cameraLookAt.x, cameraLookAt.y, cameraLookAt.z);

  planets.forEach((planet, i) => {
    const planetSpeed = planetSpeeds[planet.name] || 1.0;
    planet.orbit.rotation.y += planet.orbitSpeed * planetSpeed;
    planet.mesh.rotation.y += planet.rotSpeed * planetSpeed;
  });

  renderer.render(scene, camera);
}
animate();

// Responsive resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Tooltip div for planet names
const tooltip = document.createElement('div');
tooltip.style.position = 'fixed';
tooltip.style.pointerEvents = 'none';
tooltip.style.background = 'rgba(30,30,30,0.85)';
tooltip.style.color = 'white';
tooltip.style.padding = '4px 10px';
tooltip.style.borderRadius = '6px';
tooltip.style.fontSize = '14px';
tooltip.style.display = 'none';
tooltip.style.zIndex = '1000';
document.body.appendChild(tooltip);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  // Convert mouse position to normalized device coordinates (-1 to +1)
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const planetMeshes = planets.map(p => p.mesh);
  const intersects = raycaster.intersectObjects(planetMeshes);
  if (intersects.length > 0) {
    const mesh = intersects[0].object;
    const planet = planets.find(p => p.mesh === mesh);
    if (planet) {
      tooltip.textContent = planet.name;
      tooltip.style.left = event.clientX + 12 + 'px';
      tooltip.style.top = event.clientY + 8 + 'px';
      tooltip.style.display = 'block';
      return;
    }
  }
  tooltip.style.display = 'none';
}

renderer.domElement.addEventListener('mousemove', onMouseMove);
renderer.domElement.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });