/*
  Shared premium-UX behavior: intro curtain (once per browser session),
  header scroll state, and scroll-reveal. Pure presentation — never touches
  booking/calculator/WhatsApp logic, which stays in each page's own script.
  Loaded with `defer`; main content is already in the DOM and crawlable
  before this runs, so none of this can hide indexable content from a
  crawler that doesn't execute JS.
*/
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Intro curtain: once per browser session ---
  var curtain = document.querySelector('.curtain');
  if (curtain) {
    var seen = false;
    try { seen = sessionStorage.getItem('dc_intro_seen') === '1'; } catch (e) { /* storage blocked: show once, don't crash */ }
    if (seen) {
      curtain.hidden = true;
    } else {
      var dismiss = function () {
        curtain.classList.add('is-leaving');
        setTimeout(function () { curtain.hidden = true; }, reduceMotion ? 0 : 1100);
        try { sessionStorage.setItem('dc_intro_seen', '1'); } catch (e) {}
      };
      setTimeout(dismiss, reduceMotion ? 150 : 2600);
      curtain.addEventListener('click', dismiss);
    }
  }

  // --- Header: solid background once scrolled past hero ---
  var header = document.querySelector('.topbar');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // --- Scroll reveal ---
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var seenIdx = 0;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = (seenIdx % 6) * 70;
            seenIdx++;
            setTimeout(function () { el.classList.add('is-visible'); }, delay);
            io.unobserve(el);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }
})();
