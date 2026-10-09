# 個人HP更新ファイル（2026-10-09）

このZIPは、公開中のリポジトリ `Shota-weba/HP` の**既存デザインとページ内容を維持**しつつ、写真・学会発表・受賞の情報を追加する更新用ファイルです。

## 適用方法

1. ZIPを解凍します。
2. GitHubリポジトリ `https://github.com/Shota-weba/HP` の `main` ブランチに、次のファイルを**フォルダ構造ごと**アップロードします。
3. GitHub上で `Commit changes` を実行します。GitHub Pagesの反映を待ってブラウザで確認してください。キャッシュが残る場合は強制再読み込みしてください。

```text
HP/                                ← GitHubリポジトリのルート
├── index.html                     ← 既存のものをそのまま使用
├── style.css                      ← 既存のものをそのまま使用
├── script.js                      ← ZIP内のものに上書き
├── enhancements.css               ← 新規追加
├── site-data.json                 ← 新規追加
└── images/
    ├── slide-1.jpg                ← 既存のものをそのまま使用
    ├── slide-2.jpg                ← 既存のものをそのまま使用
    ├── slide-3.jpg                ← 既存のものをそのまま使用
    └── profile-otake.jpg          ← 新規追加
```

**重要:** ZIPには `index.html`、`style.css`、既存のスライド写真は含めていません。それらを削除・置換せず、既存のファイルを維持してください。`script.js` が `enhancements.css` と `site-data.json` を読み込むため、`index.html` の編集は不要です。

## 追加・変更内容

- 自己紹介に本人（右側の人物）のバストアップ写真を配置。写真内の左側の人物・花束はトリミング範囲外です。
- 学会発表の題目に加え、著者・正式会議名・開催日・開催地を表示。
- 主著：国際学会 **6件**、国内学会 **29件**。
- 共著：国際学会 **10件**、国内学会 **69件**。旧HPの2025年以前の共著記録も追加。
- 受賞 **8件**：賞名・受賞対象の発表題目・著者・会議名・開催日・開催地を表示。
- 長くなる国内発表と国内共著発表は、開閉できる一覧で表示。
- 既存のニュース、自己紹介本文、論文、研究助成、連絡先、配色、サイドバー、3枚のスライド写真は変更しません。

## 今後の編集方法

- **学会発表の追加:** `site-data.json` → `presentations` 配下の該当配列に1件追加。各レコードの `event` は `events` のキーを参照します。
- **会議日程・正式名称の修正:** `site-data.json` → `events` の `name` / `date` / `location` を変更。各発表の表示に自動反映されます。
- **受賞の追加:** `site-data.json` → `awards` に `{ "name", "event", "authors", "title" }` を追加。
- **写真変更:** `images/profile-otake.jpg` を差し替え。
- **写真サイズ、余白、文字の配置:** `enhancements.css` を編集。
- **動作変更:** `script.js` を編集。

`site-data.json` のテキストはUTF-8。カンマや引用符などJSONの構文を維持してください。ファイル名は大文字・小文字を含めて一致させてください。

## 資料と照合時の注意

発表タイトルと著者は旧HP（https://sites.google.com/view/sotake）を主な出典として転記しています。主要国際会議の正式名称・会期は次の主催者資料で照合しました。

- ICOOPMA 2026: https://wwp.shizuoka.ac.jp/icoopma2026/
- ICL 2026: https://icl2026.com/
- Pacifichem 2025: https://pacifichem.org/
- ISBE 2024: https://www.rie.shizuoka.ac.jp/~conference/isbe2024/index.html
- IDW '24: https://www.idw.or.jp/24record.html
- ICAPMA-ICREM 2025: https://matscitech-thailand.com/icapma-icrem2025
- 量子エネルギー変換研究会: https://annex.jsap.or.jp/radiation-luminescence/

**旧HPの不整合を補正:** 「ICAPMA 2025」共著発表の旧HPでは「2025年」の下に「2026年9月16–21日」と混在していました。主催者側の案内に基づき **2025年12月10–13日・Pattaya** に統一しています。

**要最終確認:** 個々の発表の著者順序・題目、2026年ICOOPMAのStudent Poster Award対象の正確な発表題目については旧HPに依拠しています。会議のプログラム原本・受賞証明書を使った全件の個別照合は実施していません。年度と会場を含めて、ご自身の発表原稿・学会プログラムと最終照合してください。

## 簡易テスト

JavaScriptの構文検査とJSONの妥当性検査、件数とイベント参照のチェック済みです。実際のGitHub Pages環境の表示動作は、アップロード後にPCとスマートフォンの両方でご確認ください。

ローカル閲覧する場合、JSON取得が必要なためHTMLをダブルクリックするのではなく、リポジトリ内で以下を実行します。

```bash
python3 -m http.server 8000
```

その後、ブラウザで `http://localhost:8000/HP/` （リポジトリの作業ディレクトリが `HP` の親の場合）または `http://localhost:8000/` （`HP` ディレクトリ内でコマンドを実行した場合）にアクセスします。
