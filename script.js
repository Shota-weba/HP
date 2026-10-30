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
// 人物写真の自動挿入は廃止済みです。
// 研究テーマの見出しをトップから自己紹介へ移動（2026-10-16の修正を維持）。
// HTML要素を移動するので、表示内容の重複や書き写しは発生しません。
const researchTheme = document.querySelector('.hero > .hero-theme');
const aboutSectionHeading = document.querySelector('#about > .section-heading');
if (researchTheme && aboutSectionHeading) {
  aboutSectionHeading.after(researchTheme);
}

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

// ── 共著論文（2026年）の追加 ─────────────────────────────────
// 2026-10-27 に登録した論文です。
//
// 編集する場所：直下の publication オブジェクト
//   title   : 英語論文タイトル
//   authors : 全著者を掲載順に入力（現在は書誌データ未確認）
//   journal : 雑誌名・巻・年・論文番号
//   doi     : DOI文字列
//
// 掲載元HTMLの既存論文は一切削除・変更せず、2026年の共著欄へ1件追加します。
// 最新版 index.html の上書きを避けるため、ここで表示だけ追加しています。
(function addInGaNSuperlatticePublication() {
  const publication = {
    title: 'X-ray scintillation properties of an InGaN/GaN superlattice thin film',
    // 出版社のAccepted Manuscript表示（2026-10-26公開）に基づく著者順。
    authors: 'A. Iwai, A. Michiue, S. Otake, N. Kawaguchi, T. Yanagida',
    // 巻番号・論文番号は未発行のため、仮表記（xx）のまま公開します。
    journal: 'Japanese Journal of Applied Physics, xx (2026) xx',
    doi: '10.35848/1347-4065/aeb997'
  };

  // 2026年の共著論文リストは #co-author 内の最初の .papers です。
  const list = document.querySelector('#co-author ol.papers');
  if (!list) return;

  const doiUrl = `https://doi.org/${publication.doi}`;
  // 将来 index.html 側にも同じ論文を追加した際に重複させません。
  if ([...list.querySelectorAll('a[href]')].some(a => a.href === doiUrl)) return;

  // 既存の .paper-title / .authors / .journal と同じHTML構造を使用。
  const item = document.createElement('li');
  const title = document.createElement('div');
  title.className = 'paper-title';
  title.textContent = publication.title;

  const authors = document.createElement('div');
  authors.className = 'authors';
  authors.textContent = publication.authors;

  const journal = document.createElement('div');
  journal.className = 'journal';
  journal.textContent = publication.journal;

  const doiLink = document.createElement('a');
  doiLink.href = doiUrl;
  doiLink.target = '_blank';
  doiLink.rel = 'noopener noreferrer';
  doiLink.textContent = 'DOI ↗';

  item.append(title, authors, journal, doiLink);
  list.prepend(item); // 新しい2026年の共著論文を先頭に表示

  // 既存の「主著12件・共著18件」の共著数だけ最新の値に更新。
  const summary = document.querySelector('#publications .lead');
  if (summary) {
    const coauthoredCount = document.querySelectorAll('#co-author ol.papers li').length;
    summary.textContent = summary.textContent.replace(/共著\d+件/, `共著${coauthoredCount}件`);
  }
})();

// ── 主著論文（2027年）の追加 ─────────────────────────────────
// 2026-10-30 追加：Sn添加NaI透明セラミックスの論文（2027年掲載予定）。
// DOIや巻・ページが確定したら、下記 publication の journal を更新してください。
// 既存の論文・学会発表・GA4設定には手を加えません。
(function addSnNaI2027Publication() {
  const publication = {
    year: '2027',
    title: 'Optical and Scintillation Properties of Sn-doped NaI Transparent Ceramics',
    authors: 'S. Otake,* T. Kato, D. Nakauchi, N. Kawaguchi, T. Yanagida',
    journal: 'Sensors and Materials, xx (2027) xx',
    // DOI取得後に次行を有効化すると、DOIリンクも自動表示されます。
    // doi: '10.xxxx/xxxx'
  };

  const firstAuthor = document.querySelector('#first-author');
  if (!firstAuthor) return;

  // 年別見出しと論文リストは既存のHTMLと同じタグ・クラスを使います。
  let yearHeading = [...firstAuthor.querySelectorAll('h4.year')]
    .find(heading => heading.textContent.trim() === publication.year);
  let yearList;
  if (yearHeading) {
    const next = yearHeading.nextElementSibling;
    if (next?.matches('ol.papers')) {
      yearList = next;
    } else {
      yearList = document.createElement('ol');
      yearList.className = 'papers';
      yearHeading.after(yearList);
    }
  } else {
    const sectionHeading = firstAuthor.querySelector('h3');
    if (!sectionHeading) return;
    yearHeading = document.createElement('h4');
    yearHeading.className = 'year';
    yearHeading.textContent = publication.year;
    yearList = document.createElement('ol');
    yearList.className = 'papers';
    // 2027年を2026年の上に配置します。
    sectionHeading.after(yearHeading, yearList);
  }

  // index.htmlに同じ論文を手動追加した場合、重複表示を避けます。
  const normalize = str => str.replace(/\s+/g, ' ').trim().toLowerCase();
  const alreadyListed = [...firstAuthor.querySelectorAll('.paper-title')]
    .some(title => normalize(title.textContent) === normalize(publication.title));

  if (!alreadyListed) {
    const item = document.createElement('li');
    for (const [className, content] of [
      ['paper-title', publication.title],
      ['authors', publication.authors],
      ['journal', publication.journal]
    ]) {
      const element = document.createElement('div');
      element.className = className;
      element.textContent = content;
      item.append(element);
    }
    // DOIが未発行の間はリンクを表示しません。
    if (publication.doi) {
      const link = document.createElement('a');
      link.href = `https://doi.org/${publication.doi}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'DOI ↗';
      item.append(link);
    }
    yearList.prepend(item);
  }

  // 件数は実際の論文リストから計算し、概要・ナビゲーションを更新します。
  const count = firstAuthor.querySelectorAll('ol.papers > li').length;
  const summary = document.querySelector('#publications .lead');
  if (summary) {
    summary.textContent = summary.textContent.replace(/主著\s*\d+\s*件/, `主著${count}件`);
  }
  const firstAuthorLink = document.querySelector('#publications .subnav a[href="#first-author"]');
  if (firstAuthorLink) {
    firstAuthorLink.textContent = firstAuthorLink.textContent.replace(/\d+/, String(count));
  }
})();
