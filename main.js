// Вступление: занавес раскрывается → шторы уходят → снизу поднимается ночное небо и закрывает дворец → лента сцен
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const header = $('.header');

// ---------- Созвездия: рисуем один раз в SVG и отдаём в CSS как --stars ----------
// Случайность с зерном — небо одинаковое при каждом открытии и совпадает во вступлении и в ленте
function starsSvg() {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const W = 1440, H = 900;
  let dots = '', lines = '';
  for (let i = 0; i < 140; i++) {
    const r = (0.6 + rnd() * 1.1).toFixed(1), a = (0.25 + rnd() * 0.5).toFixed(2);
    dots += `<circle cx="${(rnd() * W) | 0}" cy="${(rnd() * H) | 0}" r="${r}" fill="#F4F1EA" fill-opacity="${a}"/>`;
  }
  // Созвездия: опорная точка и 4–6 звёзд, соединённых тонкой линией
  const centers = [[190, 150], [1180, 140], [760, 330], [300, 690], [1240, 610], [640, 800]];
  for (const [cx, cy] of centers) {
    const n = 4 + ((rnd() * 3) | 0);
    let x = cx, y = cy;
    const pts = [];
    for (let i = 0; i < n; i++) {
      pts.push([x | 0, y | 0]);
      x += 40 + rnd() * 70; y += (rnd() - 0.5) * 110;
    }
    lines += `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="#C9D8EA" stroke-opacity=".22" stroke-width="1"/>`;
    for (const [px, py] of pts) dots += `<circle cx="${px}" cy="${py}" r="${(1.5 + rnd() * 2).toFixed(1)}" fill="#E6F0FA" fill-opacity=".85"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
    `<filter id="b"><feGaussianBlur stdDeviation="1.4"/></filter><g filter="url(#b)">${lines}${dots}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
document.documentElement.style.setProperty('--stars', starsSvg());

// Каждое фото лежит выше следующего — подпись, выступающая вправо, не прячется под соседним фото
const shotsAll = document.querySelectorAll('.shot');
shotsAll.forEach((s, i) => { s.style.zIndex = shotsAll.length - i; });

// «Выбрать места»: продажи в учебном концепте нет — честно говорим об этом
const toast = $('.tickets__toast');
let toastTimer;
const say = text => {
  toast.textContent = text;
  toast.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2800);
};
document.querySelectorAll('.session__btn').forEach(b => b.addEventListener('click', () => say('Это учебный концепт — продажа билетов не подключена')));
// Ссылки подвала на страницы, которых в концепте нет
document.querySelectorAll('.js-stub').forEach(a => a.addEventListener('click', e => { e.preventDefault(); say('Это учебный концепт — такой страницы нет'); }));

// Вопросы: каждая карточка открывается и закрывается сама по себе (можно открыть несколько сразу).
// Закрытый ответ — inert: его не видно и до него не дойти клавишей Tab
document.querySelectorAll('.qa').forEach(card => {
  const btn = card.querySelector('.qa__q'), answer = card.querySelector('.qa__a');
  btn.addEventListener('click', () => {
    const open = !card.classList.contains('is-open');
    card.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open);
    answer.inert = !open;
  });
});

