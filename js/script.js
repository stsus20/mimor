/* ==========================================================================
   NUESTRA GALAXIA DE AMOR — INTERACTIVIDAD Y UNIVERSO 3D (VERSIÓN CENTRADA)
   ========================================================================== */

(function () {
  "use strict";

  /* ----------------------------- 1. GALAXIA DE FONDO ----------------------------- */
  const canvas = document.getElementById("galaxy");
  const ctx = canvas.getContext("2d");
  const motionToggle = document.getElementById("motionToggle");
  const motionLabel = motionToggle.querySelector(".motion-toggle__label");
  const heartsLayer = document.getElementById("heartsLayer");

  let width = 0, height = 0, dpr = 1;
  let stars = [];
  let frameId = null, lastFrameTime = 0;
  let motionOn = true;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const TAU = Math.PI * 2;

  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  function buildStarField() {
    const area = width * height;
    const base = Math.max(120, Math.min(area / 5000, 350));
    stars = [];
    for (let i = 0; i < base * 2; i++) {
      stars.push({
        x: Math.random() * width, y: Math.random() * height,
        radius: rand(0.5, 2.2), alpha: rand(0.3, 1),
        depth: rand(0.2, 1), speed: rand(0.005, 0.015),
        phase: Math.random() * TAU, twinkle: rand(0.6, 1.8),
        hue: pick([205, 230, 270, 290, 330, 350, 45])
      });
    }
  }

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr; canvas.height = height * dpr;
    canvas.style.width = width + "px"; canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStarField();
  }

  function drawScene(dt) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";
    pointer.x += (pointer.targetX - pointer.x) * 0.045;
    pointer.y += (pointer.targetY - pointer.y) * 0.045;

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      if (motionOn) {
        star.y += star.speed * dt * 0.06;
        star.phase += star.twinkle * dt * 0.0012;
        if (star.y > height) star.y = 0;
      }
      const alpha = star.alpha * (0.5 + 0.5 * Math.sin(star.phase));
      ctx.beginPath();
      ctx.arc(star.x + pointer.x * star.depth * 15, star.y + pointer.y * star.depth * 15, star.radius, 0, TAU);
      ctx.fillStyle = `hsla(${star.hue}, 85%, 88%, ${alpha})`;
      ctx.fill();
    }
  }

  function galaxyLoop(now) {
    if (!motionOn) return;
    const dt = lastFrameTime ? Math.min(now - lastFrameTime, 50) : 16;
    lastFrameTime = now;
    drawScene(dt);
    frameId = requestAnimationFrame(galaxyLoop);
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pointermove", (e) => {
    pointer.targetX = (e.clientX / width - 0.5) * 2;
    pointer.targetY = (e.clientY / height - 0.5) * 2;
  });

  motionToggle.addEventListener("click", () => {
    motionOn = !motionOn;
    motionToggle.dataset.paused = String(!motionOn);
    motionLabel.textContent = motionOn ? "Pausar estrellas" : "Reanudar estrellas";
    if (motionOn) { lastFrameTime = 0; requestAnimationFrame(galaxyLoop); }
  });

  resizeCanvas();
  requestAnimationFrame(galaxyLoop);

  /* ----------------------------- 2. CONTADOR DE TIEMPO ----------------------------- */
  const counterStart = new Date(2026, 2, 3, 0, 0, 0); // 3 de marzo de 2026
  const counterValues = {
    months: document.getElementById("countMonths"),
    days: document.getElementById("countDays"),
    hours: document.getElementById("countHours"),
    minutes: document.getElementById("countMinutes"),
    seconds: document.getElementById("countSeconds")
  };

  function updateCounter() {
    const now = new Date();
    let diff = Math.max(0, now - counterStart);

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    
    let months = (now.getFullYear() - counterStart.getFullYear()) * 12 + (now.getMonth() - counterStart.getMonth());
    if (now.getDate() < counterStart.getDate()) months--;
    
    const tempDate = new Date(counterStart);
    tempDate.setMonth(tempDate.getMonth() + Math.max(0, months));
    const days = Math.floor((now - tempDate) / (1000 * 60 * 60 * 24));

    counterValues.months.textContent = String(Math.max(0, months)).padStart(2, "0");
    counterValues.days.textContent = String(Math.max(0, days)).padStart(2, "0");
    counterValues.hours.textContent = String(hours).padStart(2, "0");
    counterValues.minutes.textContent = String(minutes).padStart(2, "0");
    counterValues.seconds.textContent = String(seconds).padStart(2, "0");
  }

  setInterval(updateCounter, 1000);
  updateCounter();

  /* ----------------------------- 3. UNIVERSO 3D  ----------------------------- */
  const container = document.getElementById("canvas-container");
  const planetCard = document.getElementById("planet-card");
  const cardTitle = document.getElementById("card-title");
  const cardMessage = document.getElementById("card-message");
  const cardClose = document.getElementById("card-close");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

  // Función para adaptar el zoom y centrar la cámara según la pantalla
  function updateCameraPosition() {
    const isMobile = window.innerWidth < 768;
    const distance = isMobile ? 65 : 45;
    camera.position.set(0, 0, distance); // Directamente frente al origen para un centrado exacto
    camera.lookAt(0, 0, 0);
  }
  updateCameraPosition();

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Iluminación
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const sunLight = new THREE.PointLight(0xffeedd, 3, 300);
  scene.add(sunLight);

  // Grupo principal del sistema solar (Centrado en (0,0,0))
  const solarSystem = new THREE.Group();
  solarSystem.position.set(0, 0, 0);
  solarSystem.rotation.x = 0.35; // Ligera inclinación estética de las órbitas
  scene.add(solarSystem);

  // Sol
  const sunGeo = new THREE.SphereGeometry(3.5, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  sun.userData = { name: "El Sol", message: "Te amo tres millones" };
  solarSystem.add(sun);

  // Brillo del Sol
  const glowGeo = new THREE.SphereGeometry(4.0, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0.4 });
  sun.add(new THREE.Mesh(glowGeo, glowMat));

  // Planetas
  const planetData = [
    { name: "Mercurio", size: 0.45, dist: 6.5, color: 0xa6a6a6, speed: 0.03, message: "Tu eres mi camino y siempre vas a ser mi camino." },
    { name: "Venus", size: 0.75, dist: 9.5, color: 0xe3bb76, speed: 0.02, message: "Tengo que proteger lo unico que le da sentido a mi vida, esa eres tu ." },
    { name: "Tierra", size: 0.85, dist: 13, color: 0x4b9cd3, speed: 0.015, message: "En todo el planeta, jamás encontraría a alguien tan maravillosa como tú." },
    { name: "Marte", size: 0.65, dist: 16.5, color: 0xc1440e, speed: 0.012, message: "Tus locuras van con mis locuras." },
    { name: "Júpiter", size: 1.7, dist: 21.5, color: 0xd8ca9d, speed: 0.008, message: "Eres mi tristeza y mi esperanza pero sobre todo, eres mi amor." },
    { name: "Saturno", size: 1.3, dist: 26.5, color: 0xead6b8, speed: 0.006, ring: true, message: "Tu me volviste digno." },
    { name: "Urano", size: 1.0, dist: 31, color: 0xafeeee, speed: 0.004, message: "Haces que mi mundo sea único, mágico y completamente especial." },
    { name: "Neptuno", size: 0.95, dist: 35, color: 0x4682b4, speed: 0.003, message: "Hasta el rincón más lejano del universo, te elegiría una y otra vez." }
  ];

  const planets = [];

  planetData.forEach((data) => {
    // Órbita
    const orbitGeo = new THREE.RingGeometry(data.dist - 0.06, data.dist + 0.06, 64);
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.1 });
    const orbit = new THREE.Mesh(orbitGeo, orbitMat);
    orbit.rotation.x = Math.PI / 2;
    solarSystem.add(orbit);

    // Pivot para la rotación del planeta
    const pivot = new THREE.Group();
    solarSystem.add(pivot);

    // Malla del Planeta
    const geo = new THREE.SphereGeometry(data.size, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.7 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = data.dist;
    mesh.userData = { name: data.name, message: data.message };
    pivot.add(mesh);

    if (data.ring) {
      const ringGeo = new THREE.RingGeometry(data.size + 0.4, data.size + 1.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xc2b193, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      mesh.add(ring);
    }

    planets.push({ mesh, pivot, speed: data.speed });
  });

  // Easter Egg: Asteroide
  const asteroidGeo = new THREE.DodecahedronGeometry(0.5, 1);
  const asteroidMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.8 });
  const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
  asteroid.position.set(18, 4, -18);
  asteroid.userData = { name: "Asteroide", isAsteroid: true };
  solarSystem.add(asteroid);

  // Sistema de partículas de explosión 3D
  const particleCount = 200;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = 0;
    particlePositions[i + 1] = 0;
    particlePositions[i + 2] = 0;
    particleVelocities.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5
      )
    );
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xff7675,
    size: 0.6,
    transparent: true,
    opacity: 0
  });
  const explosionParticles = new THREE.Points(particleGeo, particleMat);
  solarSystem.add(explosionParticles);

  // Control manual de rotación 360°
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let cameraTargetPosition = null;
  let isZoomed = false;

  container.addEventListener("pointerdown", (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("pointermove", (e) => {
    if (!isDragging || isZoomed) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    solarSystem.rotation.y += deltaX * 0.005;
    solarSystem.rotation.x += deltaY * 0.005;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("pointerup", () => { isDragging = false; });

  // Animación continua
  let isExploding = false;

  function animateSystem() {
    requestAnimationFrame(animateSystem);

    if (motionOn && !isZoomed) {
      solarSystem.rotation.y += 0.0015;

      planets.forEach((p) => {
        p.pivot.rotation.y += p.speed * 0.5;
        p.mesh.rotation.y += 0.01;
      });

      asteroid.rotation.x += 0.01;
      asteroid.rotation.y += 0.01;
    }

    // Animación de partículas de explosión 3D
    if (isExploding) {
      const positions = explosionParticles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particleVelocities[i].x;
        positions[i * 3 + 1] += particleVelocities[i].y;
        positions[i * 3 + 2] += particleVelocities[i].z;
      }
      explosionParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Suavizado de cámara al hacer zoom
    if (cameraTargetPosition) {
      camera.position.lerp(cameraTargetPosition, 0.05);
      if (camera.position.distanceTo(cameraTargetPosition) < 0.2) {
        cameraTargetPosition = null;
      }
    }

    renderer.render(scene, camera);
  }
  animateSystem();

  // Raycasting para clics en objetos 3D
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  container.addEventListener("click", (e) => {
    if (isZoomed || isColliding) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([sun, asteroid, ...planets.map(p => p.mesh)]);

    if (intersects.length > 0) {
      const obj = intersects[0].object;

      if (obj.userData.isAsteroid) {
        triggerAsteroidEasterEgg();
      } else if (obj.userData.name) {
        openCard(obj);
      }
    } else {
      createHeart(e.clientX, e.clientY);
    }
  });

  function openCard(obj) {
    isZoomed = true;
    cardTitle.textContent = obj.userData.name;
    cardMessage.textContent = obj.userData.message;
    planetCard.classList.remove("hidden");

    const worldPos = new THREE.Vector3();
    obj.getWorldPosition(worldPos);
    cameraTargetPosition = new THREE.Vector3(worldPos.x, worldPos.y + 1, worldPos.z + 7);
  }

  function resetCameraPosition() {
    const isMobile = window.innerWidth < 768;
    cameraTargetPosition = new THREE.Vector3(0, 0, isMobile ? 65 : 45);
  }

  cardClose.addEventListener("click", () => {
    planetCard.classList.add("hidden");
    resetCameraPosition();
    setTimeout(() => { isZoomed = false; }, 800);
  });

  /* ----------------------------- 4. EASTER EGG ASTEROIDE MEJORADO ----------------------------- */
  const easterEggOverlay = document.getElementById("easter-egg-overlay");
  const flash = easterEggOverlay.querySelector(".explosion-flash");
  let isColliding = false;

  function triggerAsteroidEasterEgg() {
    if (isColliding) return;
    isColliding = true;
    planetCard.classList.add("hidden");

    const startTime = performance.now();
    const startPos = asteroid.position.clone();
    const targetPos = new THREE.Vector3(0, 0, 0);

    function animateCollision(now) {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / 1.2, 1);

      asteroid.position.lerpVectors(startPos, targetPos, progress);

      if (progress < 1) {
        requestAnimationFrame(animateCollision);
      } else {
        // Impacto 3D
        isExploding = true;
        particleMat.opacity = 1;

        easterEggOverlay.classList.remove("hidden");
        setTimeout(() => easterEggOverlay.classList.add("active"), 50);

        flash.style.opacity = "1";
        flash.style.transition = "opacity 0.2s ease";

        setTimeout(() => {
          flash.style.transition = "opacity 3.5s ease";
          flash.style.opacity = "0.95";
          easterEggOverlay.classList.add("show-text");
        }, 300);

        // Reset después de 5.5 segundos
        setTimeout(() => {
          easterEggOverlay.classList.remove("show-text", "active");
          setTimeout(() => {
            easterEggOverlay.classList.add("hidden");
            flash.style.opacity = "0";
            asteroid.position.set(18, 4, -18);
            
            // Reset de partículas
            isExploding = false;
            particleMat.opacity = 0;
            const positions = explosionParticles.geometry.attributes.position.array;
            for (let i = 0; i < particleCount * 3; i++) positions[i] = 0;
            explosionParticles.geometry.attributes.position.needsUpdate = true;

            isColliding = false;
            isZoomed = false;
            resetCameraPosition();
          }, 1000);
        }, 5500);
      }
    }
    requestAnimationFrame(animateCollision);
  }

  /* ----------------------------- 5. CORAZONES AL CLIC ----------------------------- */
  function createHeart(x, y) {
    const heart = document.createElement("span");
    heart.className = "heart-pop";
    heart.textContent = "♥";
    heart.style.left = x + "px";
    heart.style.top = y + "px";
    heart.style.setProperty("--dx", rand(-40, 40) + "px");
    heart.style.setProperty("--dy", -rand(80, 140) + "px");
    heart.style.setProperty("--size", rand(14, 24) + "px");
    heart.style.setProperty("--rot", rand(-30, 30) + "deg");
    heartsLayer.appendChild(heart);
    setTimeout(() => heart.remove(), 1600);
  }

  // Ajuste al cambiar tamaño de pantalla
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateCameraPosition();
  });
})();
