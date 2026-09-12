/**
 * データの整合性チェック。`npm run check` で実行する。
 *
 * 教本・問題・ドリルは手で書き足していくため、型では防げない食い違いが必ず混ざる。
 * ここで機械的に潰しておくと、あとから「なぜか画面に出ない」を探さずに済む。
 * 新しい不整合の型を見つけたら、直すついでにこのファイルへ検査を足すこと。
 *
 * 姉妹アプリ（`C:\Dev\genai_passport_exam_app` ほか）の check.ts から移植したが、
 * **そのままでは合わない。**このアプリに合わせて次を変えてある。
 *
 *   1. **数式の検査を入れていない。** このアプリの Markdown は `$...$` を数式に
 *      しない。本文の `$` は正規表現の行末記号などの literal なので、
 *      数式扱いで警告すると誤検出になる
 *   2. **科目A と科目B を分けて見る。** 科目B は 1 問に複数の設問がぶら下がり、
 *      選択肢の数も 4〜10 と一定でない
 *   3. **`source` 付き（IPA 公開問題）は文章の作りを検査しない。** 出典のある
 *      問題は原文どおりに収録するもので、長さも正解の位置も直せない。
 *      直せないものを警告しても、警告そのものが読み飛ばされるだけになる
 *   4. **compare の「全要素に ::」検査は入れていない。** 移植元では意味のある検査
 *      だったが、こちらは全セルに補足を添えるのが常用の書き方で、51 件すべてが
 *      誤検出だった（詳しくは「図の中の書式」の項）
 *   5. **一問一答の基準は 3 問。** 移植元は 5 問以上だが、あちらは 1 問 60 秒の
 *      試験。こちらは 90 秒なので、このアプリの実態に合わせてある
 *   6. **入門編（categoryId: 'intro'）は節の骨格を検査しない。** 試験の受け方の
 *      説明であって、学習の節ではない
 *   7. **同じ型の注意はまとめて出す。** 科目A だけで 780 問あるため、1 件 1 行で
 *      出すと 100 行を超えて全部読み飛ばされる（warnGroup）
 *
 * **移植するときは、必ず一度走らせて誤検出の数を見ること。**上の 4・5 は、
 * 走らせるまで「移植元と同じでよい」と思っていたものです。
 */
import { CATEGORIES } from '../src/data/categories';
import { SECTIONS } from '../src/data/textbook';
import { QUESTIONS_A, QUESTIONS_B } from '../src/data/questions';
import { DRILLS } from '../src/data/drills';
import { renderCheck, WIDGET_IDS } from './render-check';

const LF = String.fromCharCode(10);
/** コードフェンス。バックティックを直接書くとテンプレートリテラルと紛れるので組み立てる */
const FENCE3 = String.fromCharCode(96).repeat(3);

const errors: string[] = [];
const warnings: string[] = [];

const err = (m: string): void => {
  errors.push(m);
};
const warn = (m: string): void => {
  warnings.push(m);
};

/**
 * 同じ型の注意が何十件も並ぶと、全部まとめて読み飛ばされる。
 * このアプリは科目A だけで 780 問あり、文章の作りに関する注意は桁が増えるので、
 * 件数と「いちばんひどいもの」だけを出して、残りは数で示す。
 */
function warnGroup(label: string, items: string[], show = 10): void {
  if (items.length === 0) return;
  if (items.length <= show) {
    items.forEach(warn);
    return;
  }
  warn(`${label}（${items.length} 件。ひどい順に ${show} 件だけ表示）`);
  items.slice(0, show).forEach((m) => warn('    ' + m));
}

/** 重複した ID を探す */
function dupes(label: string, ids: string[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) err(`${label}: ID が重複している → ${id}`);
    seen.add(id);
  }
}

const categoryIds = new Set(CATEGORIES.map((c) => c.id));
const sectionIds = new Set(SECTIONS.map((s) => s.id));

/** 自作問題。出典のあるものは原文どおりなので、文章の作りは検査しない */
const OWN_A = QUESTIONS_A.filter((q) => q.source === undefined);

// ---- ID の重複 ----
dupes('分野', CATEGORIES.map((c) => c.id));
dupes('教本セクション', SECTIONS.map((s) => s.id));
dupes('科目A', QUESTIONS_A.map((q) => q.id));
dupes('科目B', QUESTIONS_B.map((q) => q.id));
dupes('ドリル', DRILLS.map((d) => d.id));

