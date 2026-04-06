/* ============================================================
   script.js — Portfolio: Rajwinder Singh Mankoo
   ============================================================ */

/* ── Navbar: shrink on scroll & mobile toggle ─────────────── */
(function () {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // Shrink navbar when user scrolls down
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Mobile hamburger toggle
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}());

/* ── Typewriter effect in hero tagline ────────────────────── */
(function () {
  const el     = document.getElementById('typewriter');
  const cursor = document.querySelector('.cursor');
  if (!el) return;

  const phrases = [
    'Cybersecurity | Red Team Labs | Offensive Security',
    'Penetration Testing | CTF Builder and Competitor | Homelab Enthusiast',
    'Breaking things responsibly.',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  const TYPING_SPEED  = 65;
  const DELETING_SPEED = 35;
  const PAUSE_END     = 1800;
  const PAUSE_START   = 400;

  function tick () {
    const current = phrases[phraseIdx];

    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
      setTimeout(tick, TYPING_SPEED);
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting  = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
      setTimeout(tick, DELETING_SPEED);
    }
  }

  tick();
}());

/* ── Scroll-reveal: fade-in sections as they enter viewport ── */
(function () {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach(el => observer.observe(el));
}());

/* ── Active nav link highlighting ─────────────────────────── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navAs    = document.querySelectorAll('#navLinks a');
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAs.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(s => observer.observe(s));
}());

