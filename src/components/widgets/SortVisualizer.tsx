import { useEffect, useMemo, useState, type JSX } from 'react';

/**
 * 整列アルゴリズム（バブル／選択／挿入）のステップ再生ウィジェット。
 * ステップ列を先にすべて計算しておき、スライダやボタンで現在位置を進める。
 */
export const widgetId = 'sort';

type Algo = 'bubble' | 'selection' | 'insertion';

interface Step {
  array: number[];
  compare: number[];
  swap: number[];
  done: number[];
  comparisons: number;
  swaps: number;
  label: string;
}

const ALGOS: { id: Algo; name: string }[] = [
  { id: 'bubble', name: 'バブルソート' },
  { id: 'selection', name: '選択ソート' },
  { id: 'insertion', name: '挿入ソート' },
];

const DEFAULT_ARRAY = [5, 3, 8, 1, 9, 2];

/** 0 から k-1 までの添字（整列済みの前半部分）を返す */
function prefix(k: number): number[] {
  return Array.from({ length: k }, (_, i) => i);
}

function buildBubble(input: number[]): Step[] {
  const a = [...input];
  const n = a.length;
  const steps: Step[] = [];
  let comparisons = 0;
  let swaps = 0;
  const done: number[] = [];
  const push = (compare: number[], swap: number[], label: string) =>
    steps.push({ array: [...a], compare, swap, done: [...done], comparisons, swaps, label });

  push([], [], 'バブルソートを開始します。隣り合う 2 要素を比べ、大きいほうを右へ送ります。');
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      push([j, j + 1], [], `a[${j}]=${a[j]} と a[${j + 1}]=${a[j + 1]} を比較します。`);
      if (a[j] > a[j + 1]) {
        swaps++;
        const t = a[j];
        a[j] = a[j + 1];
        a[j + 1] = t;
        push([], [j, j + 1], `左のほうが大きいので ${a[j + 1]} と ${a[j]} を交換します。`);
      } else {
        push([j, j + 1], [], '左のほうが大きくないので、そのままにします。');
      }
    }
    done.push(n - 1 - i);
    push([], [], `右端から ${i + 1} 個目、a[${n - 1 - i}]=${a[n - 1 - i]} の位置が確定しました。`);
  }
  done.push(0);
  push([], [], `整列完了：${a.join(', ')}（比較 ${comparisons} 回／交換 ${swaps} 回）`);
  return steps;
}

function buildSelection(input: number[]): Step[] {
  const a = [...input];
  const n = a.length;
  const steps: Step[] = [];
  let comparisons = 0;
  let swaps = 0;
  const done: number[] = [];
  const push = (compare: number[], swap: number[], label: string) =>
    steps.push({ array: [...a], compare, swap, done: [...done], comparisons, swaps, label });

  push([], [], '選択ソートを開始します。未整列部分から最小値を探し、その先頭と交換します。');
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    push([min], [], `a[${i}] 以降が未整列です。最小値の候補は a[${min}]=${a[min]} です。`);
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      push([min, j], [], `最小候補 a[${min}]=${a[min]} と a[${j}]=${a[j]} を比較します。`);
      if (a[j] < a[min]) {
        min = j;
        push([min], [], `a[${j}]=${a[j]} のほうが小さいので、最小候補を a[${min}] に更新します。`);
      }
    }
    if (min !== i) {
      swaps++;
      const t = a[i];
      a[i] = a[min];
      a[min] = t;
      push([], [i, min], `最小値 ${a[i]} を未整列部分の先頭 a[${i}] と交換します。`);
    } else {
      push([i], [], `a[${i}]=${a[i]} がすでに最小なので、交換は不要です。`);
    }
    done.push(i);
    push([], [], `a[${i}]=${a[i]} の位置が確定しました。`);
  }
  done.push(n - 1);
  push([], [], `整列完了：${a.join(', ')}（比較 ${comparisons} 回／交換 ${swaps} 回）`);
  return steps;
}

function buildInsertion(input: number[]): Step[] {
  const a = [...input];
  const n = a.length;
  const steps: Step[] = [];
  let comparisons = 0;
  let swaps = 0;
  let done: number[] = prefix(1);
  const push = (compare: number[], swap: number[], label: string) =>
    steps.push({ array: [...a], compare, swap, done: [...done], comparisons, swaps, label });

  push([], [], '挿入ソートを開始します。左端の 1 個だけを整列済みとみなし、次の要素を差し込んでいきます。');
  for (let i = 1; i < n; i++) {
    const key = a[i];
    push([i], [], `a[${i}]=${key} を取り出し、左の整列済み部分の正しい位置に挿入します。`);
    let j = i - 1;
    while (j >= 0) {
      comparisons++;
      push([j, j + 1], [], `整列済みの a[${j}]=${a[j]} と、挿入する ${key} を比較します。`);
      if (a[j] > key) {
        swaps++;
        a[j + 1] = a[j];
        push([], [j, j + 1], `${a[j]} は ${key} より大きいので、1 つ右へずらします。`);
        j--;
      } else {
        push([j, j + 1], [], `${a[j]} は ${key} 以下なので、ずらすのはここまでです。`);
        break;
      }
    }
    a[j + 1] = key;
    done = prefix(i + 1);
    push([], [j + 1], `${key} を a[${j + 1}] に挿入しました。左の ${i + 1} 個が整列済みです。`);
  }
  done = prefix(n);
  push([], [], `整列完了：${a.join(', ')}（比較 ${comparisons} 回／交換（移動）${swaps} 回）`);
  return steps;
}