// ---- 参照先の存在 ----
for (const s of SECTIONS) {
  if (!categoryIds.has(s.categoryId)) err(`教本 ${s.id}: 存在しない分野 ${s.categoryId}`);
}
for (const q of QUESTIONS_A) {
  if (!categoryIds.has(q.categoryId)) err(`科目A ${q.id}: 存在しない分野 ${q.categoryId}`);
  if (q.sectionId === undefined) warn(`科目A ${q.id}: sectionId が未設定（教本への復習導線が出ない）`);
  else if (!sectionIds.has(q.sectionId)) err(`科目A ${q.id}: 存在しない節 ${q.sectionId}`);
}
for (const q of QUESTIONS_B) {
  if (q.sectionId !== undefined && !sectionIds.has(q.sectionId)) {
    err(`科目B ${q.id}: 存在しない節 ${q.sectionId}`);
  }
}
for (const d of DRILLS) {
  if (!categoryIds.has(d.categoryId)) err(`ドリル ${d.id}: 存在しない分野 ${d.categoryId}`);
  if (!sectionIds.has(d.sectionId)) err(`ドリル ${d.id}: 存在しない節 ${d.sectionId}`);
}

// ---- 問題の形 ----
for (const q of QUESTIONS_A) {
  if (q.choices.length !== 4) err(`科目A ${q.id}: 選択肢が ${q.choices.length} 個（4 個であること）`);
  if (q.answer < 0 || q.answer > 3) err(`科目A ${q.id}: answer が範囲外 ${q.answer}`);
  if (new Set(q.choices).size !== q.choices.length) err(`科目A ${q.id}: 選択肢に重複がある`);
  if (q.explanation.trim() === '') err(`科目A ${q.id}: 解説が空`);
  if (q.question.trim() === '') err(`科目A ${q.id}: 問題文が空`);
}

// 科目B は「1 つの問題文に設問がぶら下がる」形なので、設問ごとに見る。
// 選択肢の数は 4〜10 とばらつくため、個数そのものは検査しない。
for (const q of QUESTIONS_B) {
  if (q.subQuestions.length === 0) {
    err(`科目B ${q.id}: 設問が 1 つもない`);
    continue;
  }
  if (q.title.trim() === '') err(`科目B ${q.id}: title が空`);
  if (q.description.trim() === '') err(`科目B ${q.id}: 問題文が空`);
  q.subQuestions.forEach((sq, i) => {
    const at = `科目B ${q.id} 設問${i + 1}`;
    if (sq.choices.length < 2) err(`${at}: 選択肢が ${sq.choices.length} 個しかない`);
    if (sq.answer < 0 || sq.answer >= sq.choices.length) {
      err(`${at}: answer が範囲外 ${sq.answer}（選択肢 ${sq.choices.length} 個）`);
    }
    if (new Set(sq.choices).size !== sq.choices.length) err(`${at}: 選択肢に重複がある`);
    if (sq.explanation.trim() === '') err(`${at}: 解説が空`);
  });
  // 設問が 2 つ以上あるのに prompt が空だと、画面でどれがどの設問か分からなくなる。
  // 単一設問のときだけ prompt を空にしてよい、という約束になっている。
  if (q.subQuestions.length > 1) {
    q.subQuestions.forEach((sq, i) => {
      if (sq.prompt.trim() === '') err(`科目B ${q.id} 設問${i + 1}: 設問が複数あるのに prompt が空`);
    });
  }
}

