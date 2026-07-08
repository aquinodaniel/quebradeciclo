/* Quebra de Ciclo — interações */
(function () {
  'use strict';

  /* ---------- Countdown para a Noite 1: 21/07/2026 20h (BRT, UTC-3) ---------- */
  var TARGET = new Date('2026-07-21T20:00:00-03:00').getTime();
  var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-countdown]'));

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function tick() {
    var diff = TARGET - Date.now();
    if (diff < 0) diff = 0;
    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    blocks.forEach(function (b) {
      var el;
      if ((el = b.querySelector('[data-d]'))) el.textContent = pad(d);
      if ((el = b.querySelector('[data-h]'))) el.textContent = pad(h);
      if ((el = b.querySelector('[data-m]'))) el.textContent = pad(m);
      if ((el = b.querySelector('[data-s]'))) el.textContent = pad(sec);
    });
  }
  if (blocks.length) { tick(); setInterval(tick, 1000); }

  /* ---------- Reveal no scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Sticky CTA (mobile): aparece após o hero ---------- */
  var sticky = document.querySelector('[data-sticky]');
  var hero = document.getElementById('topo');
  var footer = document.querySelector('.footer');
  if (sticky && hero) {
    var onScroll = function () {
      var pastHero = window.scrollY > hero.offsetHeight * 0.9;
      var nearFooter = footer && (footer.getBoundingClientRect().top < window.innerHeight + 40);
      sticky.classList.toggle('show', pastHero && !nearFooter);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 5 Ciclos: anel sincronizado com o scroll ---------- */
  var track = document.querySelector('[data-ciclos]');
  if (track) {
    track.classList.add('sync');
    var arc = track.querySelector('.orbit-break');
    var head = track.querySelector('.orbit-head');
    var legs = Array.prototype.slice.call(track.querySelectorAll('.leg'));
    var nodes = Array.prototype.slice.call(track.querySelectorAll('.node'));
    // o arco alcança o nó i em p = i*0,2 → ícone acende e card aparece juntos
    var NODE_TH = [0.02, 0.20, 0.40, 0.60, 0.80];
    var TH      = [0.03, 0.21, 0.41, 0.61, 0.81];
    var R = 118, CX = 200, CY = 200;

    function setProgress(p) {
      p = Math.max(0, Math.min(1, p));
      if (arc) arc.style.strokeDashoffset = (100 * (1 - p)).toFixed(2);
      if (head) {
        var ang = (-90 + p * 360) * Math.PI / 180;
        head.setAttribute('cx', (CX + R * Math.cos(ang)).toFixed(1));
        head.setAttribute('cy', (CY + R * Math.sin(ang)).toFixed(1));
        head.style.opacity = (p > 0.008 && p < 0.992) ? '1' : '0';
      }
      var cur = -1;
      for (var i = 0; i < legs.length; i++) { var a = p >= TH[i]; legs[i].classList.toggle('on', a); if (a) cur = i; }
      for (var k = 0; k < legs.length; k++) legs[k].classList.toggle('cur', k === cur);
      var curN = -1;
      for (var j = 0; j < nodes.length; j++) { var an = p >= NODE_TH[j]; nodes[j].classList.toggle('lit', an); if (an) curN = j; }
      for (var m = 0; m < nodes.length; m++) nodes[m].classList.toggle('cur', m === curN);
    }

    function onCiclosScroll() {
      var rect = track.getBoundingClientRect();
      var total = track.offsetHeight - window.innerHeight;
      setProgress(total > 0 ? (-rect.top) / total : 0);
    }

    function mobileReveal() {
      if (arc) arc.style.strokeDashoffset = '0';   // anel completo, estático
      if (head) head.style.opacity = '0';
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
        }, { threshold: 0.4 });
        legs.forEach(function (l) { io.observe(l); });
      } else { legs.forEach(function (l) { l.classList.add('on'); }); }
    }

    var mode = null;
    function setupCiclos() {
      var desktop = window.innerWidth > 860;
      if (desktop && mode !== 'desktop') {
        mode = 'desktop';
        window.addEventListener('scroll', onCiclosScroll, { passive: true });
        onCiclosScroll();
      } else if (!desktop && mode !== 'mobile') {
        mode = 'mobile';
        window.removeEventListener('scroll', onCiclosScroll);
        mobileReveal();
      }
    }
    setupCiclos();
    window.addEventListener('resize', setupCiclos);
  }

  /* ---------- Vídeo de fundo: recuperação de autoplay ---------- */
  var videos = Array.prototype.slice.call(document.querySelectorAll('video'));
  if (videos.length) {
    var attemptPlay = function (v) {
      try {
        v.muted = true; v.defaultMuted = true; v.autoplay = true;
        v.setAttribute('muted', ''); v.setAttribute('autoplay', '');
        v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
        var pr = v.play();
        if (pr && typeof pr.catch === 'function') pr.catch(function () {});
      } catch (e) {}
    };
    videos.forEach(function (v) {
      attemptPlay(v);
      v.addEventListener('loadedmetadata', function () { attemptPlay(v); });
      v.addEventListener('canplay', function () { attemptPlay(v); });
      v.addEventListener('pause', function () { if (!v.ended && !document.hidden) attemptPlay(v); });
    });
    var replayVisible = function () {
      if (document.hidden) return;
      videos.forEach(function (v) { if (v.readyState >= 2) attemptPlay(v); });
    };
    ['visibilitychange', 'focus', 'touchstart', 'touchend', 'click'].forEach(function (ev) {
      window.addEventListener(ev, replayVisible, { passive: true });
    });
  }
})();
