/*
 * サイト全体の動作
 *
 * 編集先の一覧
 *   - 学会発表・受賞の内容 : site-data.json
 *   - 追加したデザイン   : enhancements.css
 *   - アクセス解析の設定 : analytics.js
 *
 * 元の index.html / style.css は変更不要。
 * 自己紹介欄の人物写真の自動挿入は廃止しています。
 */

// ── 追加CSS ──────────────────────────────────────────────
// 既存のCSSを維持したまま、追加した表示デザインを読み込みます。
const addedStyle = document.createElement('link');
addedStyle.rel = 'stylesheet';
addedStyle.href = 'enhancements.css';
document.head.append(addedStyle);

// ── ページ内ナビゲーション ────────────────────────────────
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

// ── 自己紹介欄（About）────────────────────────────────────
// 人物写真（images/profile-otake.jpg）を自動挿入していた
// 旧コードは削除しました。文章・経歴・所属は変更しません。
// 注：画像ファイルそのものはGitHub側で別途削除してください。

// ── 学会発表・受賞 ────────────────────────────────────────
// 学会発表と受賞のデータは、従来どおり site-data.json に保存します。
function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content != null) node.textContent = content;
  return node;
}

function eventInfo(item, events) {
  return events[item.event] || {
    name: '会議情報未確認',
    date: '',
    location: ''
  };
}

function createPresentation(item, events) {
  const event = eventInfo(item, events);
  const li = document.createElement('li');
  const year = element('span', 'talk-year', event.date.slice(0, 4));
  const body = element('div', 'talk-content');
  const title = element('strong', 'talk-title', item.title);
  const authors = element('span', 'talk-authors', item.authors);
  const conference = element('span', 'talk-event', event.name);
  const meta = element('small', 'talk-meta');
  const date = element('time', '', event.date);
  const location = element('span', '', event.location);

  meta.append(date, document.createTextNode(' · '), location);
  body.append(title, authors, conference, meta);
  li.append(year, body);
  return li;
}

function createAward(item, events) {
  const event = eventInfo(item, events);
  const li = document.createElement('li');
  const year = element('span', 'award-year', event.date.slice(0, 4));
  const body = element('div', 'award-content');
  const title = element('strong', 'award-title', item.name);
  const subject = element('span', 'award-subject', item.title);
  const authors = element('span', 'talk-authors', item.authors);
  const conference = element('span', 'talk-event', event.name);
  const meta = element('small', 'talk-meta', `${event.date} · ${event.location}`);

  body.append(title, subject, authors, conference, meta);
  li.append(year, body);
  return li;
}

function replacePresentations(list, records, events) {
  if (!list) return;
  list.replaceChildren(...records.map(item => createPresentation(item, events)));
}

function makeCoauthorSection(title, records, events, collapsed = false) {
  const section = document.createElement('div');
  section.className = 'coauthor-group';
  const list = element('ol', 'talks');
  replacePresentations(list, records, events);
  if (collapsed) {
    const details = element('details', 'archive');
    details.append(element('summary', '', `${title}（${records.length}件）を表示`), list);
    section.append(details);
  } else {
    section.append(element('h4', 'coauthor-heading', `${title}（${records.length}件）`), list);
  }
  return section;
}

function renderRecords(data) {
  const events = data.events;
  const pres = data.presentations;

  // 国際学会・主著：常時表示
  replacePresentations(
    document.querySelector('#intl + .talks'),
    pres.international,
    events
  );

  // 国内学会・主著：開閉式の表示
  const domesticArchive = document.querySelector('#domestic + details.archive');
  if (domesticArchive) {
    domesticArchive.querySelector('summary').textContent =
      `国内学会発表（${pres.domestic.length}件）を表示`;
    replacePresentations(domesticArchive.querySelector('.talks'), pres.domestic, events);
  }

  // 共著：国際・国内に分類
  const coauthorsHeading = document.querySelector('#collaborations');
  if (coauthorsHeading) {
    const oldContent = [];
    for (let node = coauthorsHeading.nextElementSibling; node; node = node.nextElementSibling) {
      oldContent.push(node);
    }
    oldContent.forEach(node => node.remove());
    coauthorsHeading.after(
      makeCoauthorSection('国際学会・共著', pres.co_international, events),
      makeCoauthorSection('国内学会・共著', pres.co_domestic, events, true)
    );
  }

  // 受賞歴
  const awards = document.querySelector('#awards .award-list');
  if (awards) awards.replaceChildren(...data.awards.map(item => createAward(item, events)));
}

fetch('site-data.json')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(renderRecords)
  .catch(error => {
    // データを読み込めない場合も既存の発表欄は残します。
    console.error('学会発表データを読み込めませんでした:', error);
  });

// ── 非公開のアクセス解析管理画面（Google Analytics 4）─────
// アクセス数・国・地域・都市をGoogle Analytics側で集計します。
// 計測IDの設定場所は analytics.js の冒頭だけです。
const analyticsLoader = document.createElement('script');
analyticsLoader.src = 'analytics.js';
analyticsLoader.async = true;
document.head.append(analyticsLoader);
