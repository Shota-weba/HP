/*
 * Shota Otake - HP表示用JavaScript
 *
 * 重要：論文・学会発表・受賞歴・お知らせなどの本文は index.html で編集します。
 * このファイルには業績のタイトルや著者名を記入しません。
 * 色や余白は style.css / enhancements.css で設定します。
 * GA4の測定IDは analytics.js で設定します。
 */

// ==================== サイドバー / ページ内ナビゲーション ====================
const links = [...document.querySelectorAll('.side-nav a')];
const sections = links
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      links.forEach(link => {
        link.classList.toggle('active', link.hash === `#${entry.target.id}`);
      });
    }
  }, { rootMargin: '-12% 0px -70% 0px' });
  sections.forEach(section => observer.observe(section));
}

const menuButton = document.querySelector('#menu-toggle');
const backdrop = document.querySelector('#mobile-backdrop');

function closeMenu() {
  document.body.classList.remove('menu-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}
menuButton?.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
});
backdrop?.addEventListener('click', closeMenu);
links.forEach(link => link.addEventListener('click', closeMenu));

// ── トップページの試料写真スライダー ──────────────────────
// 研究試料の写真3枚はこれまでどおり表示します。
const slider = document.querySelector('.photo-slider');
if (slider) {
  const photos = [...slider.querySelectorAll('.slide')];
  const dots = [...slider.querySelectorAll('.slide-dot')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer;

  function showPhoto(next) {
    current = (next + photos.length) % photos.length;
    photos.forEach((photo, i) => photo.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
      dot.setAttribute('aria-pressed', String(i === current));
    });
  }

  function stop() { clearInterval(timer); }
  function play() {
    stop();
    if (!reduceMotion.matches && !document.hidden) {
      timer = setInterval(() => showPhoto(current + 1), 4000);
    }
  }

  slider.querySelector('.slide-prev')?.addEventListener('click', () => {
    showPhoto(current - 1);
    play();
  });
  slider.querySelector('.slide-next')?.addEventListener('click', () => {
    showPhoto(current + 1);
    play();
  });
  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    showPhoto(i);
    play();
  }));
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', play);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', e => {
    if (!slider.contains(e.relatedTarget)) play();
  });
  document.addEventListener('visibilitychange', play);
  reduceMotion.addEventListener?.('change', play);
  play();
}


// ==================== 各一覧の件数を自動表示 ====================
// 使い方：HTMLの数字部分に <span data-count-for="#対象の一覧 > li">0</span>
// を記入します。新しいliを追加したら数字は自動更新されます。
document.querySelectorAll('[data-count-for]').forEach(label => {
  const selector = label.getAttribute('data-count-for');
  if (!selector) return;
  try {
    label.textContent = String(document.querySelectorAll(selector).length);
  } catch (error) {
    console.warn('件数カウント対象の指定を確認してください:', selector, error);
  }
});
