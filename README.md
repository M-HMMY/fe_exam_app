# 基本情報技術者試験 学習アプリ

教本（体系的な読み物）を軸に、科目A・科目Bの演習、間隔反復による復習、模試、成績分析までを 1 つにまとめたローカル Web アプリです。学習記録はブラウザの localStorage にのみ保存され、外部には送信されません。

## 起動

デスクトップの **「FE 学習アプリ」** ショートカットをダブルクリックすると、必要なら自動でビルドし直したうえでローカルサーバを起動し、ブラウザで開きます。表示される黒いウィンドウを閉じるとアプリが停止します。

ショートカットの実体は [scripts/launch.ps1](scripts/launch.ps1) です。作り直したい場合は次を実行します。

```powershell
$ws = New-Object -ComObject WScript.Shell
$lnk = $ws.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Desktop')) 'FE 学習アプリ.lnk'))
$lnk.TargetPath = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$lnk.Arguments = '-ExecutionPolicy Bypass -NoProfile -File "C:\Dev\fe_exam_app\scripts\launch.ps1"'
$lnk.WorkingDirectory = 'C:\Dev\fe_exam_app'
$lnk.IconLocation = 'C:\Dev\fe_exam_app\scripts\app.ico,0'
$lnk.Save()
```

コマンドから起動する場合は次のとおりです。

```
npm install     # 初回のみ
npm run dev     # http://localhost:5173 が開く（開発用・自動リロードあり）
npm run preview # http://localhost:4173 でビルド済みのものを配信
```

同じ Wi-Fi 上のスマートフォンからも、ターミナルに表示される `Network:` の URL で開けます。

本番ビルドは `npm run build`（出力は `dist/`）、その確認は `npm run preview` です。`dist/` は静的ファイルなので、GitHub Pages などにそのまま置けます。

## 画面

## iPhone / Android で使う

このアプリは PWA なので、ホーム画面に追加するとアドレスバーのないアプリとして起動し、一度開いたページはオフラインでも読めます。

**iPhone（Safari で開くこと。Chrome では追加できません）**

1. 公開 URL を Safari で開く
2. 画面下部の共有ボタン（□に↑）をタップ
3. メニューを下にたどって「ホーム画面に追加」
4. 右上の「追加」

**Android** … Chrome のメニューから「アプリをインストール」または「ホーム画面に追加」。

オフライン保存（Service Worker）は **HTTPS でのみ有効**です。同じ Wi-Fi 内で `http://192.168.x.x:5173` を開く方法でも閲覧はできますが、オフライン保存は効かず、PC 側でサーバを動かしておく必要があります。

学習記録は端末ごとに保存され、PC とスマートフォンでは共有されません。設定画面のエクスポート／インポートで移せます。

## GitHub Pages へ公開する

`.github/workflows/deploy.yml` を用意してあります。`main` ブランチへ push するたびに自動でビルドして公開されます。

初回だけ次の手順が必要です。

```powershell
git init
git add -A
git commit -m "基本情報技術者試験 学習アプリ"
git branch -M main
git remote add origin https://github.com/<ユーザ名>/<リポジトリ名>.git
git push -u origin main
```

その後、GitHub のリポジトリで **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に変更します。数分後に `https://<ユーザ名>.github.io/<リポジトリ名>/` で公開されます。

`vite.config.ts` の `base` は `'./'`（相対パス）なので、リポジトリ名がどうであってもサブディレクトリ配信で正しく動きます。

## 収録量

| 区分 | 収録数 |
|---|---|
| 教本セクション | 64 節（本文 約 18.8 万字／目安 約 25.5 時間） |
| 図解 | 193 個（本文に埋め込み） |
| 対話ウィジェット | 15 種類 |
| 科目A の問題 | 224 問 |
| 科目B の問題 | 45 問（設問 90 問） |

| 画面 | 内容 |
|---|---|
| ホーム | 読了率・復習期限・直近の正答率・弱点分野・7 日間の復習予定 |
| 教本 | シラバス順の全 64 セクション。全文検索・読了チェック・栞（前回の続き）つき |
| 体験ツール | 15 個の対話ウィジェットを分野別に一覧・操作できる |
| 科目A 演習 | 四肢択一。分野別／出題数指定／誤答優先。1 問ごとに解説と教本への導線 |
| 科目B 演習 | 擬似言語の読解問題と情報セキュリティの事例問題。行番号つきでプログラムを表示 |
| 復習 | 期限が来た問題だけを出題。手応え（もう一度／難しい／普通／簡単）で次回間隔が決まる |
| 模試 | 時間制限つきの通し演習。科目A 60 問 90 分／科目B 20 問 100 分ほか |
| 成績分析 | 分野別正答率、学習履歴、模試履歴、間違えやすい問題 |
| 設定 | 学習記録のエクスポート／インポート／全消去 |

## キーボード操作

| 画面 | キー |
|---|---|
| 科目A 演習・復習 | `1`〜`4` で選択、`Enter` で解答／次の問題へ |
| 復習（解答後） | `1`〜`4` が手応え（もう一度／難しい／普通／簡単）に対応 |
| 模試 | `1`〜`4` で選択、`←` `→` で問題を移動 |
| 教本 | `←` `→` で前後の節へ |