// ---------- Звёздное небо за «Даты и цены» и «Для родителей» ----------
// Завитки убраны (её правка) — остались только звёзды: мелкие точки разной яркости и редкие четырёхлучевые, белые и золотые.
// Один слой на оба блока, поэтому небо не обрывается на стыке. Пересчитывается при смене размера
function drawWind() {
  const layer = $('.windsky'), T = $('.tickets'), P = $('.parents');
  if (!layer || !T || !P) return;
  const sy = scrollY, top = T.getBoundingClientRect().top + sy;
  const H = Math.round(P.getBoundingClientRect().bottom + sy - top), W = document.documentElement.clientWidth;
  layer.style.top = top + 'px'; layer.style.height = H + 'px';
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let stars = '';
  for (let i = 0; i < Math.round(W * H / 5200); i++) stars += `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H).toFixed(0)}" r="${(0.5 + rnd() * 1.2).toFixed(1)}" fill-opacity="${(0.25 + rnd() * 0.55).toFixed(2)}"/>`;
  const STAR = 'M12 2C12.8 8.5 15.5 11.2 22 12C15.5 12.8 12.8 15.5 12 22C11.2 15.5 8.5 12.8 2 12C8.5 11.2 11.2 8.5 12 2Z';
  for (let i = 0; i < Math.round(W * H / 110000); i++) { const sc = (0.3 + rnd() * 0.35).toFixed(2), x = (rnd() * W).toFixed(0), y = (rnd() * H).toFixed(0);
    stars += `<path d="${STAR}" transform="translate(${x} ${y}) scale(${sc})" fill="${i % 3 ? '#F4F1EA' : '#E8C97A'}" fill-opacity=".85"/>`; }
  layer.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><g fill="#DCE6F5" opacity=".7">${stars}</g></svg>`;
}
let windTimer;
const redrawWind = () => { clearTimeout(windTimer); windTimer = setTimeout(drawWind, 150); };
addEventListener('resize', redrawWind);
addEventListener('load', drawWind);
document.fonts && document.fonts.ready.then(drawWind);
drawWind();

// Шапка: во время вступления стоит на месте; дальше прячется при прокрутке вниз
// (кроме названия — оно остаётся и уменьшается) и возвращается при прокрутке вверх
let introEnd = () => innerHeight; // с анимациями — конец закреплённого вступления (задаётся ниже)
let lastY = scrollY;
const phone = matchMedia('(max-width: 900px)');
function updateHeader() {
  const y = scrollY, dy = y - lastY;
  if (y < introEnd() - 4) { header.classList.remove('is-hidden', 'is-compact'); lastY = y; return; }
  header.classList.add('is-compact');
  if (Math.abs(dy) < 6) return;
  if (phone.matches || header.contains(document.activeElement)) { header.classList.remove('is-hidden'); lastY = y; return; } // на телефоне «Билеты» и бургер всегда под пальцем
  header.classList.toggle('is-hidden', dy > 0);
  lastY = y;
}
addEventListener('scroll', updateHeader, { passive: true });
header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

// ---------- Меню на телефоне ----------
const burger = $('.burger'), mmenu = $('#mmenu');
const lockScroll = on => { const l = window.__lenis; if (l) on ? l.stop() : l.start(); document.documentElement.style.overflow = on ? 'hidden' : ''; };
function openMenu() {
  mmenu.hidden = false; burger.setAttribute('aria-expanded', 'true'); lockScroll(true);
  requestAnimationFrame(() => requestAnimationFrame(() => mmenu.classList.add('is-open')));
  setTimeout(() => $('.mmenu__close').focus(), 60);
}
function closeMenu(returnFocus = true) {
  if (mmenu.hidden) return;
  mmenu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); lockScroll(false);
  const done = () => { if (!mmenu.classList.contains('is-open')) mmenu.hidden = true; };
  reduce ? done() : setTimeout(done, 520);
  if (returnFocus) burger.focus({ preventScroll: true });
}
burger.addEventListener('click', openMenu);
$('.mmenu__close').addEventListener('click', () => closeMenu());
addEventListener('keydown', e => { if (e.code === 'Escape' && !mmenu.hidden) closeMenu(); });
// Нажатие на пункт: сначала закрываем меню и возвращаем прокрутку, потом срабатывает обычный переход к блоку
mmenu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(false); }, true);
// Фокус не уходит из открытого меню
mmenu.addEventListener('keydown', e => {
  if (e.code !== 'Tab') return;
  const f = [...mmenu.querySelectorAll('a, button')]; const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
phone.addEventListener('change', e => { if (!e.matches) closeMenu(false); });

// ---------- Текущий раздел: золотом в меню телефона («вы здесь») и в меню компьютера ----------
const sectionIds = ['after', 'tale', 'tickets', 'parents', 'faq', 'visit'];
const markCurrent = id => {
  document.querySelectorAll('.mmenu__link').forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + id));
  document.querySelectorAll('.nav .link').forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + id));
};
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(list => list.forEach(it => { if (it.isIntersecting) markCurrent(it.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
  sectionIds.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
}
addEventListener('scroll', () => { if (scrollY < innerHeight * 0.5) markCurrent(''); }, { passive: true });

if (reduce || !window.gsap || !window.ScrollTrigger) {
  // Без анимаций: дворец с названием, лента листается сама по себе
  document.documentElement.classList.add('no-motion');
} else {
  gsap.registerPlugin(ScrollTrigger);

  // Плавная прокрутка: колёсико не прыгает по 100 px
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: t => 1 - Math.pow(1 - t, 3), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    window.__lenis = lenis; // меню на телефоне останавливает прокрутку страницы под собой
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const half = () => innerWidth * 0.42;
  const END = 2.85, FADE = 0.85, PIN = 2.6; // PIN — длина вступления в экранах прокрутки

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.journey', start: 'top top', end: '+=' + PIN * 100 + '%', scrub: lenis ? true : 0.6, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
    },
  });

  // 0–1: занавес раскрывается, на фоне дворца проступает название
  tl.to(['.arrow', '.skip'], { autoAlpha: 0, duration: 0.25 }, 0)
    .to('.closed-title', { autoAlpha: 0, y: -30, duration: 0.3 }, 0)
    .to('.curtain--l', { x: () => -half(), duration: 1, ease: 'power1.inOut' }, 0)
    .to('.curtain--r', { x: () => half(), duration: 1, ease: 'power1.inOut' }, 0)
    .to(['.veil', '.scene-title'], { autoAlpha: 1, duration: 0.35 }, 0.65)

  // 1.0: шторы и ламбрекен уходят с экрана, название тает
    .to('.curtain--l', { x: () => -innerWidth * 0.8, duration: 0.8, ease: 'power1.in' }, 1.0)
    .to('.curtain--r', { x: () => innerWidth * 0.8, duration: 0.8, ease: 'power1.in' }, 1.0)
    .to('.valance', { yPercent: -110, duration: 0.8, ease: 'power1.in' }, 1.0)
    .to(['.veil', '.scene-title'], { autoAlpha: 0, duration: 0.45 }, 1.1)

  // 1.2–2.6: снизу поднимается ночное небо мягким краем и постепенно закрывает дворец,
  // дворец при этом чуть приподнимается — небо будто наплывает
    // Мягкий край маски едет вверх, а само небо чуть поднимается следом — без отдельной полосы-края
    .fromTo('.night', { '--m': '0px', yPercent: 12 }, { '--m': () => -2 * $('.stage').clientHeight + 'px', yPercent: 0, duration: 1.4, ease: 'power1.inOut' }, 1.2)
    .to('.scene', { yPercent: -4, scale: 1.1, duration: 1.6 }, 1.0)
    // Дворец гаснет под небом, чтобы сквозь мягкий край не просвечивали тёмные озеро и лес (полоса)
    .to('.scene', { autoAlpha: 0, duration: 1.0, ease: 'power1.in' }, 1.5)

    // Небо почти закрыло экран: вступление растворяется, под ним то же небо с заголовком, а справа уже едут фото
    .to('.stage', { autoAlpha: 0, duration: FADE, ease: 'power1.inOut' }, END - FADE);

  // ---------- Сцены шоу: лента едет справа налево, каждое фото со своей скоростью ----------
  const track = $('.reel__track');
  const reelDistance = () => Math.max(0, track.offsetWidth - innerWidth);
  // Лента подложена под вступление так, что закрепляется ровно когда оно начинает таять
  const reelSec = $('.stage-reel');
  const fadePx = () => FADE / END * PIN * innerHeight;
  const setOverlap = () => { reelSec.style.marginTop = -(innerHeight + fadePx()) + 'px'; };
  setOverlap();
  ScrollTrigger.addEventListener('refreshInit', setOverlap);
  const reelTl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.stage-reel', start: 'top top', end: () => '+=' + reelDistance(),
      pin: '.reel__pin', scrub: true, invalidateOnRefresh: true, anticipatePin: 1,
    },
  });
  // Фото трогаются сразу, как только лента закрепилась — ещё во время перехода
  reelTl.to(track, { x: () => -reelDistance(), duration: () => reelDistance() })
  // Как на landonorris.com: коллаж выплывает из правого нижнего угла — сначала одновременно поднимается и едет влево,
  // потом, встав на свою высоту, едет только влево
    .fromTo(track, { y: () => innerHeight * 0.7 }, { y: 0, duration: () => innerHeight * 0.9, ease: 'power2.out' }, 0);

  // ---------- О спектакле: разгорается луна, справа выезжают тёмные сани, перед луной светлеют, проступает история ----------
  const sleigh = $('.tale__sleigh');
  const taleTl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.tale__pin', start: 'top top', end: '+=200%', pin: true, scrub: lenis ? true : 0.6, anticipatePin: 1,
      onToggle: s => trail.active(s.isActive),
    },
  });
    // Полёт по дуге: по горизонтали ровно, по вертикали с замедлением — сани «садятся» на место перед луной
  taleTl.fromTo(sleigh, { xPercent: 105 }, { xPercent: 0, duration: 1.5, ease: 'power2.out' }, 0)
    .fromTo(sleigh, { yPercent: 16, rotation: -6 }, { yPercent: 0, rotation: 0, duration: 1.5, ease: 'sine.out' }, 0)
    .fromTo('.tale__shade', { opacity: 1 }, { opacity: 0, duration: 0.9, ease: 'power1.inOut' }, 0.7)
    .fromTo(['.tale__over', '.tale__title'], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.1 }, 0.9)
    .fromTo('.tale__story p', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.18 }, 1.3)
    .fromTo('.tale__sign', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 2.0)
    .to({}, { duration: 0.4 });
  // Общее небо плавно темнеет к саням: звёзды и отливы гаснут, остаётся ровный тёмно-синий
  gsap.fromTo('.space__dark', { opacity: 0 }, {
    opacity: 1, ease: 'none',
    scrollTrigger: { trigger: '.tale', start: 'top 95%', end: 'top 5%', scrub: true },
  });
  // Луна плавно выдвигается снизу ещё до закрепления — пока уходят последние фото ленты
  gsap.fromTo('.tale__moon', { yPercent: 70, autoAlpha: 0 }, {
    yPercent: 0, autoAlpha: 1, ease: 'power2.out',
    scrollTrigger: { trigger: '.tale', start: 'top 85%', end: 'top top', scrub: lenis ? true : 0.6 },
  });
  // Сани в полёте чуть покачиваются — отдельный слой, чтобы не спорить с прокруткой
  gsap.to('.tale__sleigh-sway', { y: -7, rotation: 0.7, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  // Снежный след: искры сыплются с задника саней и медленно тают
  const trail = (() => {
    const cv = $('.tale__trail'), cx = cv.getContext('2d');
    let on = false, last = null, parts = [];
    const fit = () => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); cv.width = r.width * d; cv.height = r.height * d; cx.setTransform(d, 0, 0, d, 0, 0); };
    addEventListener('resize', fit); fit();
    function tick() {
      if (!on) return;
      const box = cv.getBoundingClientRect(), s = sleigh.getBoundingClientRect();
      // Задник саней: правый край, чуть ниже середины
      const ex = s.left - box.left + s.width * 0.9, ey = s.top - box.top + s.height * 0.78;
      const speed = last ? Math.hypot(ex - last[0], ey - last[1]) : 0;
      last = [ex, ey];
      const n = 2 + Math.min(10, speed * 0.6);
      for (let i = 0; i < n; i++) parts.push({ x: ex + (Math.random() - 0.3) * s.width * 0.12, y: ey + (Math.random() - 0.5) * s.height * 0.12,
        vx: 0.25 + Math.random() * 0.9 + speed * 0.05, vy: (Math.random() - 0.35) * 0.5, r: 0.6 + Math.random() * 2.2, a: 0.5 + Math.random() * 0.5 });
      cx.clearRect(0, 0, box.width, box.height);
      parts = parts.filter(p => (p.a -= 0.007) > 0);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.004;
        cx.globalAlpha = p.a; cx.fillStyle = '#E6F0FA';
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fill();
      }
      if (parts.length > 900) parts.splice(0, parts.length - 900);
    }
    gsap.ticker.add(tick);
    return { active(v) { on = v; if (v) fit(); else { last = null; } } };
  })();

  // ---------- Даты и цены: билет «печатается» сверху вниз, сеансы проступают по очереди,
  // вырезы «пробиваются», линия отрыва прорисовывается точками слева направо ----------
  gsap.timeline({ scrollTrigger: { trigger: '.tickets', start: 'top 72%', once: true } })
    .from('.tickets__head > *', { autoAlpha: 0, y: 26, duration: 0.8, stagger: 0.12, ease: 'power2.out' }, 0)
    .fromTo('.ticket', { clipPath: 'inset(0px -60px 100% -60px)', y: -24 },
      { clipPath: 'inset(-60px -60px -60px -60px)', y: 0, duration: 1.3, ease: 'power2.inOut' }, 0.25)
    .from('.ticket__top', { autoAlpha: 0, duration: 0.5 }, 0.55)
    .from('.session', { autoAlpha: 0, x: -18, duration: 0.6, stagger: 0.09, ease: 'power2.out' }, 0.6)
    .from('.ticket__hole', { scale: 0, duration: 0.45, ease: 'back.out(2.5)' }, 1.05)
    .from('.ticket__dots', { scaleX: 0, transformOrigin: '0 50%', duration: 0.9, ease: 'power1.inOut' }, 1.1)
    .from('.zone', { autoAlpha: 0, y: 20, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 1.35);

  // ---------- Для родителей: призрачное «антракт» медленно плывёт, программка всплывает, колонки — по очереди ----------
  gsap.fromTo('.parents__ghost', { xPercent: -56 }, {
    xPercent: -44, ease: 'none',
    scrollTrigger: { trigger: '.parents', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  gsap.timeline({ scrollTrigger: { trigger: '.parents', start: 'top 72%', once: true } })
    .from(['.parents__over', '.parents__title'], { autoAlpha: 0, y: 26, duration: 0.8, stagger: 0.1, ease: 'power2.out' }, 0)
    .from('.parents__card', { autoAlpha: 0, y: 40, duration: 0.9, ease: 'power2.out' }, 0.25)
    .from('.note', { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 0.55);

  // ---------- Вопросы: фото проявляется, карточки всплывают по очереди и «замерзают» — иней нарастает уже на месте ----------
  gsap.timeline({ scrollTrigger: { trigger: '.faq', start: 'top 70%', once: true } })
    .from('.faq__art', { autoAlpha: 0, duration: 1.2, ease: 'power1.out' }, 0)
    .from('.faq__head > *', { autoAlpha: 0, y: 26, duration: 0.8, stagger: 0.1, ease: 'power2.out' }, 0.1)
    .from('.qa', { autoAlpha: 0, y: 40, duration: 0.7, stagger: 0.08, ease: 'power2.out' }, 0.35)
    .from('.qa:not(.is-open) .qa__frost', { opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power1.inOut' }, 0.7);

  // ---------- Как добраться: линии орнамента вырастают от снежинки, текст и карта всплывают ----------
  gsap.timeline({ scrollTrigger: { trigger: '.visit', start: 'top 75%', once: true } })
    .from('.ornament span', { scaleX: 0, transformOrigin: (i) => (i ? '0% 50%' : '100% 50%'), duration: 0.9, ease: 'power2.out' }, 0)
    .from('.ornament .ico', { autoAlpha: 0, rotation: -60, duration: 0.7, ease: 'power2.out' }, 0)
    .from('.visit__text > *', { autoAlpha: 0, y: 22, duration: 0.7, stagger: 0.08, ease: 'power2.out' }, 0.3)
    .from('.visit__map', { autoAlpha: 0, y: 30, duration: 0.9, ease: 'power2.out' }, 0.45);

  // Переходы по якорям — плавно, через Lenis (к билету, вопросам, родителям, карте, «О спектакле»)
  document.querySelectorAll('a[href="#tickets"], a[href="#faq"], a[href="#parents"], a[href="#visit"], a[href="#tale"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const id = a.getAttribute('href');
    if (lenis) lenis.scrollTo(id, { duration: 2.4 }); else $(id).scrollIntoView({ behavior: 'smooth' });
  }));

  addEventListener('load', () => ScrollTrigger.refresh());
  introEnd = () => tl.scrollTrigger.end;
  ScrollTrigger.addEventListener('refresh', redrawWind); // закрепления сдвигают блоки — перерисовать ветер на новом месте

  // «Билеты», «Купить билет», «Сразу к сценам» — к ленте сцен
  document.querySelectorAll('a[href="#after"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const top = tl.scrollTrigger.end + 2;
    if (lenis) lenis.scrollTo(top, { duration: 2.4 }); else window.scrollTo({ top, behavior: 'smooth' });
  }));
}
