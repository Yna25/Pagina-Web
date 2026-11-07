const WEDDING_DATE = new Date('2027-03-20T16:00:00');

function pad(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
  const diff = WEDDING_DATE - Date.now();
  const el = document.getElementById('countdown');
  if (!el) return;
  if (diff <= 0) {
    el.innerHTML = '<p style="font-family:var(--font-display);font-size:1.5rem;color:var(--sage);font-style:italic;text-align:center">¡Hoy es el gran día! 🤍</p>';
    return;
  }
  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const d = document.getElementById('days');
  const h = document.getElementById('hours');
  const m = document.getElementById('minutes');
  const s = document.getElementById('seconds');
  if (d) d.textContent = pad(days);
  if (h) h.textContent = pad(hours);
  if (m) m.textContent = pad(minutes);
  if (s) s.textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ---- ACCORDION ---- */
document.querySelectorAll('.accordion__btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.accordion__item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.accordion__item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ---- CAROUSEL ---- */
(function () {
  const carousel = document.querySelector('.photo-carousel');
  const track    = document.querySelector('.carousel__track');
  if (!track) return;

  const realSlides = Array.from(track.querySelectorAll('.carousel__slide'));
  const count      = realSlides.length;
  const dotsEl     = document.querySelector('.carousel__dots');
  if (count < 2) return;

  /* Clone first and last for seamless loop */
  const cloneFirst = realSlides[0].cloneNode(true);
  const cloneLast  = realSlides[count - 1].cloneNode(true);
  track.appendChild(cloneFirst);
  track.prepend(cloneLast);

  /* total slides = count + 2; real slides start at index 1 */
  let current = 1; /* starts on first real slide */
  let timer;

  function setPos(idx, animated) {
    if (!animated) track.style.transition = 'none';
    track.style.transform = `translateX(-${idx * 100}%)`;
    if (!animated) track.offsetHeight; /* force reflow */
    if (!animated) track.style.transition = '';
  }

  function updateDots(realIdx) {
    dotsEl && dotsEl.querySelectorAll('.carousel__dot').forEach((d, i) =>
      d.classList.toggle('active', i === realIdx));
  }

  function goTo(n) {
    /* n is 1-based real index */
    const realIdx = ((n - 1 + count) % count);
    current = n;
    setPos(current, true);
    updateDots(realIdx);
  }

  /* After transition, snap silently if on a clone */
  track.addEventListener('transitionend', () => {
    if (current === 0) {
      setPos(count, false);
      current = count;
    } else if (current === count + 1) {
      setPos(1, false);
      current = 1;
    }
  });

  /* Dots */
  if (dotsEl) {
    realSlides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Foto ' + (i + 1));
      dot.addEventListener('click', () => { goTo(i + 1); resetTimer(); });
      dotsEl.appendChild(dot);
    });
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => { goTo(current + 1); }, 5000);
  }

  /* Swipe / drag */
  let startX = 0, dragging = false;
  carousel.addEventListener('pointerdown', e => { startX = e.clientX; dragging = true; carousel.setPointerCapture(e.pointerId); });
  carousel.addEventListener('pointerup', e => {
    if (!dragging) return; dragging = false;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 40) { goTo(current + (diff < 0 ? 1 : -1)); resetTimer(); }
  });
  carousel.addEventListener('pointercancel', () => { dragging = false; });

  setPos(1, false);
  resetTimer();
})();

/* ---- PLACES CAROUSEL ---- */
(function () {
  const wrap  = document.querySelector('.places-carousel');
  const track = document.querySelector('.places-track');
  if (!track) return;

  const slides  = track.querySelectorAll('.places-slide');
  const dotsEl  = document.querySelector('.places-dots');
  const btnPrev = document.querySelector('.places-btn--prev');
  const btnNext = document.querySelector('.places-btn--next');
  const total   = slides.length;
  let cur = 0;

  function goTo(n) {
    cur = (n + total) % total;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dotsEl && dotsEl.querySelectorAll('.places-dot').forEach((d, i) =>
      d.classList.toggle('active', i === cur));
  }

  if (dotsEl) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'places-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Lugar ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });
  }

  btnPrev && btnPrev.addEventListener('click', () => goTo(cur - 1));
  btnNext && btnNext.addEventListener('click', () => goTo(cur + 1));

  /* Swipe */
  let startX = 0;
  wrap.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    startX = e.clientX; wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener('pointerup', e => {
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 40) goTo(cur + (diff < 0 ? 1 : -1));
  });

  goTo(0);
})();
