/* NOIRÉ Atelier — interaction engine
   Lenis smooth scroll · intro curtain · split-text headlines · pinned hero
   · scrubbed journey · parallax · velocity motion · reveals · services
   · compare · packages · menu · magnetic · booking */

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Smooth scrolling — Lenis 1.1.14, the same engine as the Aurelia build. */
let lenis = null;
if (typeof Lenis === 'function' && !prefersReducedMotion()) {
  lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, touchMultiplier: 1.5 });
  const lenisRaf = time => { lenis.raf(time); requestAnimationFrame(lenisRaf); };
  requestAnimationFrame(lenisRaf);
}
function smoothScrollTo(target, offset = 0) {
  if (lenis) { lenis.scrollTo(target, { offset, duration: 1.2 }); return; }
  if (typeof target === 'number') window.scrollTo({ top: target, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  else target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/* In-page navigation runs through Lenis so every jump shares the easing. */
document.addEventListener('click', event => {
  const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
  if (!link) return;
  const hash = link.getAttribute('href');
  if (!hash || hash === '#') return;
  const target = hash === '#top' ? null : document.querySelector(hash);
  if (hash !== '#top' && !target) return;
  event.preventDefault();
  const header = $('[data-header]') || $('#siteHeader');
  const offset = header ? -(Math.round(header.getBoundingClientRect().height) + 14) : 0;
  smoothScrollTo(hash === '#top' ? 0 : target, offset);
});

/* Split-text headlines — wrap words so each can rise on its own beat. */
function setupSplitHeadlines() {
  $$('[data-split]').forEach(heading => {
    const lines = heading.innerHTML.split(/<br\s*\/?>/i);
    let wordIndex = 0;
    heading.innerHTML = lines.map(line => {
      const wrapper = document.createElement('span');
      wrapper.className = 'split-line';
      const temp = document.createElement('div');
      temp.innerHTML = line;
      const nodes = [...temp.childNodes];
      nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent.split(/(\s+)/).forEach(chunk => {
            if (!chunk) return;
            if (/^\s+$/.test(chunk)) { wrapper.append(' '); return; }
            const word = document.createElement('span');
            word.className = 'split-word';
            word.textContent = chunk;
            word.style.transitionDelay = `${wordIndex * 55}ms`;
            word.style.setProperty('--i', wordIndex);
            wordIndex += 1;
            wrapper.append(word);
          });
        } else {
          const el = node.cloneNode(true);
          const word = document.createElement('span');
          word.className = 'split-word';
          word.append(el);
          word.style.transitionDelay = `${wordIndex * 55}ms`;
          word.style.setProperty('--i', wordIndex);
          wordIndex += 1;
          wrapper.append(word);
        }
      });
      return wrapper.outerHTML;
    }).join('');
  });
}

/* Intro curtain — panels part on a fixed timeline while the hero entrance
   plays behind them; skip collapses the whole sequence. */
function setupIntro() {
  const intro = $('#intro');
  if (!intro) return;
  if (prefersReducedMotion()) {
    intro.remove();
    document.body.classList.add('is-ready');
    return;
  }
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    intro.style.display = 'none';
    document.body.classList.add('is-ready');
  };
  window.setTimeout(finish, 3050);
  $('.intro-skip')?.addEventListener('click', () => {
    document.body.classList.add('is-intro-skipped');
    window.setTimeout(finish, 260);
  });
}

/* Reveals — observer plus a fallback aligned to the observer's trigger line. */
function setupReveal() {
  const items = $$('.reveal');
  if (!items.length) return;
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('is-visible'));
    $$('.split-word').forEach(word => word.classList.add('is-in'));
    return;
  }
  const activate = item => {
    item.classList.add('is-visible');
    $$('.split-word', item).forEach(word => word.classList.add('is-in'));
  };
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      activate(entry.target);
      observer.unobserve(entry.target);
    }
  }), { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  items.forEach(item => observer.observe(item));
  const activateVisible = () => {
    items.forEach(item => {
      if (item.classList.contains('is-visible')) return;
      if (item.getBoundingClientRect().top < window.innerHeight - 24) activate(item);
    });
    if (items.every(item => item.classList.contains('is-visible'))) window.removeEventListener('scroll', activateVisible);
  };
  activateVisible();
  window.addEventListener('scroll', activateVisible, { passive: true });
}

/* Scroll scenes — one rAF pass per scroll frame drives the header, progress
   bar, pinned hero, scrubbed journey, parallax, and velocity motion. */
