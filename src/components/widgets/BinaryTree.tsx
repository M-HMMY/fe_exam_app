import { useEffect, useMemo, useState, type JSX } from 'react';

/**
 * 2 分探索木の挿入と 3 つの走査（先行順・中間順・後行順）を試すウィジェット。
 */
export const widgetId = 'bstree';

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

type Order = 'pre' | 'in' | 'post';

const ORDERS: { id: Order; name: string; rule: string }[] = [
  { id: 'pre', name: '先行順', rule: '節 → 左部分木 → 右部分木（行きがけ順）' },
  { id: 'in', name: '中間順', rule: '左部分木 → 節 → 右部分木（通りがけ順）' },
  { id: 'post', name: '後行順', rule: '左部分木 → 右部分木 → 節（帰りがけ順）' },
];

const DEFAULT_VALUES = [50, 30, 70, 20, 40, 60, 80];
const MAX_NODES = 15;

function insertNode(root: TreeNode | null, value: number): TreeNode {
  if (!root) return { value, left: null, right: null };
  if (value < root.value) root.left = insertNode(root.left, value);
  else if (value > root.value) root.right = insertNode(root.right, value);
  return root;
}

function buildTree(values: number[]): TreeNode | null {
  let root: TreeNode | null = null;
  for (const v of values) root = insertNode(root, v);
  return root;
}

function traverse(node: TreeNode | null, order: Order, out: number[]): number[] {
  if (!node) return out;
  if (order === 'pre') out.push(node.value);
  traverse(node.left, order, out);
  if (order === 'in') out.push(node.value);
  traverse(node.right, order, out);
  if (order === 'post') out.push(node.value);
  return out;
}

/** 深さごとに 1 行ぶんのノード列（空きは null）を作る */
function buildLevels(root: TreeNode | null): (TreeNode | null)[][] {
  if (!root) return [];
  const levels: (TreeNode | null)[][] = [];
  let cur: (TreeNode | null)[] = [root];
  while (cur.some((n) => n !== null)) {
    levels.push(cur);
    const compact = cur.length * 2 > 16;
    const next: (TreeNode | null)[] = [];
    for (const n of cur) {
      if (n) {
        if (compact) {
          if (n.left) next.push(n.left);
          if (n.right) next.push(n.right);
        } else {
          next.push(n.left);
          next.push(n.right);
        }
      } else if (!compact) {
        next.push(null);
        next.push(null);
      }
    }
    cur = next;
  }
  return levels;
}

