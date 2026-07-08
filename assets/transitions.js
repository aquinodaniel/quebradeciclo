/* Fase 1 — curva de temperatura: a opacidade do layer .thermal muda conforme
   a seção que cruza o centro da viewport. Quente na hero/oferta/fechamento,
   frio na ruptura/ciclos/conduz, pico no fechamento. */
(function () {
  'use strict';
  var thermal = document.querySelector('.thermal');
  if (!thermal) return;

  // nível de calor por seção (opacidade do soft-light)
  var WARMTH = {
    topo: 0.35, ruptura: 0.15, ciclos: 0.15,
    oferta: 0.60, escolha: 0.50, conduz: 0.10, fechamento: 0.85
  };
  var FOOTER_WARMTH = 0.12;

  function setWarm(v) { thermal.style.setProperty('--thermal-op', v); }
  setWarm(WARMTH.topo);

  if (!('IntersectionObserver' in window)) return;

  var footer = document.querySelector('.footer');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      if (e.target === footer) { setWarm(FOOTER_WARMTH); return; }
      var v = WARMTH[e.target.id];
      if (v != null) setWarm(v);
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });   // "linha" fina no meio da tela

  Object.keys(WARMTH).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) io.observe(el);
  });
  if (footer) io.observe(footer);
})();
