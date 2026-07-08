/* A Oferta — efeito "processo-cards-scroll-reveal" (GSAP + ScrollTrigger + SplitText) */
(function () {
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // tudo estático

  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function debounce(fn, d){ var t; return function(){ clearTimeout(t); t = setTimeout(fn, d); }; }

  function build(section){
    return gsap.context(function () {
      var title = section.querySelector('.effect-title');
      if (title){
        title.classList.add('split-text');
        var st = new SplitText(title, { type: 'lines,words,chars', mask: 'lines',
          autoSplit: true, linesClass: 'line-split', wordDelimiter: '‍' });
        gsap.from(st.chars, { yPercent: 100, opacity: 0, duration: 0.8,
          stagger: { amount: 0.2 }, ease: 'power4.out',
          scrollTrigger: { trigger: title, start: 'top 80%', once: true } });
      }
      var sub = section.querySelector('.effect-subtitle');
      if (sub){
        sub.classList.add('split-text');
        var ss = new SplitText(sub, { type: 'lines', mask: 'lines',
          autoSplit: true, linesClass: 'line-split', wordDelimiter: '‍' });
        gsap.from(ss.lines, { yPercent: 100, opacity: 0, duration: 0.8,
          stagger: 0.1, ease: 'power4.out',
          scrollTrigger: { trigger: sub, start: 'top 80%', once: true } });
      }
      var cards = section.querySelectorAll('.effect-card');
      var desk = window.matchMedia('(min-width: 1024px)').matches;
      var xStep = desk ? 150 : 75, yStep = desk ? 200 : 100;
      var oTrack = section.parentElement;   // .oferta-track (pin via CSS sticky)
      gsap.from(cards, {
        x: function (i){ return (i + 1) * xStep; },
        y: function (i){ return (i + 1) * yStep; },
        rotate: function (i){ return gsap.utils.wrap([-1, 1], i) * gsap.utils.random(10, 25); },
        stagger: { each: 0.1, ease: 'power2.out' },
        scrollTrigger: desk
          ? { trigger: oTrack, start: 'top 60%', end: 'bottom bottom', scrub: true }
          : { trigger: section, start: 'top bottom', end: 'bottom bottom', scrub: true }
      });
    }, section);
  }

  function init(){
    document.querySelectorAll('[data-effect="processo-cards-scroll-reveal"]').forEach(function (section){
      if (section._ctx) section._ctx.revert();
      section._ctx = build(section);
    });
    ScrollTrigger.refresh();
  }

  function start(){
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(init); else init();
    window.addEventListener('resize', debounce(init, 200));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
