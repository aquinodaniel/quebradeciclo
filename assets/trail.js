/* Mouse trail sutil — rastro de brasa seguindo o cursor. Só em telas com mouse. */
(function () {
  if (!window.matchMedia) return;
  if (!matchMedia('(pointer: fine)').matches) return;               // ignora toque
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;mix-blend-mode:screen';
  document.body.appendChild(cv);
  var ctx = cv.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize(){ cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  resize();
  addEventListener('resize', resize);

  var pts = [], last = 0;
  addEventListener('mousemove', function (e){
    var now = e.timeStamp || Date.now();
    if (now - last < 16) return;                                    // limita densidade
    last = now;
    pts.push({ x: e.clientX, y: e.clientY, life: 1 });
    if (pts.length > 70) pts.shift();
  }, { passive: true });

  function frame(){
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (var i = 0; i < pts.length; i++){
      var p = pts[i];
      p.life -= 0.05;
      if (p.life <= 0) continue;
      var r = 9 * p.life + 2;
      var a = p.life * 0.2;                                          // bem sutil
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, 'rgba(245,166,35,' + a.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(232,121,26,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill();
    }
    for (var j = pts.length - 1; j >= 0; j--) if (pts[j].life <= 0) pts.splice(j, 1);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