export default function BinaryTree(): JSX.Element {
  const [values, setValues] = useState<number[]>(DEFAULT_VALUES);
  const [input, setInput] = useState(35);
  const [order, setOrder] = useState<Order>('in');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('数値を挿入するか、走査の種類を選んで再生してください。');

  const tree = useMemo(() => buildTree(values), [values]);
  const levels = useMemo(() => buildLevels(tree), [tree]);
  const results = useMemo(
    () => ({
      pre: traverse(tree, 'pre', []),
      in: traverse(tree, 'in', []),
      post: traverse(tree, 'post', []),
    }),
    [tree],
  );

  const sequence = results[order];
  const last = sequence.length;
  const visitedCount = Math.min(step, last);
  const currentValue = visitedCount > 0 ? sequence[visitedCount - 1] : null;
  const visited = sequence.slice(0, visitedCount);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => Math.min(s + 1, last)), 650);
    return () => clearInterval(id);
  }, [playing, last]);

  useEffect(() => {
    if (playing && step >= last) setPlaying(false);
  }, [playing, step, last]);

  const rule = ORDERS.find((o) => o.id === order)!;

  const resetPlayback = () => {
    setStep(0);
    setPlaying(false);
  };

  const chooseOrder = (id: Order) => {
    setOrder(id);
    resetPlayback();
  };

  const add = () => {
    const v = Math.max(1, Math.min(99, Math.trunc(input) || 1));
    if (values.includes(v)) {
      setMessage(`${v} はすでに木にあります。2 分探索木では同じ値を重ねて持ちません。`);
      return;
    }
    if (values.length >= MAX_NODES) {
      setMessage(`表示できるのは ${MAX_NODES} 個までです。「リセット」で初期状態に戻してください。`);
      return;
    }
    setValues([...values, v]);
    resetPlayback();
    setMessage(`${v} を根から比べていき、小さければ左・大きければ右へ進んだ先の空き位置に挿入しました。`);
  };

  const reset = () => {
    setValues(DEFAULT_VALUES);
    setInput(35);
    resetPlayback();
    setMessage('初期状態（50, 30, 70, 20, 40, 60, 80 を挿入した木）に戻しました。');
  };

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (step >= last) setStep(0);
    setPlaying(true);
  };

  const stepLabel = (): string => {
    if (visitedCount === 0) return `${rule.name}走査を開始します。規則は「${rule.rule}」です。`;
    const head = `${visitedCount} 番目に ${currentValue} を訪問しました。`;
    const body = `ここまでの並び：${visited.join(', ')}`;
    if (visitedCount === last) return `${head}走査完了：${sequence.join(' → ')}`;
    return `${head}${body}`;
  };

  const nodeClass = (node: TreeNode | null): string => {
    if (!node) return 'dim';
    if (node.value === currentValue) return 'active';
    if (visited.includes(node.value)) return 'done';
    return '';
  };

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">2 分探索木をつくって走査する</h4>
        <p className="widget-desc">
          「左の部分木はその節より小さい／右の部分木はその節より大きい」という規則で数を挿入します。走査の種類を選んで再生すると、訪問する順番がハイライトされます。
        </p>
      </div>

      <div className="widget-controls">
        <label className="widget-field">
          <span>挿入する値（1〜99）</span>
          <input
            type="number"
            min={1}
            max={99}
            value={input}
            onChange={(e) => setInput(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
          />
        </label>
        <button type="button" className="btn small primary" onClick={add}>
          挿入
        </button>
        <button type="button" className="btn small ghost" onClick={reset}>
          リセット
        </button>
      </div>

      {levels.map((row, d) => (
        <div key={d} className="viz-row" style={{ justifyContent: 'center' }}>
          {row.map((node, i) => (
            <div key={i} className={`viz-cell ${nodeClass(node)}`}>
              <span>{node ? node.value : '・'}</span>
              <span className="idx">
                {node && visited.includes(node.value) ? `${visited.indexOf(node.value) + 1}` : `深さ${d}`}
              </span>
            </div>
          ))}
        </div>
      ))}

      <p className="viz-step-label">{stepLabel()}</p>

      <div className="viz-legend">
        <span className="viz-legend-item">
          <span className="viz-swatch active" />
          いま訪問中の節
        </span>
        <span className="viz-legend-item">
          <span className="viz-swatch done" />
          訪問済み（添字は訪問順）
        </span>
        <span className="viz-legend-item">
          <span className="viz-swatch" />
          薄いマスは空き（子がない）
        </span>
      </div>

      <div className="widget-controls">
        {ORDERS.map((o) => (
          <button key={o.id} type="button" className={`chip ${order === o.id ? 'on' : ''}`} onClick={() => chooseOrder(o.id)}>
            {o.name}
          </button>
        ))}
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
        <button type="button" className="btn small ghost" onClick={resetPlayback}>
          最初から
        </button>
      </div>

      <p className="viz-step-label">{message}</p>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">先行順（節 → 左 → 右）</span>
          <span className="out-value mono">{results.pre.join(', ')}</span>
        </div>
        <div className="out-item">
          <span className="out-label">中間順（左 → 節 → 右）</span>
          <span className="out-value mono">{results.in.join(', ')}</span>
        </div>
        <div className="out-item">
          <span className="out-label">後行順（左 → 右 → 節）</span>
          <span className="out-value mono">{results.post.join(', ')}</span>
        </div>
      </div>

      <p className="widget-note">
        2 分探索木を<strong>中間順</strong>で走査すると、必ず値が昇順に並びます（上の中間順の行を見てください）。「左＜節＜右」という規則をそのままの順番でたどるからで、木に入れるだけで整列済みの列が取り出せるのがこのデータ構造の要点です。試験では走査結果の並びから木の形を復元させる問題や、先行順・後行順の結果を答えさせる問題が出ます。また、木の高さが h なら探索は最大 h 回の比較で済み、平衡していれば O(log n) になります。
      </p>
    </>
  );
}