// ---- 問題が「解かなくても当てられる」形になっていないか ----
{
  const sameText = new Map<string, string[]>();
  for (const q of QUESTIONS_A) {
    const key = q.question.replace(/\s+/g, '');
    sameText.set(key, [...(sameText.get(key) ?? []), q.id]);
  }
  for (const ids of sameText.values()) {
    if (ids.length > 1) err(`問題文がまったく同じ: ${ids.join(' / ')}`);
  }

  // 完全一致だけでは、数字も選択肢も同じで語だけ言い換えた重複を見逃す。
  // 分野をまたいだ重複は 1 節ずつ見ている限り気づけないので、機械に数えさせる。
  // 問題文だけで測ると「〜として、適切なものはどれか」という定型が効いて
  // 全部が似てしまうので、選択肢も混ぜて測る。
  //
  // 出典のある問題どうしは対象外。IPA は年度をまたいで同じ論点を繰り返し出すが、
  // それは原文どおり収録すべきもので、こちらでは直せない。
  {
    const grams = (q: (typeof QUESTIONS_A)[number]): Set<string> => {
      const t = (q.question + [...q.choices].sort().join('')).replace(
        /[\s。、，,．.「」『』（）()]/g,
        '',
      );
      const set = new Set<string>();
      for (let i = 0; i < t.length - 1; i += 1) set.add(t.slice(i, i + 2));
      return set;
    };
    const rows = QUESTIONS_A.map((q) => ({ q, g: grams(q) }));
    const found: string[] = [];
    for (let i = 0; i < rows.length; i += 1) {
      for (let j = i + 1; j < rows.length; j += 1) {
        const a = rows[i].g;
        const b = rows[j].g;
        if (rows[i].q.source !== undefined && rows[j].q.source !== undefined) continue;
        let hit = 0;
        a.forEach((g) => {
          if (b.has(g)) hit += 1;
        });
        const sim = (2 * hit) / (a.size + b.size);
        // 同じ節の中で似るのは、対比のために対で作った問題（直列と並列、
        // 暗号化と署名）なので正常。節をまたいで似ているものが、気づかずに書いた重複。
        const sameSection =
          rows[i].q.sectionId !== undefined && rows[i].q.sectionId === rows[j].q.sectionId;
        if (sim >= 0.6 && !sameSection) {
          found.push(
            `${rows[i].q.id} と ${rows[j].q.id} が別の節でほぼ同じ内容（類似度 ${sim.toFixed(2)}）`,
          );
        }
      }
    }
    warnGroup('別の節にほぼ同じ問題がある。片方の数値か観点を変える', found);
  }

  // --- ここから下は自作問題だけ。出典のある問題は原文どおりで直せない ---
  const pos = [0, 0, 0, 0];
  let absoluteInCorrect = 0;
  let absoluteInWrong = 0;
  const absolute = /必ず|すべて|常に|まったく|一切|絶対|例外なく|いかなる場合|どのような場合|一律/;
  const tooLong: { msg: string; gap: number }[] = [];
  const skewed: string[] = [];

  for (const q of OWN_A) {
    pos[q.answer] += 1;
    const lens = q.choices.map((c) => c.length);
    q.choices.forEach((c, i) => {
      if (!absolute.test(c)) return;
      if (i === q.answer) absoluteInCorrect += 1;
      else absoluteInWrong += 1;
    });

    // 正解だけが長いと、読まずに「長いものを選ぶ」で当てられてしまう。
    // ただし 1〜2 文字の差まで数えると実態より大きく出るので、差の大きさで見る。
    // 短い選択肢どうしでは比が暴れる（「13 字 / 5 字」で 2.6 倍）ので、
    // 正解がある程度の長さを持つ場合だけ見る。
    const other = Math.max(...lens.filter((_, i) => i !== q.answer));
    if (lens[q.answer] >= 24 && lens[q.answer] >= other * 1.5 && lens[q.answer] - other >= 8) {
      tooLong.push({
        msg: `科目A ${q.id}: 正解 ${lens[q.answer]} 字 / 最長の誤答 ${other} 字`,
        gap: lens[q.answer] / other,
      });
    }

    // 誤答 3 つすべてに言い切りがあり、正解にだけ無いと、
    // 内容を知らなくても「言い切っているものを外す」だけで当てられる。
    // 全体の集計（下の absoluteInWrong）は 1 問ごとの偏りを拾えない。
    if (
      q.choices.every((c, i) => i === q.answer || absolute.test(c)) &&
      !absolute.test(q.choices[q.answer])
    ) {
      skewed.push(`科目A ${q.id}: 誤答 3 つすべてに言い切りがあり、正解にはない`);
    }
  }

  tooLong.sort((a, b) => b.gap - a.gap);
  warnGroup('正解だけが突出して長い。誤答も同じ密度で書くこと', tooLong.map((t) => t.msg));
  warnGroup('言い切りを外すだけで選べてしまう。誤答側からも言い切りを減らすこと', skewed);

  const n = OWN_A.length;
  if (n >= 40) {
    pos.forEach((c, i) => {
      const rate = c / n;
      if (rate < 0.15 || rate > 0.35) {
        warn(
          `正解の位置が ${'アイウエ'[i]} に偏っている（自作 ${c} / ${n} 問 = ${Math.round(rate * 100)}%）。` +
            '選択肢を並べ替えて散らすこと。ただし数値や順序が選択肢になっている問題は並べ替えない',
        );
      }
    });
    if (absoluteInWrong >= 10 && absoluteInCorrect === 0) {
      warn(
        `「必ず」「すべて」などの言い切りが誤答だけに ${absoluteInWrong} 個ある。` +
          'それ自体が手掛かりになるので、正しく言い切れる場面では正解側にも使うこと',
      );
    }
  }
}

