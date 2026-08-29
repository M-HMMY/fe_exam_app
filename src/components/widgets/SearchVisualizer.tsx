import { useEffect, useMemo, useState, type JSX } from 'react';

/**
 * 線形探索と 2 分探索を並べて再生し、比較回数の伸び方の違いを見せるウィジェット。
 */
export const widgetId = 'search';

interface Step {
  cur: number;
  lo: number;
  hi: number;
  found: boolean;
  finished: boolean;
  comparisons: number;
  label: string;
}

const SIZES = [15, 31, 63];
const SAMPLE15 = [2, 5, 8, 12, 16, 23, 38, 45, 52, 60, 71, 78, 85, 91, 99];
/** 配列に含まれない値（「見つからない場合」の確認用） */
const ABSENT = 1;

function makeArray(n: number): number[] {
  if (n === 15) return SAMPLE15;
  return Array.from({ length: n }, (_, i) => 2 + 3 * i);
}

function buildLinear(a: number[], target: number): Step[] {
  const n = a.length;
  const steps: Step[] = [];
  steps.push({
    cur: -1,
    lo: 0,
    hi: n - 1,
    found: false,
    finished: false,
    comparisons: 0,
    label: '線形探索：先頭から順に 1 つずつ、目的の値と一致するか調べます。',
  });
  for (let i = 0; i < n; i++) {
    const comparisons = i + 1;
    if (a[i] === target) {
      steps.push({
        cur: i,
        lo: i,
        hi: n - 1,
        found: true,
        finished: true,
        comparisons,
        label: `a[${i}]=${a[i]} は ${target} と一致しました。比較 ${comparisons} 回で発見です。`,
      });
      return steps;
    }
    steps.push({
      cur: i,
      lo: i,
      hi: n - 1,
      found: false,
      finished: false,
      comparisons,
      label: `a[${i}]=${a[i]} と ${target} を比較（${comparisons} 回目）。一致しないので次へ進みます。`,
    });
  }
  steps.push({
    cur: -1,
    lo: n,
    hi: n - 1,
    found: false,
    finished: true,
    comparisons: n,
    label: `最後まで調べましたが ${target} はありませんでした。比較は ${n} 回です。`,
  });
  return steps;
}

function buildBinary(a: number[], target: number): Step[] {
  const n = a.length;
  const steps: Step[] = [];
  let lo = 0;
  let hi = n - 1;
  let comparisons = 0;
  steps.push({
    cur: -1,
    lo,
    hi,
    found: false,
    finished: false,
    comparisons: 0,
    label: '2 分探索：昇順に並んでいることを利用し、範囲の中央と比べて探索範囲を半分に絞ります。',
  });
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    comparisons++;
    if (a[mid] === target) {
      steps.push({
        cur: mid,
        lo,
        hi,
        found: true,
        finished: true,
        comparisons,
        label: `中央 a[${mid}]=${a[mid]} は ${target} と一致しました。比較 ${comparisons} 回で発見です。`,
      });
      return steps;
    }
    if (a[mid] < target) {
      steps.push({
        cur: mid,
        lo,
        hi,
        found: false,
        finished: false,
        comparisons,
        label: `中央 a[${mid}]=${a[mid]} は ${target} より小さいので、右半分 a[${mid + 1}]〜a[${hi}] に絞ります（比較 ${comparisons} 回目）。`,
      });
      lo = mid + 1;
    } else {
      steps.push({
        cur: mid,
        lo,
        hi,
        found: false,
        finished: false,
        comparisons,
        label: `中央 a[${mid}]=${a[mid]} は ${target} より大きいので、左半分 a[${lo}]〜a[${mid - 1}] に絞ります（比較 ${comparisons} 回目）。`,
      });
      hi = mid - 1;
    }
  }
  steps.push({
    cur: -1,
    lo,
    hi,
    found: false,
    finished: true,
    comparisons,
    label: `探索範囲がなくなりました。${target} は存在しません。比較は ${comparisons} 回です。`,
  });
  return steps;
}

function cellClass(s: Step, i: number): string {
  if (s.found && i === s.cur) return 'done';
  if (i === s.cur) return 'active';
  if (i < s.lo || i > s.hi) return 'dim';
  return '';
}

