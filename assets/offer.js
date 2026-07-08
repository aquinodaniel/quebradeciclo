/* Card de preço da oferta — tilt 3D "carta" seguindo o mouse + glare.
   Só em telas com mouse; respeita prefers-reduced-motion. */
(function () {
  'use strict';
  var el = document.querySelector('.offer-price[data-tilt]');
  if (!el) return;
  var card = el.querySelector('.offer-price__card');
  var glare = el.querySelector('.offer-price__glare');
  if (!card) return;
  if (!window.matchMedia) return;
  if (!matchMedia('(pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var MAX = 9;                 // graus máximos de inclinação
  var tx = 0.5, ty = 0.5, active = false, raf = 0;

  function apply() {
    raf = 0;
    var rx = (0.5 - ty) * (MAX * 2);   // topo -> inclina pra trás, base -> pra frente
    var ry = (tx - 0.5) * (MAX * 2);   // esq -> gira p/ esq, dir -> p/ dir
    var z = active ? 12 : 0;
    card.style.transform =
      'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateZ(' + z + 'px)';
    if (glare) {
      glare.style.opacity = active ? '1' : '0';
      glare.style.background =
        'radial-gradient(400px circle at ' + (tx * 100).toFixed(1) + '% ' +
        (ty * 100).toFixed(1) + '%, rgba(245,166,35,.18), transparent 60%)';
    }
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(apply); }

  el.addEventListener('mousemove', function (e) {
    var r = card.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width;
    ty = (e.clientY - r.top) / r.height;
    active = true;
    schedule();
  });
  el.addEventListener('mouseleave', function () {
    tx = 0.5; ty = 0.5; active = false;
    schedule();
  });
})();