// ---- 問題文が本番で読み切れる長さか ----
// 科目A は 60 問 / 90 分で 1 問あたり 90 秒。姉妹アプリ（60 秒）より余裕があり、
// 計算問題も出るので、閾値は緩めにとってある。ここで見たいのは平均ではなく外れ値。
// 出典のある問題は原文どおりなので対象外（実際に 300 字を超えるものがある）。
for (const q of OWN_A) {
  const len = q.question.replace(/\s/g, '').length;
  if (len > 260) err(`科目A ${q.id}: 問題文が ${len} 字（科目A は 1 問 90 秒。切り詰める）`);
  else if (len > 180) warn(`科目A ${q.id}: 問題文が ${len} 字とやや長い`);
}

// ---- 図の題の「N つ」と、実際の数の食い違い ----
// 「2 つのアプローチ」と題した図に 3 分岐が描いてある、という食い違いが実際に出た。
// 読者は数を数えて覚えるので、そのまま誤記憶になる。数える対象は図の種類で変わる。
//   compare … 左右の見出し（actors）の数
//   tree    … 最上位の数、または 1 段下がった子の数
//   その他   … 要素の数
{
  // 算用数字だけを見ていると「三つの要件」と書いた図を素通りする。
  // 日本語の本文では漢数字のほうがむしろ普通なので両方見る。
  const KANJI: Record<string, number> = {
    一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
  };
  // 数え方に 3 つ条件を付けてある。付けないと、次のような題が誤検出になった。
  //   「2 つの集合が作る 4 つの領域」… 数えるべきは後ろの 4。題の中の数を全部見る
  //   「1 つの要求にかかる時間の内訳」… 「1 つの〜」は主語であって列挙ではない
  //   「QC 七つ道具を選ぶ」          … 「七つ道具」は固有名詞。「つ」の後ろが「の」でない
  const NUM = /([0-9０-９]+|[一二三四五六七八九十])\s*つ(?=の|$|[、。，）」])/g;
  const KEYS = new Set(['title', 'top', 'bottom', 'x', 'y', 'note', 'actors', 'caption']);
  const toNum = (t: string): number =>
    KANJI[t] ?? Number(t.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)));

  const found: string[] = [];
  for (const s of SECTIONS) {
    let type: string | null = null;
    let title: string | null = null;
    let actors = 0;
    let top = 0;
    let children = 0;

    const close = (): void => {
      if (type === null || title === null) {
        type = null;
        title = null;
        return;
      }
      NUM.lastIndex = 0;
      const wants: number[] = [];
      let m: RegExpExecArray | null;
      while ((m = NUM.exec(title)) !== null) {
        const n = toNum(m[1]);
        if (n >= 2) wants.push(n);   // 「1 つの〜」は列挙ではないので数えない
      }
      if (wants.length > 0) {
        const fits = (want: number): boolean =>
          type === 'compare'
            ? actors === 0 || want === actors
            : type === 'tree'
              ? want === top || want === children
              : top === 0 || want === top;
        // 題に複数の数が出るときは、どれか 1 つでも合っていればよい
        if (!wants.some(fits)) {
          const actual = type === 'compare' ? `左右の見出し ${actors} 個` : `要素 ${top} 個`;
          found.push(
            `教本 ${s.id}: 図の題「${title}」は ${wants.join(' / ')} つと言っているが、${actual}`,
          );
        }
      }
      type = null;
      title = null;
    };

    for (const raw of s.body.split(LF)) {
      const t = raw.trim();
      if (t.startsWith('```')) {
        if (type !== null) close();
        else if (t.startsWith('```diagram:')) {
          type = t.slice('```diagram:'.length);
          title = null;
          actors = 0;
          top = 0;
          children = 0;
        }
        continue;
      }
      if (type === null || t === '') continue;
      const d = /^([a-z]+):\s*(.*)$/.exec(t);
      if (d !== null && KEYS.has(d[1])) {
        if (d[1] === 'title') title = d[2];
        if (d[1] === 'actors') actors = d[2].split('|').filter((x) => x.trim() !== '').length;
        continue;
      }
      const indent = /^\s*/.exec(raw)![0].length;
      if (indent === 0) top += 1;
      else if (indent <= 2) children += 1;
    }
    close();
  }
  warnGroup('図の題の数と、実際の要素数が合っていない', found);
}

