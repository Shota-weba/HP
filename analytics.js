/*
 * Google Analytics 4 (GA4) のアクセス解析設定
 *
 * 設定手順
 * 1. https://analytics.google.com/ でHPのウェブデータストリームを作成
 * 2. 測定IDは設定済みです（変更時はGA4_MEASUREMENT_IDを編集）
 * 3. この analytics.js を GitHub の HP リポジトリへアップロードする
 *
 * 訪問者数・閲覧数・国/地域/都市は、Google Analyticsの管理画面で確認。
 * 測定IDが未設定の間は解析コードを読み込まないため、サイトの表示は維持されます。
 */

// 測定ID（2026-10-09にユーザーが提示した設定画面で確認）
const GA4_MEASUREMENT_ID = 'G-SF4GDJMLK7';

// ID未設定時は何も送信しない。実在するIDだけを設定してください。
if (/^G-[A-Z0-9]+$/.test(GA4_MEASUREMENT_ID)) {
  // Google公式のgtag.js初期化と同じイベントキューを準備する。
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID);

  // 測定ID設定後だけGoogleの計測用スクリプトを読み込む。
  const googleTag = document.createElement('script');
  googleTag.async = true;
  googleTag.src =
    'https://www.googletagmanager.com/gtag/js?id=' +
    encodeURIComponent(GA4_MEASUREMENT_ID);
  document.head.append(googleTag);
} else {
  console.info('Google Analytics: 測定IDが未設定のためアクセス解析は無効です。');
}