function setupScrollScenes() {
  const header = $('#siteHeader');
  const heroPin = $('.hero-pin');
  const hero = $('.hero');
  const heroCopy = $('.hero-copy') || $('.hero-bottom');
  const progress = $('#scrollProgress');
  const tickerTrack = $('#tickerTrack');
  const journeyShell = $('#journeyShell');
  const journeyStage = $('.journey-stage');
  const scenes = $$('.journey-scene');
  const steps = $$('.journey-step');
  const caption = $('#journeyCaption');
  const progressBar = $('#journeyProgressBar');
  const progressLabel = $('#journeyProgressLabel');
  const pinQuery = window.matchMedia('(min-width: 881px)');

  const parallaxItems = [
    ...$$('.service-image-frame img').map(el => ({ el, range: 16 })),
    ...$$('.film-panel-media img').map(el => ({ el, range: 20 })),
    ...$$('.gallery-card img').map(el => ({ el, range: 14 }))
  ];

  const captions = ['Arrival', 'Craft', 'Correction', 'Protection', 'Reveal'];
  let ticking = false;
  let idleTimer = null;
  let lastY = window.scrollY;
  let lastTime = performance.now();
  let velocity = 0;
  let lastScene = -1;
  let scanTimer = null;

  const markScrolling = () => {
    document.documentElement.classList.add('is-scrolling');
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => document.documentElement.classList.remove('is-scrolling'), 140);
  };

  const update = () => {
    const now = performance.now();
    const y = window.scrollY;
    const dt = Math.max(1, now - lastTime);
    velocity = clamp((y - lastY) / dt, -3, 3);
    lastY = y;
    lastTime = now;
    const vh = window.innerHeight;

    if (header) header.classList.toggle('is-scrolled', y > 30);
    if (progress) {
      const limit = Math.max(1, document.documentElement.scrollHeight - vh);
      progress.style.width = `${(clamp(y / limit) * 100).toFixed(2)}%`;
    }

    if (!prefersReducedMotion()) {
      /* Pinned hero: the visual scales and the copy drifts away. */
      if (hero && heroPin && pinQuery.matches) {
        const span = Math.max(1, heroPin.offsetHeight - hero.offsetHeight);
        const p = clamp(-heroPin.getBoundingClientRect().top / span);
        const media = $('.hero-media');
        if (media) media.style.transform = `scale(${(1.05 + p * 0.16).toFixed(4)})`;
        if (heroCopy) {
          heroCopy.style.transform = `translateY(${(-p * 55).toFixed(1)}%)`;
          heroCopy.style.opacity = Math.max(0, 1 - p * 1.15).toFixed(3);
        }
      }

      /* Journey: scenes crossfade with the scroll; progress, caption, and
         step list swap on each scene change. */
      if (journeyShell && journeyStage && scenes.length) {
        const rect = journeyShell.getBoundingClientRect();
        const travel = Math.max(1, rect.height - vh * 0.5);
        const p = clamp((vh * 0.4 - rect.top) / travel);
        const index = Math.min(scenes.length - 1, Math.floor(p * scenes.length));
        scenes.forEach((scene, i) => scene.classList.toggle('is-active', i === index));
        if (progressBar) progressBar.style.width = `${Math.round(p * 100)}%`;
        if (progressLabel) progressLabel.textContent = `${String(index + 1).padStart(2, '0')} / 0${scenes.length}`;
        if (caption) caption.textContent = captions[index] || captions[0];
        if (index !== lastScene) {
          steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
          journeyStage.classList.add('is-cutting');
          window.clearTimeout(scanTimer);
          scanTimer = window.setTimeout(() => journeyStage.classList.remove('is-cutting'), 800);
          lastScene = index;
        }
      }

      /* Parallax depth — offsets travel through custom properties so hover
         scales compose on top. */
      parallaxItems.forEach(item => {
        const rect = item.el.getBoundingClientRect();
        if (rect.bottom < -80 || rect.top > vh + 80) return;
        const progressValue = (vh / 2 - (rect.top + rect.height / 2)) / vh;
        item.el.style.setProperty('--py', `${(clamp(progressValue, -1, 1) * item.range).toFixed(1)}px`);
      });

      /* Velocity motion — the ticker leans into the scroll and film panels
         skew subtly with speed. */
      if (tickerTrack) {
        const direction = velocity > 0.15 ? 'reverse' : velocity < -0.15 ? 'normal' : 'normal';
        if (tickerTrack.style.animationDirection !== direction) tickerTrack.style.animationDirection = direction;
      }
      const skew = clamp(-velocity * 2.2, -3, 3);
      if (Math.abs(skew) > 0.05) {
        $$('.film-panel-media img').forEach(el => {
          el.style.transform = `translateY(var(--py, 0px)) skewY(${skew.toFixed(2)}deg)`;
        });
      }
    }
    ticking = false;
  };

  const onScroll = () => {
    markScrolling();
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* Services — tab switcher with reflection sweep and copy swap. */
const serviceData = {
  signature: { title: 'Signature wash', copy: 'A hand-finished reset: two-bucket wash, decontamination, wheels, glass and a soft sealant glow.', time: '90 min', image: 'media/campaign/service-wash.jpg' },
  interior: { title: 'Interior revival', copy: 'A quiet reset for the cabin: vacuum, steam, leather conditioning, scent and the details your hands remember.', time: '2 hr', image: 'media/campaign/service-interior.jpg' },
  correction: { title: 'Paint correction', copy: 'Measured refinement under calibrated light. We remove the noise and return the bodywork to its cleanest reflection.', time: '4–8 hr', image: 'media/campaign/service-correction.jpg' },
  ceramic: { title: 'Ceramic veil', copy: 'A durable layer of clarity and protection, applied only after the surface is ready to receive it.', time: '6–10 hr', image: 'media/campaign/service-veil.jpg' },
  concierge: { title: 'Concierge detail', copy: 'Pickup, studio treatment, quality check and handover — a seamless private service for the vehicles you do not lend out.', time: 'By request', image: 'media/campaign/service-concierge.jpg' }
};
function setupServices() {
  const image = $('#serviceImage');
  const title = $('#serviceTitle');
  const copy = $('#serviceCopy');
  const time = $('#serviceTime');
  const detail = $('#serviceDetail');
  if (!image || !detail) return;
  let swapTimer;
  $$('.service-tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.service-tab').forEach(item => { item.classList.remove('is-active'); item.setAttribute('aria-selected', 'false'); });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
    const data = serviceData[tab.dataset.service];
    if (!data) return;
    window.clearTimeout(swapTimer);
    detail.classList.remove('is-sweeping');
    void detail.offsetWidth;
    detail.classList.add('is-sweeping');
    title.textContent = data.title;
    copy.textContent = data.copy;
    time.textContent = data.time;
    image.style.opacity = '0';
    swapTimer = window.setTimeout(() => {
      image.src = data.image;
      image.alt = data.title;
      image.style.opacity = '1';
    }, prefersReducedMotion() ? 0 : 220);
  }));
}