export default function SearchVisualizer(): JSX.Element {
  const [size, setSize] = useState(15);
  const [target, setTarget] = useState(52);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const array = useMemo(() => makeArray(size), [size]);
  const linear = useMemo(() => buildLinear(array, target), [array, target]);
  const binary = useMemo(() => buildBinary(array, target), [array, target]);

  const last = Math.max(linear.length, binary.length) - 1;
  const lin = linear[Math.min(step, linear.length - 1)];
  const bin = binary[Math.min(step, binary.length - 1)];

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

  const changeSize = (n: number) => {
    const next = makeArray(n);
    setSize(n);
    setTarget(next[Math.floor(next.length / 2) + 1]);
    reset();
  };

  const changeTarget = (v: number) => {
    setTarget(v);
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

  const maxBinary = Math.floor(Math.log2(size)) + 1;

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">線形探索と 2 分探索をくらべる</h4>
        <p className="widget-desc">
          昇順に並んだ配列から目的の値を探します。上が線形探索、下が 2 分探索です。同じステップ数だけ進めて、どちらが早く終わるか見てください。
        </p>
      </div>

      <div className="widget-controls">
        {SIZES.map((n) => (
          <button key={n} type="button" className={`chip ${size === n ? 'on' : ''}`} onClick={() => changeSize(n)}>
            n = {n}
          </button>
        ))}
        <label className="widget-field">
          <span>探す値</span>
          <select value={target} onChange={(e) => changeTarget(Number(e.target.value))}>
            {array.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
            <option value={ABSENT}>{ABSENT}（配列にない値）</option>
          </select>
        </label>
      </div>

      <p className="out-label">線形探索</p>
      <div className="viz-row">
        {array.map((v, i) => (
          <div key={i} className={`viz-cell ${cellClass(lin, i)}`}>
            <span>{v}</span>
            <span className="idx">{i}</span>
          </div>
        ))}
      </div>
      <p className="viz-step-label">{lin.label}</p>

      <p className="out-label">2 分探索</p>
      <div className="viz-row">
        {array.map((v, i) => (
          <div key={i} className={`viz-cell ${cellClass(bin, i)}`}>
            <span>{v}</span>
            <span className="idx">{i}</span>
          </div>
        ))}
      </div>
      <p className="viz-step-label">{bin.label}</p>

      <div className="viz-legend">
        <span className="viz-legend-item">
          <span className="viz-swatch active" />
          いま比較している要素
        </span>
        <span className="viz-legend-item">
          <span className="viz-swatch done" />
          発見
        </span>
        <span className="viz-legend-item">
          <span className="viz-swatch" />
          薄い枠は探索範囲から外れた要素
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
          <span className="out-label">線形探索の比較回数</span>
          <span className="out-value mono">{lin.comparisons}</span>
        </div>
        <div className="out-item">
          <span className="out-label">2 分探索の比較回数</span>
          <span className="out-value mono">{bin.comparisons}</span>
        </div>
        <div className="out-item">
          <span className="out-label">最大比較回数（n = {size}）</span>
          <span className="out-value mono">
            {size} / {maxBinary}
          </span>
        </div>
      </div>

      <div className="table-wrap">
        <table className="widget-table">
          <thead>
            <tr>
              <th>要素数 n</th>
              <th>線形探索の最大比較回数（n）</th>
              <th>2 分探索の最大比較回数（log₂n + 1 の整数部）</th>
            </tr>
          </thead>
          <tbody>
            {SIZES.map((n) => (
              <tr key={n}>
                <td className={n === size ? 'hit' : ''}>{n}</td>
                <td>{n}</td>
                <td>{Math.floor(Math.log2(n)) + 1}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="widget-note">
        n = 15 なら線形探索は最大 15 回かかりますが、2 分探索は 1 回ごとに範囲が半分になるので最大 4 回です。要素数を 31、63 と倍々にしても 2 分探索の回数は 5 回、6 回と 1 ずつしか増えません（計算量は O(n) と O(log n)）。ただし 2 分探索は「あらかじめ昇順（または降順）に整列されている」ことが前提で、この条件を落とした選択肢が試験ではよく出ます。
      </p>
    </>
  );
}
