/* ---------- Theme (shared key with portfolio) ---------- */
(function () {
  var root = document.documentElement;
  try { var s = localStorage.getItem('kaushik-theme'); if (s) root.setAttribute('data-theme', s); } catch (e) {}
  var btn = document.getElementById('themeToggle');
  if (btn) btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('kaushik-theme', next); } catch (e) {}
  });
})();

/* ---------- QR code (with graceful fallback) ---------- */
(function () {
  var el = document.getElementById('qr');
  if (!el) return;
  var url = el.getAttribute('data-url');
  function fallback() {
    el.innerHTML = '<img src="https://api.qrserver.com/v1/create-qr-code/?size=188x188&margin=0&data=' +
      encodeURIComponent(url) + '" alt="QR code linking to ' + url + '" width="188" height="188" />';
  }
  try {
    if (window.QRCode) {
      new QRCode(el, {
        text: url, width: 188, height: 188,
        colorDark: '#0b1326', colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } else {
      fallback();
    }
  } catch (e) { fallback(); }
})();