// ---- 別の文字体系の混入 ----
// 日本語の文章に、ハングルやキリル文字が 1 文字だけ紛れ込むことが実際に起きた
// （「データ」の「デ」がハングルに、「短い」がキリル文字に）。
// 見た目では気づきにくく、検索にも引っかからないので機械に数えさせる。
{
  // ギリシャ文字は対象外。λ 計算・Σ・θ記法のように、技術用語の一部として正当に使われる。
  const STRAY = /[가-힣ᄀ-ᇿЀ-ӿ]/;
  const scan = (label: string, text: string): void => {
    for (const line of text.split(LF)) {
      const m = STRAY.exec(line);
      if (m === null) continue;
      err(`${label}: 日本語以外の文字体系が混ざっている（${m[0]}）→ ${line.trim().slice(0, 50)}`);
    }
  };
  for (const s of SECTIONS) {
    scan(`教本 ${s.id}`, s.title);
    scan(`教本 ${s.id}`, s.goal);
    scan(`教本 ${s.id}`, s.body);
  }
  for (const q of QUESTIONS_A) {
    scan(`科目A ${q.id}`, q.question);
    scan(`科目A ${q.id}`, q.explanation);
    q.choices.forEach((c) => scan(`科目A ${q.id}`, c));
  }
  for (const q of QUESTIONS_B) {
    scan(`科目B ${q.id}`, q.description);
    q.subQuestions.forEach((sq) => {
      scan(`科目B ${q.id}`, sq.prompt);
      scan(`科目B ${q.id}`, sq.explanation);
      sq.choices.forEach((c) => scan(`科目B ${q.id}`, c));
    });
  }
}

// ---- 節の骨格 ----
// 「# この節のまとめ」「> **試験のポイント**」は digest.ts が直前チェックシートへ
// 機械的に抜き出す。書式を崩すと拾われないので、「そもそも在るか」をここで数える。
//
// 一問一答（```quiz）は、この教本では**全 64 節に 3 問ずつ**という基準で入っている。
// 姉妹アプリは「5 問以上」が目安だが、あちらは 1 問 60 秒の試験で一問一答が速度対策
// そのものだった。こちらは 90 秒なので、基準をこのアプリの実態（3 問）に合わせる。
{
  const noLead: string[] = [];
  const noRecap: string[] = [];
  const noPoint: string[] = [];
  const noQuiz: string[] = [];
  for (const s of SECTIONS) {
    // 入門編（categoryId: 'intro'）は試験の受け方の説明で、学習の節ではない。
    // 骨格をそろえる対象ではないので数えない。
    if (s.categoryId === 'intro') continue;
    if (!s.body.includes('# ざっくり言うと')) noLead.push(`教本 ${s.id}: 「# ざっくり言うと」がない`);
    if (!s.body.includes('# この節のまとめ')) {
      noRecap.push(`教本 ${s.id}: 「# この節のまとめ」がない（チェックシートに載らない）`);
    }
    if (!s.body.includes('> **試験のポイント**')) noPoint.push(`教本 ${s.id}: 「> **試験のポイント**」がない`);

    // quiz ブロックの中の `問い :: 答え` の行だけを数える。
    // 本文の表や図にも `::` は出るので、ブロックの外を数えると水増しになる。
    let quizzes = 0;
    let inQuiz = false;
    for (const raw of s.body.split(LF)) {
      const t = raw.trim();
      if (t.startsWith(FENCE3)) {
        inQuiz = t === FENCE3 + 'quiz';
        continue;
      }
      if (inQuiz && t.includes('::')) quizzes += 1;
    }
    if (quizzes === 0) noQuiz.push(`教本 ${s.id}: 一問一答（quiz ブロック）がない`);
    else if (quizzes < 3) noQuiz.push(`教本 ${s.id}: 一問一答が ${quizzes} 問（この教本の基準は 3 問）`);
  }
  warnGroup('「# ざっくり言うと」がない節', noLead);
  warnGroup('「# この節のまとめ」がない節（直前チェックシートに載らない）', noRecap);
  warnGroup('「> **試験のポイント**」がない節', noPoint);
  warnGroup('一問一答が足りない節', noQuiz);
}

