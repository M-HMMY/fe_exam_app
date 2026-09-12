import type { ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Markdown } from '../src/lib/markdown';
import { SECTIONS } from '../src/data/textbook';
import { QUESTIONS_A, QUESTIONS_B } from '../src/data/questions';
import { DRILLS } from '../src/data/drills';

import AvailabilityCalc, { widgetId as availabilityId } from '../src/components/widgets/AvailabilityCalc';
import BinaryTree, { widgetId as bstreeId } from '../src/components/widgets/BinaryTree';
import BreakEven, { widgetId as bepId } from '../src/components/widgets/BreakEven';
import CacheAccess, { widgetId as cacheId } from '../src/components/widgets/CacheAccess';
import CpiCalculator, { widgetId as cpiId } from '../src/components/widgets/CpiCalculator';
import LogicGates, { widgetId as logicId } from '../src/components/widgets/LogicGates';
import PageReplacement, { widgetId as pageId } from '../src/components/widgets/PageReplacement';
import QueueingModel, { widgetId as queueingId } from '../src/components/widgets/QueueingModel';
import RadixConverter, { widgetId as radixId } from '../src/components/widgets/RadixConverter';
import SearchVisualizer, { widgetId as searchId } from '../src/components/widgets/SearchVisualizer';
import ShiftOperation, { widgetId as shiftId } from '../src/components/widgets/ShiftOperation';
import SortVisualizer, { widgetId as sortId } from '../src/components/widgets/SortVisualizer';
import StackQueue, { widgetId as stackqueueId } from '../src/components/widgets/StackQueue';
import SubnetCalculator, { widgetId as subnetId } from '../src/components/widgets/SubnetCalculator';
import TwosComplement, { widgetId as twosId } from '../src/components/widgets/TwosComplement';

/**
 * 実際に描いてみて、画面に出てはいけないものが残っていないかを見る検査。
 * `npm run check` から呼ばれる（check.ts と違い、こちらは React を通す）。
 *
 * 型でも記法の検査でも捕まらない崩れ方がある。
 *   - ウィジェットの入力欄に NaN が入り込み、画面に NaN と出る
 *   - 未対応の図の種類を書くと、図ではなく注意書きが描かれる
 *   - JSX の中に Markdown 記法を書くと、`**` がそのまま出る
 * どれも「描いてみれば一目で分かる」たぐいなので、機械にやらせる。
 *
 * 計算ドリルは値が毎回変わるので、何度か引いて確かめる。
 */

/**
 * ウィジェットは Widget.tsx の import.meta.glob 経由で登録されるが、
 * その仕組みは Vite の外（この検査）では動かないので、ここに直接並べる。
 *
 * **id はファイル名ではなく、各ファイルが export する `widgetId`。**
 * 両者は一致していない（AvailabilityCalc.tsx → 'availability'）ので、
 * ファイル名から推測せず、実際の値を読み込んで使う。
 * check.ts の「未登録のウィジェット」検査も、この一覧を正とする。
 *
 * `src/components/widgets/` にファイルを足したら、ここにも足すこと
 * （足し忘れても画面は動くが、描画の検査と id の検査だけ素通りする）。
 */
const WIDGETS: [string, ComponentType][] = [
  [availabilityId, AvailabilityCalc],
  [bstreeId, BinaryTree],
  [bepId, BreakEven],
  [cacheId, CacheAccess],
  [cpiId, CpiCalculator],
  [logicId, LogicGates],
  [pageId, PageReplacement],
  [queueingId, QueueingModel],
  [radixId, RadixConverter],
  [searchId, SearchVisualizer],
  [shiftId, ShiftOperation],
  [sortId, SortVisualizer],
  [stackqueueId, StackQueue],
  [subnetId, SubnetCalculator],
  [twosId, TwosComplement],
];

/** 本文から ```widget: で呼んでよい id。check.ts が参照する */
export const WIDGET_IDS = new Set(WIDGETS.map(([id]) => id));

/**
 * 検査するのは「実際に Markdown を通る項目」だけにする。
 * 選択肢と科目B の設問文（prompt）とドリルの問題文は、画面では素のテキストとして
 * 描かれる（ChoiceList / QuestionCardB / Drill を参照）。Markdown を通していない
 * ものをここで通すと、画面に起きないことを検査してしまう。
 */
function inspect(label: string, source: string, problems: string[]): void {
  const html = renderToStaticMarkup(<Markdown source={source} />);
  if (html.includes('未対応の図の種類')) problems.push(`${label}: 未対応の図がある`);
  if (html.includes('未登録のウィジェット')) problems.push(`${label}: 未登録のウィジェットを呼んでいる`);
}

/** 見つかった問題の一覧を返す。空なら異常なし */
export function renderCheck(): string[] {
  const problems: string[] = [];

  for (const s of SECTIONS) inspect(`教本 ${s.id}`, s.body, problems);

  for (const q of QUESTIONS_A) {
    inspect(`科目A ${q.id}`, q.question, problems);
    inspect(`科目A ${q.id}`, q.explanation, problems);
  }

  for (const q of QUESTIONS_B) {
    inspect(`科目B ${q.id}`, q.description, problems);
    if (q.supplement) inspect(`科目B ${q.id}`, q.supplement, problems);
    q.subQuestions.forEach((sq, i) => {
      inspect(`科目B ${q.id} 設問${i + 1}`, sq.explanation, problems);
    });
  }

  for (const d of DRILLS) {
    for (let i = 0; i < 40; i++) {
      const item = d.generate();
      inspect(`ドリル ${d.id}`, item.explanation, problems);
      // 生成した値がそのまま画面に出るので、数値の崩れはここでしか捕まらない
      const all = [item.question, item.explanation, ...item.choices].join(' ');
      if (/NaN|Infinity|undefined/.test(all)) {
        problems.push(`ドリル ${d.id}: 生成した問題に NaN / Infinity / undefined が出る → ${item.question.slice(0, 50)}`);
      }
    }
  }

  for (const [id, Component] of WIDGETS) {
    let html = '';
    try {
      html = renderToStaticMarkup(<Component />);
    } catch (e) {
      problems.push(`ウィジェット ${id}: 描画に失敗した → ${String(e).slice(0, 80)}`);
      continue;
    }
    // ウィジェットは JSX なので Markdown 記法は効かない
    if (html.includes('**')) problems.push(`ウィジェット ${id}: ** が強調にならずそのまま出ている`);
    if (html.includes('NaN')) problems.push(`ウィジェット ${id}: NaN が画面に出ている`);
    if (html.includes('Infinity')) problems.push(`ウィジェット ${id}: Infinity が画面に出ている`);
    if (html.includes('>undefined<')) problems.push(`ウィジェット ${id}: undefined が画面に出ている`);
  }

  // 同じ崩れを何度も報告しても仕方がないのでまとめる
  return [...new Set(problems)];
}
