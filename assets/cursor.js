/* Cursor customizado — bolinha no ponteiro + anel seguindo com atraso (cor brasa).
   Só desktop com mouse; respeita prefers-reduced-motion. */
(function () {
  'use strict';
  if (!window.matchMedia) return;
  if (!matchMedia('(pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var dot = document.createElement('div');
  var ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  dot.setAttribute('aria-hidden', 'true');
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);
  document.body.appendChild(dot);
  document.documentElement.classList.add('has-custom-cursor');

  var mx = window.innerWidth / 2, my = window.innerHeight / 2;   // alvo (mouse)
  var rx = mx, ry = my;                                          // anel (com lag)
  var visible = false;
  var HOVER_SEL = 'a, button, .btn, input, [data-tilt], summary, label, [role="button"]';

  function show(on) {
    dot.style.opacity = on ? '1' : '0';
    ring.style.opacity = on ? '1' : '0';
    visible = on;
  }

  window.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
    if (!visible) show(true);
  }, { passive: true });

  document.addEventListener('mouseleave', function () { show(false); });
  document.addEventListener('mouseenter', function () { show(true); });

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest && e.target.closest(HOVER_SEL)) {
      ring.classList.add('is-hover'); dot.classList.add('is-hover');
    }
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest && e.target.closest(HOVER_SEL)) {
      ring.classList.remove('is-hover'); dot.classList.remove('is-hover');
    }
  });
  window.addEventListener('mousedown', function () { ring.classList.add('is-down'); });
  window.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });

  (function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  })();
})();
