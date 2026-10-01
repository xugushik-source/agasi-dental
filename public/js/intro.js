/*
  Shared premium-UX behavior, ported literally from the ELIT DENT system
  (xugushik-source/dent-elit static/js/main.js): intro splash, header scroll
  state, mobile nav overlay with focus trap, and grouped scroll-reveal.
  Agasi's own booking/calculator logic stays in each page's separate inline
  <script> and is never touched here.
*/
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lastFocusedEl = null;

  function getFocusable(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  function trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    var focusable = getFocusable(container);
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ---------------- Intro splash: once per browser session ---------------- */
  (function () {
    var SESSION_KEY = 'dentalClinicSplashShown';
    var alreadyShown = true;
    try { alreadyShown = sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) {}
    var el = document.getElementById('introSplash');
    if (alreadyShown || !el) {
      if (el) el.remove();
    } else {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
      el.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      setTimeout(function () {
        el.classList.add('is-hiding');
        document.body.style.overflow = '';
        setTimeout(function () { el.remove(); }, 700);
      }, 1500);
    }
  })();

  /* ---------------- Header scroll state ---------------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------- Mobile nav overlay ---------------- */
  var hamburger = document.querySelector('[data-nav-toggle]');
  var overlay = document.querySelector('[data-nav-overlay]');
  var navClose = document.querySelector('[data-nav-close]');

  function openNav() {
    if (!overlay) return;
    lastFocusedEl = document.activeElement;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    overlay.setAttribute('aria-hidden', 'false');
    hamburger && hamburger.setAttribute('aria-expanded', 'true');
    var focusable = getFocusable(overlay);
    if (focusable.length) focusable[0].focus();
  }
  function closeNav() {
    if (!overlay || !overlay.classList.contains('is-open')) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    overlay.setAttribute('aria-hidden', 'true');
    hamburger && hamburger.setAttribute('aria-expanded', 'false');
    if (lastFocusedEl) lastFocusedEl.focus();
  }
  if (hamburger) hamburger.addEventListener('click', openNav);
  if (navClose) navClose.addEventListener('click', closeNav);
  if (overlay) {
    overlay.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    overlay.addEventListener('keydown', function (e) { trapFocus(overlay, e); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          openItem.querySelector('.faq-answer').style.maxHeight = null;
          openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
      });
      if (isOpen) {
        item.classList.remove('is-open');
        answer.style.maxHeight = null;
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------------- Reveal on scroll, grouped + staggered ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var groups = {};
      revealEls.forEach(function (el) {
        var group = el.getAttribute('data-reveal-group') || 'default';
        groups[group] = groups[group] || [];
        groups[group].push(el);
      });
      Object.keys(groups).forEach(function (key) {
        groups[key].forEach(function (el, i) {
          el.style.transitionDelay = (i * 80) + 'ms';
        });
      });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }
})();