function buildSteps(algo: Algo, input: number[]): Step[] {
  if (algo === 'bubble') return buildBubble(input);
  if (algo === 'selection') return buildSelection(input);
  return buildInsertion(input);
}

export default function SortVisualizer(): JSX.Element {
  const [algo, setAlgo] = useState<Algo>('bubble');
  const [array, setArray] = useState<number[]>(DEFAULT_ARRAY);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = useMemo(() => buildSteps(algo, array), [algo, array]);
  const last = steps.length - 1;
  const cur = steps[Math.min(step, last)];

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => Math.min(s + 1, last)), 550);
    return () => clearInterval(id);
  }, [playing, last]);

  useEffect(() => {
    if (playing && step >= last) setPlaying(false);
  }, [playing, step, last]);

  const reset = () => {
    setStep(0);
    setPlaying(false);
  };

  const chooseAlgo = (id: Algo) => {
    setAlgo(id);
    reset();
  };

  const shuffle = () => {
    setArray(Array.from({ length: 6 }, () => 1 + Math.floor(Math.random() * 9)));
    reset();
  };

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (step >= last) setStep(0);
    setPlaying(true);
  };

  const cellClass = (i: number): string => {
    if (cur.swap.includes(i)) return 'swap';
    if (cur.compare.includes(i)) return 'compare';
    if (cur.done.includes(i)) return 'done';
    return '';
  };

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">整列アルゴリズムを 1 手ずつ見る</h4>
        <p className="widget-desc">
          アルゴリズムを選び、「次へ」や「▶ 自動再生」でステップを進めてください。比較している 2 要素と、交換した要素、位置が確定した要素が色分けされます。
        </p>
      </div>

      <div className="widget-controls">
        {ALGOS.map((x) => (
          <button
            key={x.id}
            type="button"
            className={`chip ${algo === x.id ? 'on' : ''}`}
            onClick={() => chooseAlgo(x.id)}
          >
            {x.name}
          </button>
        ))}
        <button type="button" className="btn small ghost" onClick={shuffle}>
          シャッフル
        </button>
      </div>

      <div className="viz-row">
        {cur.array.map((v, i) => (
          <div key={i} className={`viz-cell ${cellClass(i)}`}>
            <span>{v}</span>
            <span className="idx">{i}</span>
          </div>
        ))}
      </div>

      <p className="viz-step-label">{cur.label}</p>

      <div className="viz-legend">
        <span className="viz-legend-item">
          <span className="viz-swatch compare" />
          比較中
        </span>
        <span className="viz-legend-item">
          <span className="viz-swatch swap" />
          交換した要素
        </span>
        <span className="viz-legend-item">
          <span className="viz-swatch done" />
          位置が確定
        </span>
      </div>

      <div className="widget-row">
        <button type="button" className="btn small" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          ← 前へ
        </button>
        <button
          type="button"
          className="btn small"
          onClick={() => setStep(Math.min(last, step + 1))}
          disabled={step >= last}
        >
          次へ →
        </button>
        <button type="button" className="btn small primary" onClick={togglePlay}>
          {playing ? '■ 停止' : '▶ 自動再生'}
        </button>
        <button type="button" className="btn small ghost" onClick={reset}>
          最初から
        </button>
      </div>

      <div className="widget-row">
        <input
          className="slider"
          type="range"
          min={0}
          max={last}
          value={Math.min(step, last)}
          onChange={(e) => {
            setPlaying(false);
            setStep(Number(e.target.value));
          }}
          aria-label="ステップのスライダ"
        />
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">比較回数</span>
          <span className="out-value mono">{cur.comparisons}</span>
        </div>
        <div className="out-item">
          <span className="out-label">交換（移動）回数</span>
          <span className="out-value mono">{cur.swaps}</span>
        </div>
        <div className="out-item">
          <span className="out-label">ステップ</span>
          <span className="out-value mono">
            {Math.min(step, last)} / {last}
          </span>
        </div>
      </div>

      <p className="widget-note">
        3 つとも平均計算量は O(n²) で、要素数が 10 倍になると手間はおよそ 100 倍です。ただし中身は違い、選択ソートは常に n(n−1)/2 回比較する一方、バブルソートと挿入ソートはほぼ整列済みの列なら最良 O(n) で済みます。安定性（同じ値の前後関係が保たれるか）はバブル・挿入が安定、選択は不安定です。試験では「比較回数・交換回数を数える」「途中経過の配列がどれか選ぶ」「安定な整列法はどれか」という形で問われます。
      </p>
    </>
  );
}
