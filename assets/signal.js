/* A small, procedural canvas artwork: no media, audio, or third-party runtime. */
(() => {
  const panel = document.getElementById("signalPanel");
  const canvas = document.getElementById("audioCanvas");
  const ctx = canvas?.getContext("2d");
  if (!panel || !ctx) return;

  const modes = [...panel.querySelectorAll(".signal-mode")];
  const pause = panel.querySelector(".signal-pause");
  const status = panel.querySelector(".signal-status");
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  const TAU = Math.PI * 2;
  const colors = [[232, 199, 140], [164, 218, 202], [194, 178, 229]];
  const weights = [1, 0, 0];
  const pointer = { x: .45, y: .37, targetX: .45, targetY: .37, active: 0, targetActive: 0 };
  const ripples = [];
  let width = 1, height = 1, background, atmosphere;
  let selected = 0, time = 0, previousTime = 0, frameId = 0;
  let paused = motionPreference.matches, visible = true;

  const rgba = (color, alpha) => `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
  const mix = (a, b, amount) => a.map((v, i) => v + (b[i] - v) * amount);

  function cacheBackground() {
    const theme = document.body.dataset.theme;
    const end = theme === "azurite" ? "#25303c" : theme === "olive" ? "#28382e" : "#263737";
    background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#102126");
    background.addColorStop(.58, end);
    background.addColorStop(1, "#112124");
    atmosphere = ctx.createRadialGradient(width * .4, height * .33, 0, width * .4, height * .33, width * .72);
    atmosphere.addColorStop(0, "rgba(139,175,143,.13)");
    atmosphere.addColorStop(.45, "rgba(133,158,147,.045)");
    atmosphere.addColorStop(1, "rgba(100,150,145,0)");
  }

  function resize() {
    width = panel.clientWidth;
    height = panel.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    cacheBackground();
    requestFrame();
  }

  // All three forms share their point topology, so mode changes can morph smoothly.
  function point(t, strand) {
    const s = strand * 2 - 1;
    const envelope = Math.pow(Math.max(0, Math.sin(t * Math.PI)), .75);
    const phase = t * TAU * 1.12 - time * .24;
    const twist = s * 1.9 + t * TAU * .8 + time * .2;
    const depth = Math.sin(twist);
    const vx = (-.075 + t * 1.15) * width;
    const vy = height * (.365 + Math.sin(phase) * .06)
      + Math.cos(twist) * envelope * height * .13;
    const my = height * .36 + s * height * .085 * envelope
      + Math.sin(t * TAU * 1.7 - time * .52 + s * .9) * height * .065 * envelope
      + Math.sin(t * TAU * 3.5 + time * .28) * height * .016 * envelope;
    const angle = t * TAU + time * .11;
    const mx = width * .46 + Math.cos(angle) * width * (.34 + s * .018);
    const oy = height * .36 + Math.sin(angle) * height * .135
      + Math.sin(angle * 2 + s * .75 + time * .26) * height * .058
      + s * height * .024 * Math.cos(angle);
    let x = vx * (weights[0] + weights[1]) + mx * weights[2];
    let y = vy * weights[0] + my * weights[1] + oy * weights[2];

    const dx = x / width - pointer.x;
    const dy = y / height - pointer.y;
    const influence = Math.exp(-(dx * dx * 15 + dy * dy * 9)) * pointer.active;
    y += (pointer.y - .36) * height * influence * .45;
    x += (pointer.x - .5) * 20 * influence;
    for (const ripple of ripples) {
      const distance = Math.hypot((x / width - ripple.x) * 1.1, y / height - ripple.y);
      const wave = Math.exp(-Math.pow((distance - ripple.age * .32) / .065, 2));
      y += Math.sin(distance * 31 - ripple.age * 12) * wave * Math.exp(-ripple.age * 1.7) * 15;
    }
    return { x, y, depth };
  }

  function draw() {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = atmosphere;
    ctx.fillRect(0, 0, width, height);

    // Quiet registration marks and drifting dust give the field a sense of depth.
    ctx.fillStyle = "rgba(209,230,218,.10)";
    for (let x = 28; x < width - 20; x += 28) {
      for (let y = 145; y < height * .61; y += 28) ctx.fillRect(x, y, .8, .8);
    }
    for (let i = 0; i < 32; i++) {
      const x = ((Math.sin(i * 127.1) * 43758.5 % 1 + 1) % 1) * width;
      const y = height * (.15 + ((Math.cos(i * 39.7) * .5 + .5 + time * .004) % .46));
      ctx.fillStyle = rgba(colors[i % 3], .12 + .14 * (.5 + Math.sin(time * .6 + i) * .5));
      ctx.beginPath();
      ctx.arc(x + Math.sin(time * .18 + i) * 5, y, i % 5 === 0 ? 1.05 : .55, 0, TAU);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "screen";
    const tint = colors[0].map((_, channel) => colors.reduce((sum, c, i) => sum + c[channel] * weights[i], 0));
    const strands = width < 400 ? 42 : 56;
    const steps = width < 400 ? 72 : 96;
    for (let i = 0; i < strands; i++) {
      const strand = i / (strands - 1);
      const color = mix(tint, strand < .5 ? [119, 191, 183] : [190, 174, 218], Math.abs(strand - .5) * 1.45);
      const path = new Path2D();
      for (let j = 0; j <= steps; j++) {
        const p = point(j / steps, strand);
        if (j === 0) path.moveTo(p.x, p.y);
        else path.lineTo(p.x, p.y);
      }
      const shimmer = .5 + .5 * Math.sin(strand * 7 - time * .28);
      ctx.strokeStyle = rgba(color, .027);
      ctx.lineWidth = 4;
      ctx.stroke(path);
      ctx.strokeStyle = rgba(color, .24 + shimmer * .35);
      ctx.lineWidth = i % 7 === 0 ? 1.15 : .65;
      ctx.stroke(path);

      // Points of light travel along a handful of the actual curves.
      if (i % 7 === 0) {
        const t = ((time * .027 + i * .071) % .84) + .08;
        const p = point(t, strand);
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
        halo.addColorStop(0, rgba(color, .42));
        halo.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = halo;
        ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
        ctx.fillStyle = rgba([251, 241, 215], .8);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.1, 0, TAU);
        ctx.fill();
      }
    }

    for (const ripple of ripples) {
      ctx.beginPath();
      ctx.ellipse(ripple.x * width, ripple.y * height, ripple.age * width * .32 + 3,
        ripple.age * height * .32 + 3, 0, 0, TAU);
      ctx.strokeStyle = rgba(tint, Math.exp(-ripple.age * 2.8) * .38);
      ctx.lineWidth = .8;
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function render(now) {
    frameId = 0;
    const dt = previousTime ? Math.min((now - previousTime) / 1000, .05) : 1 / 60;
    previousTime = now;
    if (!paused) {
      time += dt;
      const ease = 1 - Math.exp(-dt * 5);
      weights.forEach((weight, i) => { weights[i] += ((i === selected ? 1 : 0) - weight) * ease; });
      pointer.x += (pointer.targetX - pointer.x) * ease;
      pointer.y += (pointer.targetY - pointer.y) * ease;
      pointer.active += (pointer.targetActive - pointer.active) * ease;
      ripples.forEach(ripple => { ripple.age += dt; });
      while (ripples.length && ripples[0].age > 2.8) ripples.shift();
    }
    draw();
    if (!paused) requestFrame();
  }

  function requestFrame() {
    if (!frameId && visible && !document.hidden) frameId = requestAnimationFrame(render);
  }

  function stopFrame() {
    cancelAnimationFrame(frameId);
    frameId = 0;
    previousTime = 0;
  }

  function updatePlayback() {
    pause.setAttribute("aria-pressed", String(paused));
    pause.setAttribute("aria-label", paused ? "Play signal animation" : "Pause signal animation");
    pause.title = paused ? "Play animation" : "Pause animation";
    if (paused) stopFrame();
    requestFrame();
  }

  modes.forEach((button, index) => {
    button.addEventListener("click", () => {
      selected = index;
      panel.dataset.signal = button.dataset.signal;
      modes.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      status.textContent = ["01 / VOICE", "02 / MUSIC", "03 / MOTION"][index];
      if (paused) weights.forEach((_, i) => { weights[i] = i === selected ? 1 : 0; });
      requestFrame();
    });
  });

  function locatePointer(event) {
    const rect = canvas.getBoundingClientRect();
    // Keyboard/synthetic clicks may omit coordinates; resizing can briefly give
    // the canvas no area. Never let either case feed NaN into the light field.
    const x = rect.width > 0 ? (event.clientX - rect.left) / rect.width : NaN;
    const y = rect.height > 0 ? (event.clientY - rect.top) / rect.height : NaN;
    pointer.targetX = Number.isFinite(x) ? Math.max(0, Math.min(1, x)) : .48;
    pointer.targetY = Number.isFinite(y) ? Math.max(0, Math.min(1, y)) : .36;
  }
  canvas.addEventListener("pointermove", event => {
    if (paused) return;
    locatePointer(event);
    pointer.targetActive = 1;
    requestFrame();
  }, { passive: true });
  canvas.addEventListener("pointerleave", () => { pointer.targetActive = 0; });
  canvas.addEventListener("pointercancel", () => { pointer.targetActive = 0; });
  canvas.addEventListener("click", event => {
    if (paused) return;
    locatePointer(event);
    ripples.push({ x: pointer.targetX, y: pointer.targetY, age: 0 });
    if (ripples.length > 5) ripples.shift();
    requestFrame();
  });
  canvas.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (paused) return;
    ripples.push({ x: .48, y: .36, age: 0 });
    if (ripples.length > 5) ripples.shift();
    requestFrame();
  });
  pause.addEventListener("click", () => { paused = !paused; updatePlayback(); });
  motionPreference.addEventListener("change", event => {
    paused = event.matches;
    if (paused) weights.forEach((_, i) => { weights[i] = i === selected ? 1 : 0; });
    updatePlayback();
  });

  new ResizeObserver(resize).observe(panel);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestFrame();
    else stopFrame();
  }).observe(panel);
  new MutationObserver(() => { cacheBackground(); requestFrame(); })
    .observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopFrame();
    else requestFrame();
  });
  resize();
  updatePlayback();
})();
