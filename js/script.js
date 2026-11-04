/* ==========================================================================
   CARTA DE AMOR — 8 MESES
   Galaxia animada, sobre interactivo y carta con revelado progresivo.
   JavaScript vanilla, sin dependencias externas.
   ========================================================================== */

(function () {
  "use strict";

  /* ----------------------------- Referencias ----------------------------- */
  const html = document.documentElement;
  const body = document.body;

  const canvas = document.getElementById("galaxy");
  const ctx = canvas.getContext("2d");

  const motionToggle = document.getElementById("motionToggle");
  const motionLabel = motionToggle.querySelector(".motion-toggle__label");

  const envelopeScene = document.getElementById("envelopeScene");
  const envelope = document.getElementById("envelope");
  const letterScene = document.getElementById("letterScene");
  const letter = document.getElementById("letter");

  const salutation = document.getElementById("salutation");
  const salutationText = salutation.querySelector(".letter__salutation-text");

  const heartsLayer = document.getElementById("heartsLayer");
  const readHint = document.getElementById("readHint");
  const closeButtons = document.querySelectorAll(".js-close-letter");
  const revealElements = Array.prototype.slice.call(
    document.querySelectorAll(".reveal")
  );

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ----------------------------- Utilidades ------------------------------ */
  const TAU = Math.PI * 2;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function after(ms, fn) {
    return window.setTimeout(fn, ms);
  }

  /* ======================================================================
     1. GALAXIA
     ====================================================================== */

  let width = 0;
  let height = 0;
  let dpr = 1;

  let stars = [];
  let dust = [];
  let meteors = [];

  let frameId = null;
  let lastFrameTime = 0;
  let meteorTimer = 6000;

  let motionOn = !reduceMotionQuery.matches;
  let userChoseMotion = false;

  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollY = window.scrollY;

  const STAR_HUES = [205, 214, 228, 262, 280, 320, 338, 45];

  /* Crea una estrella dentro de una capa de profundidad. */
  function createStar(layer) {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: rand(layer.size[0], layer.size[1]),
      alpha: rand(layer.alpha[0], layer.alpha[1]),
      depth: layer.depth,
      speed: layer.speed * rand(0.6, 1.4),
      phase: Math.random() * TAU,
      twinkle: rand(0.5, 1.5),
      hue: pick(STAR_HUES),
      bright: Math.random() > 0.9
    };
  }

  /* Genera estrellas y polvo estelar según el tamaño de la pantalla. */
  function buildStarField() {
    const area = width * height;
    const base = Math.max(80, Math.min(area / 7000, 250));

    const layers = [
      {
        depth: 0.35,
        count: Math.round(base * 0.95),
        size: [0.4, 1.0],
        alpha: [0.22, 0.52],
        speed: 0.004
      },
      {
        depth: 0.65,
        count: Math.round(base * 0.6),
        size: [0.7, 1.5],
        alpha: [0.38, 0.75],
        speed: 0.008
      },
      {
        depth: 1,
        count: Math.round(base * 0.35),
        size: [1.1, 2.2],
        alpha: [0.6, 0.95],
        speed: 0.013
      }
    ];

    stars = [];
    layers.forEach(function (layer) {
      for (let i = 0; i < layer.count; i += 1) {
        stars.push(createStar(layer));
      }
    });

    const dustCount = Math.round(Math.max(16, Math.min(area / 26000, 52)));
    dust = [];
    for (let i = 0; i < dustCount; i += 1) {
      dust.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: rand(0.6, 1.8),
        alpha: rand(0.12, 0.34),
        vx: rand(-0.006, 0.006),
        vy: rand(-0.014, -0.003),
        phase: Math.random() * TAU,
        hue: pick([210, 280, 330, 340])
      });
    }

    meteors = [];
  }

  /* Ajusta el lienzo al tamaño real de la ventana. */
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildStarField();
    drawScene(0, true);
  }

  /* Estrella fugaz ocasional. */
  function spawnMeteor() {
    if (meteors.length >= 2) return;

    const fromLeft = Math.random() > 0.35;
    const speed = rand(0.45, 0.78);
    const angle = rand(0.28, 0.5);

    meteors.push({
      x: (fromLeft ? rand(-0.15, 0.35) : rand(0.65, 1.15)) * width,
      y: rand(-0.1, 0.35) * height,
      vx: (fromLeft ? 1 : -1) * Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: rand(70, 160),
      life: 0,
      duration: rand(800, 1500)
    });
  }

  /* Dibuja un fotograma completo. */
  function drawScene(dt, isStatic) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    if (!isStatic) {
      pointer.x += (pointer.targetX - pointer.x) * 0.045;
      pointer.y += (pointer.targetY - pointer.y) * 0.045;
    }

    const scrollShift = isStatic ? 0 : scrollY * 0.014;

    /* Polvo luminoso lejano */
    for (let i = 0; i < dust.length; i += 1) {
      const particle = dust[i];

      if (!isStatic) {
        particle.x += particle.vx * dt * 0.06;
        particle.y += particle.vy * dt * 0.06;
        particle.phase += dt * 0.001;

        if (particle.y < -12) {
          particle.y = height + 12;
          particle.x = Math.random() * width;
        }
        if (particle.x < -12) particle.x = width + 12;
        if (particle.x > width + 12) particle.x = -12;
      }

      const glow = 0.6 + 0.4 * Math.sin(particle.phase);
      const alpha = particle.alpha * glow;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, TAU);
      ctx.fillStyle = "hsla(" + particle.hue + ", 90%, 84%, " + alpha + ")";
      ctx.fill();
    }

    /* Estrellas con parallax */
    for (let i = 0; i < stars.length; i += 1) {
      const star = stars[i];

      if (!isStatic) {
        star.y += star.speed * dt * 0.06;
        star.phase += star.twinkle * dt * 0.0012;

        if (star.y > height + 4) {
          star.y = -4;
          star.x = Math.random() * width;
        }
      }

      const twinkle = 0.55 + 0.45 * Math.sin(star.phase);
      const alpha = star.alpha * twinkle;
      const offsetX = pointer.x * star.depth * 22;
      const offsetY = pointer.y * star.depth * 16 + scrollShift * star.depth;

      const x = star.x + offsetX;
      const y = star.y + offsetY;

      if (star.bright) {
        ctx.beginPath();
        ctx.arc(x, y, star.radius * 3.4, 0, TAU);
        ctx.fillStyle = "hsla(" + star.hue + ", 85%, 84%, " + alpha * 0.12 + ")";
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(x, y, star.radius, 0, TAU);
      ctx.fillStyle = "hsla(" + star.hue + ", 76%, 91%, " + alpha + ")";
      ctx.fill();
    }

    /* Estrellas fugaces */
    if (!isStatic) {
      meteorTimer -= dt;
      if (meteorTimer <= 0) {
        spawnMeteor();
        meteorTimer = rand(6500, 15000);
      }
    }

    for (let i = meteors.length - 1; i >= 0; i -= 1) {
      const meteor = meteors[i];

      if (!isStatic) {
        meteor.x += meteor.vx * dt;
        meteor.y += meteor.vy * dt;
        meteor.life += dt;
      }

      const progress = meteor.life / meteor.duration;
      if (progress >= 1) {
        meteors.splice(i, 1);
        continue;
      }

      const fade = Math.sin(Math.PI * Math.min(1, progress));
      const magnitude = Math.hypot(meteor.vx, meteor.vy) || 1;
      const tailX = meteor.x - (meteor.vx / magnitude) * meteor.length;
      const tailY = meteor.y - (meteor.vy / magnitude) * meteor.length;

      const gradient = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.72, "rgba(233, 179, 194, " + 0.5 * fade + ")");
      gradient.addColorStop(1, "rgba(255, 250, 252, " + 0.95 * fade + ")");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(meteor.x, meteor.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(meteor.x, meteor.y, 1.9, 0, TAU);
      ctx.fillStyle = "rgba(255, 244, 248, " + fade + ")";
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
  }

  /* Bucle de animación */
  function galaxyLoop(now) {
    if (!motionOn) {
      frameId = null;
      return;
    }

    const dt = lastFrameTime ? Math.min(now - lastFrameTime, 50) : 16;
    lastFrameTime = now;

    drawScene(dt, false);
    frameId = window.requestAnimationFrame(galaxyLoop);
  }

  function startGalaxy() {
    if (frameId !== null) return;
    lastFrameTime = 0;
    frameId = window.requestAnimationFrame(galaxyLoop);
  }

  function stopGalaxy() {
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  /* Activa o pausa el movimiento (estrellas + animaciones ambientales). */
  function setMotion(on, fromUser) {
    motionOn = Boolean(on);
    if (fromUser) userChoseMotion = true;

    html.dataset.motion = motionOn ? "on" : "off";

    motionToggle.dataset.paused = String(!motionOn);
    motionToggle.setAttribute(
      "aria-label",
      motionOn
        ? "Pausar estrellas: detener el movimiento de la galaxia"
        : "Reanudar estrellas: activar el movimiento de la galaxia"
    );
    motionLabel.textContent = motionOn ? "Pausar estrellas" : "Reanudar estrellas";

    if (motionOn) {
      meteorTimer = rand(2500, 6000);
      startGalaxy();
    } else {
      stopGalaxy();
      meteors = [];
      drawScene(0, true);
    }
  }

  /* ------------------------- Eventos de la galaxia ----------------------- */
  let resizeTimer = null;

  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeCanvas, 150);
  });

  window.addEventListener(
    "scroll",
    function () {
      scrollY = window.scrollY;
      if (scrollY > 70) {
        readHint.classList.add("is-hidden");
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "pointermove",
    function (event) {
      pointer.targetX = (event.clientX / width - 0.5) * 2;
      pointer.targetY = (event.clientY / height - 0.5) * 2;
    },
    { passive: true }
  );

  document.addEventListener("pointerleave", function () {
    pointer.targetX = 0;
    pointer.targetY = 0;
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopGalaxy();
    } else if (motionOn) {
      startGalaxy();
    }
  });

  motionToggle.addEventListener("click", function () {
    setMotion(!motionOn, true);
  });

  function onReducedMotionChange(event) {
    if (!userChoseMotion) {
      setMotion(!event.matches, false);
    }
  }

  if (typeof reduceMotionQuery.addEventListener === "function") {
    reduceMotionQuery.addEventListener("change", onReducedMotionChange);
  } else if (typeof reduceMotionQuery.addListener === "function") {
    reduceMotionQuery.addListener(onReducedMotionChange);
  }

  /* ======================================================================
     2. CORAZONES
     ====================================================================== */

  function createHeart(x, y, options) {
    const config = options || {};
    const heart = document.createElement("span");

    heart.className = "heart-pop";
    heart.textContent = "♥";
    heart.style.left = x + "px";
    heart.style.top = y + "px";
    heart.style.setProperty("--dx", (config.dx || 0) + "px");
    heart.style.setProperty("--dy", (config.dy || -100) + "px");
    heart.style.setProperty("--size", (config.size || 16) + "px");
    heart.style.setProperty("--rot", rand(-30, 30).toFixed(1) + "deg");
    heart.style.color = pick(["#e79ab0", "#f0b7c6", "#d98a9e", "#f3d3b0"]);
    heart.style.animationDuration = (config.duration || 1600) + "ms";

    heartsLayer.appendChild(heart);

    const removeHeart = function () {
      if (heart.parentNode) heart.parentNode.removeChild(heart);
    };

    heart.addEventListener("animationend", removeHeart, { once: true });
    after(2600, removeHeart);
  }

  /* Explosión suave de corazones al abrir el sobre. */
  function burstHearts(x, y, count) {
    const total = count || 9;

    for (let i = 0; i < total; i += 1) {
      const angle = (TAU * i) / total + rand(-0.35, 0.35);
      const distance = rand(42, 115);

      createHeart(x + Math.cos(angle) * 14, y + Math.sin(angle) * 10, {
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance - 46,
        size: rand(10, 22),
        duration: rand(1100, 1900)
      });
    }
  }

  document.addEventListener("click", function (event) {
    const target = event.target;

    if (
      target.closest(
        "button, a, input, textarea, select, .letter, .letter-actions"
      )
    ) {
      return;
    }

    createHeart(event.clientX, event.clientY, {
      dx: rand(-36, 36),
      dy: -rand(80, 135),
      size: rand(12, 24),
      duration: rand(1200, 1900)
    });
  });

  /* ======================================================================
     3. CONTADOR DE TIEMPO
     ====================================================================== */

  const counterStart = new Date(2026, 2, 3, 0, 0, 0, 0);
  const counterValues = {
    months: document.getElementById("countMonths"),
    days: document.getElementById("countDays"),
    hours: document.getElementById("countHours"),
    minutes: document.getElementById("countMinutes"),
    seconds: document.getElementById("countSeconds")
  };

  function padCounter(value) {
    return String(value).padStart(2, "0");
  }

  function addMonths(date, amount) {
    const result = new Date(date.getTime());
    const day = result.getDate();

    result.setDate(1);
    result.setMonth(result.getMonth() + amount);

    const lastDay = new Date(
      result.getFullYear(),
      result.getMonth() + 1,
      0
    ).getDate();

    result.setDate(Math.min(day, lastDay));
    return result;
  }

  function calendarDaysBetween(from, to) {
    const fromUTC = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
    const toUTC = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());

    return Math.floor((toUTC - fromUTC) / 86400000);
  }

  function getElapsedTime(now) {
    if (now <= counterStart) {
      return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    let months =
      (now.getFullYear() - counterStart.getFullYear()) * 12 +
      (now.getMonth() - counterStart.getMonth());
    let anchor = addMonths(counterStart, months);

    if (anchor > now) {
      months -= 1;
      anchor = addMonths(counterStart, months);
    }

    return {
      months: months,
      days: calendarDaysBetween(anchor, now),
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds()
    };
  }

  function updateCounter() {
    const elapsed = getElapsedTime(new Date());

    counterValues.months.textContent = padCounter(elapsed.months);
    counterValues.days.textContent = padCounter(elapsed.days);
    counterValues.hours.textContent = padCounter(elapsed.hours);
    counterValues.minutes.textContent = padCounter(elapsed.minutes);
    counterValues.seconds.textContent = padCounter(elapsed.seconds);
  }

  updateCounter();
  window.setInterval(updateCounter, 1000);
  document.addEventListener("visibilitychange", updateCounter);

  /* ======================================================================
     4. REVELADO PROGRESIVO DE LA CARTA
     ====================================================================== */

  let revealObserver = null;

  function revealElement(element) {
    const index = Number(element.dataset.revealIndex || 0);

    element.style.transitionDelay = Math.min(index, 4) * 85 + "ms";
    element.classList.add("is-visible");
    if (revealObserver) revealObserver.unobserve(element);
  }

  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) revealElement(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
  }

  revealElements.forEach(function (element, index) {
    element.dataset.revealIndex = String(index);
  });

  function resetReveals() {
    revealElements.forEach(function (element) {
      if (revealObserver) revealObserver.unobserve(element);
      element.classList.remove("is-visible");
      element.style.transitionDelay = "";
    });
  }

  function observeReveals() {
    if (!revealObserver) {
      revealElements.forEach(revealElement);
      return;
    }

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });

    /* Refuerzo para navegadores que retrasan el observer en segundo plano:
       lo que ya está en pantalla se muestra de inmediato. */
    revealElements.forEach(function (element) {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        revealElement(element);
      }
    });
  }

  /* ======================================================================
     5. SOBRE Y CARTA
     ====================================================================== */

  let letterIsOpen = false;
  let interactionBusy = false;
  let typingTimer = null;

  /* Escribe "Mi amor," letra a letra. */
  function typeSalutation() {
    const text = "Mi amor,";

    stopTyping();
    salutation.classList.remove("is-done");
    salutationText.textContent = "";

    if (!motionOn) {
      salutationText.textContent = text;
      salutation.classList.add("is-done");
      return;
    }

    let index = 0;

    typingTimer = window.setInterval(function () {
      index += 1;
      salutationText.textContent = text.slice(0, index);

      if (index >= text.length) {
        stopTyping();
        after(450, function () {
          salutation.classList.add("is-done");
        });
      }
    }, 85);
  }

  function stopTyping() {
    if (typingTimer !== null) {
      window.clearInterval(typingTimer);
      typingTimer = null;
    }
  }

  function resetSalutation() {
    stopTyping();
    salutation.classList.remove("is-done");
    salutationText.textContent = "";
  }

  /* Abre la carta: sobre -> animación -> lectura. */
  function openLetter() {
    if (letterIsOpen || interactionBusy) return;

    interactionBusy = true;
    letterIsOpen = true;
    body.classList.add("is-reading");

    const rect = envelope.getBoundingClientRect();
    burstHearts(
      rect.left + rect.width / 2,
      rect.top + rect.height * 0.48,
      10
    );

    envelope.classList.add("is-open");
    envelope.setAttribute("aria-expanded", "true");
    envelopeScene.classList.add("is-opening");

    letterScene.hidden = false;
    body.classList.remove("is-sealed");
    window.scrollTo(0, 0);

    resetReveals();
    resetSalutation();
    readHint.classList.remove("is-hidden");

    after(40, function () {
      letterScene.classList.add("is-active");
    });

    after(1050, function () {
      envelopeScene.classList.add("is-gone");
    });

    after(2100, function () {
      envelopeScene.hidden = true;
      envelopeScene.setAttribute("aria-hidden", "true");
    });

    after(750, function () {
      observeReveals();
      typeSalutation();
      letter.focus({ preventScroll: true });
    });

    after(2250, function () {
      interactionBusy = false;
    });
  }

  /* Cierra la carta y regresa al sobre. */
  function closeLetter() {
    if (!letterIsOpen || interactionBusy) return;

    interactionBusy = true;
    letterIsOpen = false;

    letterScene.classList.remove("is-active");
    stopTyping();

    after(450, function () {
      letterScene.hidden = true;
      resetReveals();
      resetSalutation();

      window.scrollTo(0, 0);
      body.classList.add("is-sealed");
      body.classList.remove("is-reading");

      envelopeScene.hidden = false;
      envelopeScene.removeAttribute("aria-hidden");

      envelope.classList.remove("is-open");
      envelope.setAttribute("aria-expanded", "false");

      /* Fuerza un reflow para que la aparición se anime de nuevo. */
      void envelopeScene.offsetWidth;

      after(30, function () {
        envelopeScene.classList.remove("is-gone", "is-opening");
      });
    });

    after(1400, function () {
      interactionBusy = false;
      envelope.focus({ preventScroll: true });
    });
  }

  envelope.addEventListener("click", openLetter);

  closeButtons.forEach(function (button) {
    button.addEventListener("click", closeLetter);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && letterIsOpen) {
      closeLetter();
    }
  });

  /* ======================================================================
     6. INICIO
     ====================================================================== */

  resizeCanvas();
  setMotion(motionOn, false);
})();
