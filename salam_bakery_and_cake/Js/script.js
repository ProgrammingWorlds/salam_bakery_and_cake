/* ═══════════════════════════════════════════════
   TOP ONE DONUT — script.js
   GSAP + ScrollTrigger + Lenis + Three.js
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];

  /* If GSAP failed to load (no internet), show the site without animations */
  if (!window.gsap || !window.ScrollTrigger) {
    const p = $('#preloader');
    if (p) p.style.display = 'none';
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE    = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const narrow  = () => window.innerWidth < 861;

  /* ────────── 1. SMOOTH SCROLL (Lenis) ────────── */
  let lenis = null;
  if (!REDUCED && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = (el) => {
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  /* ────────── 2. SPLIT HERO TITLE INTO LETTERS ────────── */
  $$('[data-split]').forEach((el) => {
    el.innerHTML = el.textContent.trim().split('').map((ch) =>
      ch === ' ' ? '<span class="ch sp"></span>' : '<span class="ch">' + ch + '</span>'
    ).join('');
  });

  /* ────────── 3. MARQUEE (duplicate content for seamless loop) ────────── */
  const mq = $('#marqueeTrack');
  if (mq) mq.innerHTML += mq.innerHTML;

  /* ────────── 4. CUSTOM CURSOR ────────── */
  if (FINE) {
    document.body.classList.add('has-cursor');
    const dot = $('#cursor'), ring = $('#cursorRing'), label = $('#cursorLabel');
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener('mousemove', (e) => {
      x = e.clientX; y = e.clientY;
      const t = e.target;
      const inter = t.closest && t.closest('a, button, video, .d-card, .coupon, .reel-frame');
      const drag  = !inter && t.closest && t.closest('[data-cursor="drag"]');
      document.body.classList.toggle('c-link', !!inter);
      document.body.classList.toggle('c-drag', !!drag);
      if (label) label.textContent = drag ? 'DRAG' : '';
    });
    gsap.ticker.add(() => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      dot.style.transform  = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
    });
  }

  /* ────────── 5. NAV ────────── */
  const nav = $('#nav');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 60), { passive: true });

  const burger = $('#burger');
  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
  };
  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
  });

  /* Anchor links → smooth scroll */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const el = $(id);
        if (el) { e.preventDefault(); closeMenu(); scrollToEl(el); }
      }
    });
  });

  /* ────────── 6. SET BASE ROTATIONS (JS owns transforms) ────────── */
  $$('[data-r]').forEach((el) => {
    gsap.set(el, { rotation: parseFloat(el.dataset.r || 0) });
  });

  /* ────────── 7. PRELOADER + HERO INTRO ────────── */
  gsap.set('.hero-kicker, .hero-tag, .hero-sub, .hero-cta, .hero-scroll', { opacity: 0, y: 26 });
  gsap.set('.hero-badge', { opacity: 0 });
  gsap.set('#donutCanvas', { opacity: 0 });
  gsap.set('.spr', { opacity: 0 });

  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('#donutCanvas', { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
      .to('.hero-kicker', { opacity: 1, y: 0, duration: 0.6 }, 0.1)
      .fromTo('.hero-title .ch',
        { yPercent: 130, rotation: 8 },
        { yPercent: 0, rotation: 0, duration: 0.8, stagger: 0.035, ease: 'back.out(1.6)' }, 0.15)
      .to('.hero-tag', { opacity: 1, y: 0, duration: 0.6 }, '-=0.35')
      .to('.hero-sub', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to('.hero-cta', { opacity: 1, y: 0, duration: 0.6 }, '-=0.45')
      .fromTo('.hero-badge',
        { scale: 0, rotation: -30 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.7)' }, '-=0.5')
      .to('.spr', { opacity: 1, duration: 0.8, stagger: { each: 0.06, from: 'random' } }, '-=0.6')
      .to('.hero-scroll', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');
  }

  if (REDUCED) {
    gsap.set('#preloader', { display: 'none' });
    gsap.set('.hero-kicker, .hero-tag, .hero-sub, .hero-cta, .hero-badge, .hero-scroll, #donutCanvas, .spr',
      { opacity: 1, y: 0, scale: 1 });
  } else {
    if (lenis) lenis.stop();
    const count = { v: 0 };
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.pre-logo', { scale: 0, rotation: -180, duration: 0.9, ease: 'back.out(1.7)' }, 0)
      .from('.pre-title', { y: 24, opacity: 0, duration: 0.6 }, 0.15)
      .to(count, {
        v: 100, duration: 1.5, ease: 'power2.inOut',
        onUpdate: () => {
          $('#preCount').textContent = Math.round(count.v) + '%';
          $('#preFill').style.width = count.v + '%';
        }
      }, 0)
      .to('.pre-inner', { y: -40, opacity: 0, duration: 0.45, ease: 'power2.in' }, '+=0.15')
      .to('.pre-main',    { yPercent: -100, duration: 0.85, ease: 'power4.inOut' }, '-=0.05')
      .to('.pre-panel-2', { yPercent: -100, duration: 0.85, ease: 'power4.inOut' }, '-=0.68')
      .add(() => { if (lenis) lenis.start(); heroIntro(); }, '-=0.55')
      .set('#preloader', { display: 'none' });
  }

  /* ────────── 8. SCROLL REVEALS ────────── */
  if (!REDUCED) {
    $$('[data-reveal]').forEach((el) => {
      const base = parseFloat(el.dataset.r || 0);
      const pop  = el.hasAttribute('data-pop');
      const from = pop
        ? { scale: 0.4, opacity: 0, rotation: base - 12 }
        : { y: 56, opacity: 0 };
      gsap.fromTo(el, from, {
        scale: 1, opacity: 1, y: 0, rotation: base,
        duration: pop ? 1 : 0.9,
        ease: pop ? 'back.out(1.7)' : 'power3.out',
        delay: parseFloat(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    /* Big background words drift on scroll */
    $$('.bg-word').forEach((w) => {
      gsap.fromTo(w, { yPercent: 22 }, {
        yPercent: -22, ease: 'none',
        scrollTrigger: { trigger: w.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ────────── 9. HORIZONTAL MENU (pinned, desktop) ────────── */
  const menuBar = $('#menuBar');
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    if (REDUCED) return;
    const track = $('#menuTrack');
    const dist = () => Math.max(track.scrollWidth - innerWidth + 60, 0);
    gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '#menu',
        start: 'top top',
        end: () => '+=' + dist(),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (menuBar) menuBar.style.width = (self.progress * 100) + '%';
        }
      }
    });
  });

  /* ────────── 10. WILD CREATIONS (entrance + parallax + mouse) ────────── */
  const wilds = $$('.wild');
  if (!REDUCED) {
    wilds.forEach((w) => {
      gsap.fromTo(w,
        { y: 70, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: w, start: 'top 92%' } });
      gsap.fromTo(w, { yPercent: -12 }, {
        yPercent: 14, ease: 'none',
        scrollTrigger: { trigger: '#creStage', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }
  if (FINE && !REDUCED) {
    const stage = $('#creStage');
    const setters = wilds.map((w) => ({
      d: parseFloat(w.dataset.depth || 1),
      x: gsap.quickTo(w, 'x', { duration: 0.6, ease: 'power3' }),
      y: gsap.quickTo(w, 'y', { duration: 0.6, ease: 'power3' })
    }));
    stage.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      setters.forEach((s) => { s.x(nx * 36 * s.d); s.y(ny * 30 * s.d); });
    });
  }

  /* ────────── 11. VIDEOS (click = play/pause, button = sound) ────────── */
  $$('.reel').forEach((fig) => {
    const v = $('video', fig);
    const tryPlay = () => v.play().then(() => fig.classList.remove('paused'))
                           .catch(() => fig.classList.add('paused'));
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener('loadeddata', tryPlay);

    fig.addEventListener('click', (e) => {
      if (e.target.closest('.sound-btn')) return;
      if (v.paused) tryPlay();
      else { v.pause(); fig.classList.add('paused'); }
    });
    $('.sound-btn', fig).addEventListener('click', () => {
      v.muted = !v.muted;
      if (!v.muted) v.volume = 0.9;
      fig.classList.toggle('sound-on', !v.muted);
    });
  });

  /* ────────── 12. 3D TILT (menu cards + video frames) ────────── */
  if (FINE && !REDUCED) {
    const tilt = (el, max) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(el, {
          rotationY: px * max, rotationX: -py * max,
          transformPerspective: 700, duration: 0.5, ease: 'power2.out'
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.7, ease: 'elastic.out(1,0.5)' });
      });
    };
    $$('.d-inner').forEach((el) => tilt(el, 12));
    $$('.reel-frame').forEach((el) => tilt(el, 7));
  }

  /* ────────── 13. MAGNETIC BUTTONS ────────── */
  if (FINE && !REDUCED) {
    $$('.magnetic').forEach((btn) => {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      btn.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ────────── 14. BACK TO TOP + YEAR ────────── */
  const btt = $('#btt');
  addEventListener('scroll', () => btt.classList.toggle('show', scrollY > 700), { passive: true });
  btt.addEventListener('click', () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else scrollTo({ top: 0, behavior: 'smooth' });
  });
  $('#year').textContent = new Date().getFullYear();

  /* ────────── 15. THE 3D DONUT (Three.js) ──────────
     A pink glazed torus with 240 sprinkles + drips.
     It travels between sections as you scroll, follows
     the mouse, and you can grab & throw it to spin. */
  (function initDonut() {
    const canvas = $('#donutCanvas');
    const fail = () => {
      if (canvas) canvas.style.display = 'none';
      const f = $('#donutFallback');
      if (f) f.classList.add('on');
    };
    if (!canvas || !window.THREE) return fail();

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (e) { return fail(); }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 50);
    camera.position.z = 8;

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xfff2e0, 1.1);
    key.position.set(4, 6, 8); scene.add(key);
    const rim = new THREE.DirectionalLight(0xff8ab8, 0.55);
    rim.position.set(-6, -2, -4); scene.add(rim);
    const glow = new THREE.PointLight(0xffc93c, 0.55, 40);
    glow.position.set(-5, 3, 6); scene.add(glow);

    const g = new THREE.Group();
    scene.add(g);

    const R = 1.35, T = 0.62;
    const pinkMat = new THREE.MeshStandardMaterial({ color: 0xff5fa2, roughness: 0.32, metalness: 0.05 });
    g.add(new THREE.Mesh(new THREE.TorusGeometry(R, T, 42, 96), pinkMat));

    /* Sprinkles on the visible face */
    const palette = [0xffffff, 0xffd23f, 0x59d9c5, 0x7cc6ff, 0x8ac926, 0xff8f5f, 0x9b5de5, 0xffe08a];
    const sprGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.16, 6);
    const UP = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < 240; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.PI / 2 + (Math.random() - 0.5) * 2.5;
      const cp = Math.cos(ph), sp = Math.sin(ph);
      const rr = R + T * cp;
      const n  = new THREE.Vector3(cp * Math.cos(th), cp * Math.sin(th), sp);
      const s  = new THREE.Mesh(sprGeo,
        new THREE.MeshStandardMaterial({ color: palette[i % palette.length], roughness: 0.45 }));
      s.position.set(rr * Math.cos(th), rr * Math.sin(th), T * sp);
      s.quaternion.setFromUnitVectors(UP, n);
      s.rotateX((Math.random() - 0.5) * 0.6);
      s.rotateZ((Math.random() - 0.5) * 0.6);
      g.add(s);
    }

    /* Glaze drips hanging from the bottom */
    for (let i = 0; i < 15; i++) {
      const th = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      const ph = (Math.random() - 0.5) * 0.9;
      const rr = R + T * Math.cos(ph);
      const size = 0.07 + Math.random() * 0.1;
      const drop = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 16), pinkMat);
      drop.position.set(rr * Math.cos(th), rr * Math.sin(th) - size * 0.4, T * Math.sin(ph));
      g.add(drop);
    }

    const view = { w: 1, h: 1 };
    function resize() {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      view.h = 2 * Math.tan(THREE.MathUtils.degToRad(19)) * camera.position.z;
      view.w = view.h * camera.aspect;
    }
    resize();
    addEventListener('resize', resize);

    /* Scroll journey keyframes — {p: page progress 0-1, x/y: ±fraction of screen, s: scale} */
    const KF_D = [
      { p: 0.00, x:  0.40, y: -0.06, s: 1.02 },  // hero — right side, big
      { p: 0.10, x:  0.40, y: -0.06, s: 1.02 },
      { p: 0.16, x: -0.44, y:  0.00, s: 0.66 },  // about — left, behind the stickers
      { p: 0.26, x: -0.02, y:  0.46, s: 0.40 },  // menu — peeks from the top
      { p: 0.44, x: -0.02, y:  0.46, s: 0.40 },
      { p: 0.55, x:  0.40, y:  0.02, s: 0.60 },  // creations — right
      { p: 0.68, x: -0.42, y:  0.08, s: 0.54 },  // reels — left
      { p: 0.80, x: -0.38, y:  0.24, s: 0.46 },  // offers — upper left
      { p: 0.92, x:  0.40, y:  0.02, s: 0.80 },  // contact — right, big again
      { p: 1.00, x:  0.40, y:  0.02, s: 0.80 }
    ];
    const KF_M = [
      { p: 0.00, x: 0, y: 0.14, s: 0.70 },
      { p: 0.10, x: 0, y: 0.28, s: 0.42 },
      { p: 0.90, x: 0, y: 0.46, s: 0.32 },
      { p: 1.00, x: 0, y: 0.32, s: 0.55 }
    ];
    const ease = (t) => t * t * (3 - 2 * t);
    function sample(p) {
      const KF = narrow() ? KF_M : KF_D;
      p = Math.min(Math.max(p, 0), 1);
      for (let i = 0; i < KF.length - 1; i++) {
        const a = KF[i], b = KF[i + 1];
        if (p >= a.p && p <= b.p) {
          const t = ease((p - a.p) / ((b.p - a.p) || 1));
          return {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t,
            s: a.s + (b.s - a.s) * t
          };
        }
      }
      return KF[KF.length - 1];
    }

    /* Mouse + drag-to-spin */
    let mx = 0, my = 0, spin = 0, dragging = false, lastX = 0;
    const baseVel = REDUCED ? 0 : 0.004;
    let vel = baseVel;

    addEventListener('mousemove', (e) => {
      mx = (e.clientX / innerWidth - 0.5) * 2;
      my = (e.clientY / innerHeight - 0.5) * 2;
    });
    addEventListener('pointerdown', (e) => {
      if (e.target.closest && e.target.closest('a, button, video, input, textarea, p, img, .d-card, .coupon, .sticker, .reel')) return;
      dragging = true; lastX = e.clientX;
    });
    addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      spin += dx * 0.006;
      vel = dx * 0.006;
    });
    addEventListener('pointerup', () => { dragging = false; });

    function tick() {
      const t = performance.now();
      if (!dragging) { spin += vel; vel += (baseVel - vel) * 0.03; }

      const doc = document.documentElement;
      const p = scrollY / Math.max(doc.scrollHeight - innerHeight, 1);
      const k = sample(p);

      const tx = k.x * view.w / 2;
      const ty = -k.y * view.h / 2 + Math.sin(t * 0.0012) * 0.1;
      g.position.x += (tx - g.position.x) * 0.06;
      g.position.y += (ty - g.position.y) * 0.06;
      g.scale.setScalar(g.scale.x + (k.s - g.scale.x) * 0.06);

      g.rotation.y = spin + mx * 0.35;
      g.rotation.x = 0.5 + my * 0.18 + Math.sin(t * 0.0009) * 0.05;

      renderer.render(scene, camera);
    }
    if (window.gsap) gsap.ticker.add(tick);
    else (function raf() { tick(); requestAnimationFrame(raf); })();
  })();

  /* Refresh triggers once everything (images/videos) has loaded */
  addEventListener('load', () => ScrollTrigger.refresh());

})();