/* Compare slider */
function setupCompare() {
  const range = $('#compareRange');
  const after = $('#compareAfter');
  const handle = $('#compareHandle');
  if (!range || !after || !handle) return;
  const update = () => {
    const value = range.value;
    after.style.clipPath = `inset(0 0 0 ${value}%)`;
    handle.style.left = `${value}%`;
  };
  range.addEventListener('input', update);
  update();
}

/* Packages — selecting a package fills the booking form and scrolls to it. */
function setupPackages() {
  $$('.package-select').forEach(button => button.addEventListener('click', () => {
    const target = $(`input[name="package"][value="${button.dataset.package}"]`);
    if (target) target.checked = true;
    smoothScrollTo($('#booking'));
  }));
}

/* Mobile menu — clip-path reveal with Lenis lock. */
function setupMenu() {
  const toggle = $('#menuButton');
  const menu = $('#mobileMenu');
  if (!toggle || !menu) return;
  const close = () => {
    toggle.classList.remove('is-open');
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('is-menu-open');
    if (lenis) lenis.start();
  };
  const open = () => {
    toggle.classList.add('is-open');
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('is-menu-open');
    if (lenis) lenis.stop();
    requestAnimationFrame(() => { if (menu.classList.contains('is-open')) $('nav a', menu)?.focus(); });
  };
  toggle.addEventListener('click', () => menu.classList.contains('is-open') ? close() : open());
  $$('a', menu).forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.classList.contains('is-open')) close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 880) close(); });
}

/* Magnetic buttons — spring release on desktop pointers only. */
function setupMagnetic() {
  if (!window.matchMedia('(pointer: fine) and (hover:hover)').matches || prefersReducedMotion()) return;
  $$('.magnetic').forEach(button => {
    button.addEventListener('pointermove', event => {
      const rect = button.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) * .1;
      const dy = (event.clientY - rect.top - rect.height / 2) * .18;
      button.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });
}

/* Booking — local-only confirmation. */
function setupBooking() {
  const form = $('#bookingForm');
  const success = $('#successMessage');
  const date = $('#guestDate');
  if (!form || !success) return;
  if (date) date.min = new Date().toISOString().slice(0, 10);
  form.addEventListener('submit', event => {
    event.preventDefault();
    success.classList.add('is-visible');
    success.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
  });
}

/* Active section indicator in the nav. */
function setupSectionTracking() {
  const links = $$('.nav-links a');
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    links.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
  }), { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
}

function init() {
  setupSplitHeadlines();
  setupIntro();
  setupReveal();
  setupScrollScenes();
  setupServices();
  setupCompare();
  setupPackages();
  setupMenu();
  setupMagnetic();
  setupBooking();
  setupSectionTracking();
  $$('[data-year], #year').forEach(item => item.textContent = new Date().getFullYear());
}

document.addEventListener('DOMContentLoaded', init);
