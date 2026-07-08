/* Ruptura — narrativa de texto (ferida → virada → CTA), pin via CSS sticky + GSAP scrub.
   Fundo: grid animado com ondas sutis (canvas). */
(function () {
  'use strict';
  var pin = document.querySelector('[data-rupture]');
  if (!pin) return;
  var track = pin.parentElement;
  var t1 = pin.querySelector('.rup-1');
  var t2 = pin.querySelector('.rup-2');
  var cta = pin.querySelector('.rup-cta');
  var canvas = pin.querySelector('.rupture__grid');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- grid animado com ondas (sutil) ---------- */
  if (canvas && !reduce){
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, STEP = 46;
    function resize(){
      var r = pin.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    function draw(now){
      var t = now * 0.0009;
      ctx.clearRect(0, 0, W, H);
      for (var y = STEP / 2; y < H; y += STEP){
        for (var x = STEP / 2; x < W; x += STEP){
          var w = Math.sin(x * 0.014 + t) + Math.sin(y * 0.016 - t * 0.8) + Math.sin((x + y) * 0.008 + t * 0.5);
          var lift = Math.max(0, w);
          var a = 0.045 + lift * 0.055;              // ~0.045..0.21 — bem sutil
          var r = 1 + lift * 0.9;
          ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832);
          ctx.fillStyle = 'rgba(232,121,26,' + a.toFixed(3) + ')';
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ---------- narrativa de texto (pin CSS sticky + GSAP scrub) ---------- */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  var tl = gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
  tl.to(t1, { opacity: 0, y: -8, duration: 0.12 }, 0.12);
  tl.fromTo(t2, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.12 }, 0.22);
  tl.to(t2, { opacity: 0, y: -8, duration: 0.10 }, 0.62);
  tl.fromTo(cta, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.14 }, 0.74);

  ScrollTrigger.refresh();
  window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ ScrollTrigger.refresh(); });
})();