入力欄にフォーカスがあるときと、修飾キーを伴うときは動作しません（[src/lib/useKeys.ts](src/lib/useKeys.ts)）。

## 復習（SRS）の仕組み

SM-2 を簡略化した方式です（`src/lib/srs.ts`）。

- 正解：1 回目は 1 日後、2 回目は 3 日後、以降は難易度係数（初期値 2.5）を掛けて間隔を伸ばす
- 誤答：間隔をリセットし、10 分後に再出題。難易度係数を下げる
- 上限は 180 日

演習・模試で解いた問題は自動的に復習キューへ登録されます。

## コンテンツの追加

### 教本のセクション

`src/data/textbook/` に分野ごとのファイルがあります。既存の配列に `TextbookSection` を追加し、`index.ts` の `SECTIONS` に含まれていることを確認してください。本文は Markdown のサブセット（見出し・箇条書き・表・コードブロック・引用・`**強調**`・`` `コード` ``）が使えます。引用（`> `）は「試験のポイント」枠として表示されます。

### 本文に図を入れる

Markdown 中のコードフェンスで書きます。SVG ではなく HTML で描画するため、狭い画面では自動的に折り返り、ダークモードにも追従します。

````
```diagram:flow
title: 命令の実行手順
命令の取出し :: PC が指すアドレスから読む
命令の解読 :: 命令デコーダが判定
実行 :: ALU が演算
note: 図の下に出る補足
```
````

| 種類 | 用途 | 書き方 |
|---|---|---|
| `flow` | 工程・手順の流れ | 各行が箱。`ラベル :: 補足` |
| `stack` | 階層（OSI、記憶階層、ポリシ体系） | 上の行ほど幅が広い。`top:` `bottom:` で軸の説明 |
| `tree` | 木構造・WBS・分類 | 行頭 2 スペースで 1 段ネスト |
| `matrix` | 2×2（PPM、SWOT、リスク対応） | `x:` `y:` に軸ラベル、要素は左上→右上→左下→右下 |
| `cycle` | 繰り返し（PDCA、スプリント） | 各行が 1 ステップ |
| `seq` | やり取りの順序（3 ウェイハンドシェイク等） | `actors: A \| B` と `A -> B :: 内容` |
| `bits` | ビット列 | 1 行目にビット（`\|` でグループ区切り）、2 行目にラベル |
| `compare` | 左右の対比 | `actors: 左 \| 右`、以降の行が左右交互 |

実装は [src/components/Diagram.tsx](src/components/Diagram.tsx)、記法の解釈は [src/lib/markdown.tsx](src/lib/markdown.tsx) にあります。

### 対話ウィジェットを追加する

`src/components/widgets/` に 1 ファイル置くだけで自動登録されます（`import.meta.glob` による検出。一覧ファイルの更新は不要）。

```tsx
export const widgetId = 'radix';
export default function RadixConverter(): JSX.Element { /* … */ }
```

本文からは ` ```widget:radix ` で呼び出します。既存のスタイルクラス（`widget-*` / `viz-*` / `chart`）を使えば見た目が揃います。見本は [RadixConverter.tsx](src/components/widgets/RadixConverter.tsx) です。

現在の 15 種類：基数変換・2 の補数・シフト演算・論理演算・CPI/MIPS・キャッシュ実効アクセス時間・整列・探索・スタックとキュー・2 分探索木・サブネット計算・ページ置換・稼働率・待ち行列・損益分岐点。

### 科目Aの問題

`src/data/questions/a-tech1.ts` などに `QuestionA` を追加します。

```ts
{
  id: 'a-nw-07',              // 一意な ID。学習記録のキーになるので後から変えない
  categoryId: 't-nw',         // src/data/categories.ts の Category.id
  sectionId: 't-nw-2',        // 対応する教本セクション（解説からの導線と確認問題に使う）
  level: 2,                   // 1〜3
  question: '……はどれか。',
  choices: ['ア の内容', 'イ の内容', 'ウ の内容', 'エ の内容'],
  answer: 1,                  // 0=ア, 1=イ, 2=ウ, 3=エ
  explanation: '……',
}
```

### 科目Bの問題

`src/data/questions/subjectB.ts` に `QuestionB` を追加します。`code` に擬似言語を書くと行番号つきで表示されます。1 つの問題に複数の設問（`subQuestions`）をぶら下げられます。

## 構成

```
src/
  data/
    categories.ts       試験分野の定義
    textbook/           教本本文（分野ごとに 1 ファイル）
    questions/          科目A・科目Bの問題
  lib/
    markdown.tsx        教本用の軽量 Markdown レンダラ
    srs.ts              間隔反復のアルゴリズム
    stats.ts            正答率・学習履歴の集計
    storage.ts          localStorage への保存と入出力
    router.ts           ハッシュベースの簡易ルータ
  components/           問題カード・選択肢
  pages/                各画面
  store.ts              アプリ状態（useSyncExternalStore）
```

## 注意

収録している問題はすべてオリジナルの練習問題で、IPA が公開している過去問そのものではありません。出題形式と頻出テーマに沿って作成しています。実際の出題範囲は IPA のシラバスを確認してください。