// ---- ドリルは実際に生成して確かめる（乱数なので複数回試す） ----
for (const d of DRILLS) {
  for (let i = 0; i < 200; i++) {
    const item = d.generate();
    if (item.choices.length !== 4) {
      err(`ドリル ${d.id}: 選択肢が ${item.choices.length} 個になる場合がある`);
      break;
    }
    if (new Set(item.choices).size !== item.choices.length) {
      err(`ドリル ${d.id}: 選択肢が重複する場合がある → ${item.choices.join(' / ')}`);
      break;
    }
    if (item.answer < 0 || item.answer >= item.choices.length) {
      err(`ドリル ${d.id}: answer が範囲外になる場合がある`);
      break;
    }
  }
}

// ---- 本文の記法 ----
const KNOWN_DIAGRAMS = new Set(['flow', 'stack', 'tree', 'matrix', 'cycle', 'seq', 'bits', 'compare']);
/** 本文リンクで飛べるページ（ハッシュルータの第 1 要素）。App.tsx の分岐と合わせること */
const KNOWN_PAGES = new Set([
  'home',
  'textbook',
  'tools',
  'drill',
  'sheet',
  'practice-a',
  'practice-b',
  'review',
  'mock',
  'stats',
  'settings',
]);

const fence = new RegExp('^```(.*)$');

for (const s of SECTIONS) {
  let open: string | null = null;
  let quizBuf: string[] = [];

  for (const line of s.body.split(LF)) {
    const m = fence.exec(line.trim());
    if (m) {
      if (open === null) {
        open = m[1].trim();
        quizBuf = [];
        if (open.startsWith('diagram:')) {
          const t = open.slice('diagram:'.length);
          if (!KNOWN_DIAGRAMS.has(t)) err(`教本 ${s.id}: 未知の図の種類 ${t}`);
        }
        if (open.startsWith('widget:')) {
          const w = open.slice('widget:'.length);
          // ファイル名ではなく、各ウィジェットが export する widgetId と照合する
          // （AvailabilityCalc.tsx の id は 'availability' で、一致していない）
          if (!WIDGET_IDS.has(w)) err(`教本 ${s.id}: 未登録のウィジェット ${w}`);
        }
      } else {
        if (open === 'quiz') {
          if (quizBuf.length === 0) err(`教本 ${s.id}: 空の quiz ブロック`);
          for (const q of quizBuf) {
            if (!q.includes('::')) err(`教本 ${s.id}: quiz の行に :: がない → ${q.slice(0, 30)}`);
          }
        }
        open = null;
      }
      continue;
    }
    if (open === 'quiz' && line.trim() !== '') quizBuf.push(line.trim());
  }
  if (open !== null) err(`教本 ${s.id}: 閉じていないコードフェンス（${open || '言語指定なし'}）`);
}

// ---- 図の中の書式 ----
// 図は Markdown を通らないので、`**強調**` を書くとアスタリスクがそのまま出る。
// compare は「1 行 1 セル、偶数行が左・奇数行が右」なので、要素が奇数だと対にならない。
{
  const DIRECTIVE_KEYS = new Set(['title', 'top', 'bottom', 'x', 'y', 'note', 'actors', 'caption']);
  for (const s of SECTIONS) {
    let type: string | null = null;
    let items = 0;
    let noted = 0;
    for (const raw of s.body.split(LF)) {
      const t = raw.trim();
      if (t.startsWith('```')) {
        if (type !== null) {
          if (type === 'compare' && items % 2 === 1) {
            err(`教本 ${s.id}: compare の要素が奇数個なので左右が対にならない（1 行 1 セルで書く）`);
          }
          // 姉妹アプリには「compare の全要素に :: が付いていたら、左右の区切りと
          // 取り違えた疑い」という検査があるが、**このアプリには入れていない。**
          // こちらは全セルに補足を添えるのが常用の書き方で、試したところ 51 件すべてが
          // 誤検出だった。当たらない検査を残すと、警告そのものが読み飛ばされる。
          type = null;
        } else if (t.startsWith('```diagram:')) {
          type = t.slice('```diagram:'.length);
          items = 0;
          noted = 0;
        }
        continue;
      }
      if (type === null || t === '') continue;
      const m = /^([a-z]+):/.exec(t);
      if (m && DIRECTIVE_KEYS.has(m[1])) continue;
      items++;
      if (t.includes('::')) noted++;
      if (t.includes('**')) err(`教本 ${s.id}: 図の中の ** は強調にならずそのまま出る → ${t.slice(0, 40)}`);
      // seq は `A -> B :: 内容` の形。矢印がないと Diagram.tsx がラベル側を本文として
      // 出し、`::` の右（補足）は画面に出ない。つまり書いた内容が黙って消える。
      // 描画自体は成立するので描画検査を素通りする。
      if (type === 'seq' && t.includes('::') && !/->|<-/.test(t.split('::')[0])) {
        err(`教本 ${s.id}: seq の行に矢印（-> か <-）がないので :: の右が表示されない → ${t.slice(0, 40)}`);
      }
    }
  }
}

