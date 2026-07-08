/* Modal de captura (nome, telefone, e-mail) + exit-intent + smooth-scroll.
   Todo CTA (#checkout) abre o modal; ao cadastrar, redireciona pro gateway. */
(function () {
  'use strict';

  // >>> TROCAR pela URL real do checkout/gateway <<<
  var CHECKOUT_URL = 'https://pay.example.com/quebra-de-ciclo';

  var modal = document.getElementById('lead-modal');
  if (!modal) return;
  var form = document.getElementById('lead-form');
  var lastFocus = null;
  var isOpen = false;

  function lockScroll(on) {
    document.documentElement.style.overflow = on ? 'hidden' : '';
    document.body.style.overflow = on ? 'hidden' : '';
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement;
    modal.hidden = false;
    void modal.offsetWidth;              // força reflow p/ animar
    modal.classList.add('open');
    lockScroll(true);
    var first = modal.querySelector('input, button');
    if (first) setTimeout(function () { first.focus(); }, 50);
    document.addEventListener('keydown', onKey);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    modal.classList.remove('open');
    lockScroll(false);
    document.removeEventListener('keydown', onKey);
    setTimeout(function () { modal.hidden = true; }, 280);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'Tab') trap(e);
  }

  function trap(e) {
    var f = Array.prototype.filter.call(
      modal.querySelectorAll('input, button, a[href]'),
      function (el) { return !el.disabled && el.offsetParent !== null; }
    );
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- cliques: CTA abre modal; âncoras rolam suave ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"], [data-cta-open]');
    if (!a) return;
    if (a.hasAttribute('data-cta-open')) { e.preventDefault(); open(); return; }
    var href = a.getAttribute('href');
    if (href === '#checkout') { e.preventDefault(); open(); return; }
    if (href && href.length > 1 && href !== '#') {
      var tgt = document.querySelector(href);
      if (tgt) {
        e.preventDefault();
        window.scrollTo({ top: tgt.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
      }
    }
  });

  Array.prototype.forEach.call(modal.querySelectorAll('[data-close]'), function (c) {
    c.addEventListener('click', close);
  });

  /* ---------- máscara simples de telefone (BR) ---------- */
  var tel = document.getElementById('lf-tel');
  if (tel) {
    tel.addEventListener('input', function () {
      var v = tel.value.replace(/\D/g, '').slice(0, 11);
      var out = v;
      if (v.length > 7) out = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
      else if (v.length > 2) out = '(' + v.slice(0, 2) + ') ' + v.slice(2);
      else if (v.length > 0) out = '(' + v;
      tel.value = out;
    });
  }

  function setErr(field, ok) {
    var wrap = field.closest('.field');
    if (wrap) wrap.classList.toggle('field--err', !ok);
  }

  /* ---------- submit → valida → redireciona pro gateway ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim();
    var telv = form.telefone.value.trim();
    var email = form.email.value.trim();
    var digits = telv.replace(/\D/g, '');
    var okNome = nome.length >= 2;
    var okTel = digits.length >= 10;
    var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setErr(form.nome, okNome);
    setErr(form.telefone, okTel);
    setErr(form.email, okEmail);
    if (!okNome || !okTel || !okEmail) {
      var bad = form.querySelector('.field--err input');
      if (bad) bad.focus();
      return;
    }
    try { localStorage.setItem('qc_lead', JSON.stringify({ nome: nome, telefone: digits, email: email, ts: Date.now() })); } catch (_) {}
    var btn = form.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; var s = btn.querySelector('span'); if (s) s.textContent = 'Redirecionando...'; }
    var sep = CHECKOUT_URL.indexOf('?') > -1 ? '&' : '?';
    window.location.href = CHECKOUT_URL + sep +
      'nome=' + encodeURIComponent(nome) +
      '&telefone=' + encodeURIComponent(digits) +
      '&email=' + encodeURIComponent(email);
  });

  /* ---------- exit-intent (abre 1x por sessão) ---------- */
  var exitShown = false;
  try { exitShown = sessionStorage.getItem('qc_exit') === '1'; } catch (_) {}
  function fireExit() {
    if (exitShown || isOpen) return;
    exitShown = true;
    try { sessionStorage.setItem('qc_exit', '1'); } catch (_) {}
    open();
  }
  // desktop: cursor sai pelo topo da janela
  document.addEventListener('mouseout', function (e) {
    if (e.clientY <= 0 && !e.relatedTarget) fireExit();
  });
  // rolar pra cima rápido perto do topo (depois de ter descido) — mobile/desktop
  var lastY = window.scrollY, lastT = Date.now(), wentDeep = false;
  window.addEventListener('scroll', function () {
    var y = window.scrollY, t = Date.now();
    if (y > window.innerHeight * 1.2) wentDeep = true;
    var vel = (y - lastY) / (t - lastT || 1);   // px/ms; negativo = subindo
    if (wentDeep && vel < -1.6 && y < window.innerHeight * 0.5) fireExit();
    lastY = y; lastT = t;
  }, { passive: true });
})();