// ---- 本文リンクの飛び先 ----
// 飛び先が実在するかだけでは、**別の節を指してしまった**誤りを捕まえられない。
// そこで、ラベルが他の節のタイトルと一致しているのに別の節を指している場合を警告する。
{
  const titleToId = new Map(SECTIONS.map((s) => [s.title, s.id]));
  const linkRe = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  const mismatched: string[] = [];
  for (const s of SECTIONS) {
    let m: RegExpExecArray | null;
    linkRe.lastIndex = 0;
    while ((m = linkRe.exec(s.body)) !== null) {
      const label = m[1].replace(/\*\*/g, '').trim();
      const to = m[2];
      // 外部リンクは対象外
      if (/^https?:/.test(to)) continue;
      const [pathPart] = to.split('?');
      const [page, param] = pathPart.split('/');
      if (!KNOWN_PAGES.has(page)) {
        err(`教本 ${s.id}: 存在しないページへのリンク ${to}`);
        continue;
      }
      if (page !== 'textbook' || param === undefined) continue;
      if (!sectionIds.has(param)) {
        err(`教本 ${s.id}: 存在しない節へのリンク ${to}`);
        continue;
      }
      const byTitle = titleToId.get(label);
      if (byTitle !== undefined && byTitle !== param) {
        mismatched.push(
          `教本 ${s.id}: リンクのラベル「${label}」は節 ${byTitle} のタイトルなのに ${param} を指している`,
        );
      }
    }
  }
  warnGroup('リンクのラベルと飛び先が食い違っている', mismatched);
}

// ---- 実際に描いてみる ----
// 記法としては正しくても、描くと崩れている場合がある。
for (const p of renderCheck()) err(p);

// ---- 集計して表示 ----
const sectionsPerCategory = new Map<string, number>();
for (const s of SECTIONS) {
  sectionsPerCategory.set(s.categoryId, (sectionsPerCategory.get(s.categoryId) ?? 0) + 1);
}
const emptyChapters = CATEGORIES.filter((c) => !sectionsPerCategory.has(c.id));

const chars = SECTIONS.reduce((n, s) => n + s.body.length, 0);
const linkedA = QUESTIONS_A.filter((q) => q.sectionId !== undefined).length;
const subQs = QUESTIONS_B.reduce((n, q) => n + q.subQuestions.length, 0);
const pastA = QUESTIONS_A.length - OWN_A.length;
const pastB = QUESTIONS_B.filter((q) => q.source !== undefined).length;

console.log('--- 収録状況 ---');
console.log(`教本      : ${SECTIONS.length} 節 / ${chars.toLocaleString()} 字（未着手の章 ${emptyChapters.length}）`);
console.log(`科目A     : ${QUESTIONS_A.length} 問（自作 ${OWN_A.length} / 公開問題 ${pastA}、節にひも付き ${linkedA} 問）`);
console.log(`科目B     : ${QUESTIONS_B.length} 問 / 設問 ${subQs} 個（公開問題 ${pastB} 問）`);
console.log(`計算ドリル: ${DRILLS.length} 種類`);
if (emptyChapters.length > 0) {
  console.log(`未着手の章: ${emptyChapters.map((c) => c.name).join('、')}`);
}

console.log('');
if (warnings.length > 0) {
  console.log(`--- 注意 ${warnings.length} 件 ---`);
  warnings.forEach((w) => console.log('  ' + w));
  console.log('');
}
if (errors.length === 0) {
  console.log('整合性チェック: エラーなし');
} else {
  console.log(`--- エラー ${errors.length} 件 ---`);
  errors.forEach((e) => console.log('  ' + e));
  process.exit(1);
}
