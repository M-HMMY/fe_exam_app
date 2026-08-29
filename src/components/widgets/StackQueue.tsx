import { useState, type JSX } from 'react';

/**
 * スタック（LIFO）とキュー（FIFO）の動きを並べて比較するウィジェット。
 * 同じ値を両方に入れ、取り出したときに何が出てくるかの違いを見せる。
 */
export const widgetId = 'stackqueue';

interface HistoryRow {
  no: number;
  stack: number;
  queue: number;
}

const INITIAL = [10, 20, 30];

export default function StackQueue(): JSX.Element {
  const [input, setInput] = useState(40);
  const [stack, setStack] = useState<number[]>(INITIAL);
  const [queue, setQueue] = useState<number[]>(INITIAL);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [message, setMessage] = useState('「追加」で両方に同じ値を入れ、「取り出す」で 1 つずつ取り出してみてください。');

  const empty = stack.length === 0;
  const full = stack.length >= 8;

  const add = () => {
    const v = Math.max(1, Math.min(99, Math.trunc(input) || 1));
    setStack([...stack, v]);
    setQueue([...queue, v]);
    setMessage(`${v} を追加しました。スタックには一番上に積まれ（push）、キューには一番後ろに並びます（enqueue）。`);
    setInput(v + 1 > 99 ? 1 : v + 1);
  };

  const take = () => {
    if (empty) return;
    const popped = stack[stack.length - 1];
    const dequeued = queue[0];
    setStack(stack.slice(0, -1));
    setQueue(queue.slice(1));
    setHistory([...history, { no: history.length + 1, stack: popped, queue: dequeued }]);
    setMessage(
      `スタックからは最後に入れた ${popped} が出ました（pop）。キューからは最初に入れた ${dequeued} が出ました（dequeue）。`,
    );
  };

  const reset = () => {
    setStack(INITIAL);
    setQueue(INITIAL);
    setHistory([]);
    setInput(40);
    setMessage('最初の状態（10, 20, 30 を入れた直後）に戻しました。');
  };

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">スタックとキューをくらべる</h4>
        <p className="widget-desc">
          同じ値を左のスタックと右のキューへ同時に入れます。「取り出す」を押すと、それぞれから何が出てくるかを比べられます。次に出る要素を色で示しています。
        </p>
      </div>

      <div className="widget-controls">
        <label className="widget-field">
          <span>入れる値（1〜99）</span>
          <input
            type="number"
            min={1}
            max={99}
            value={input}
            onChange={(e) => setInput(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
          />
        </label>
        <button type="button" className="btn small primary" onClick={add} disabled={full}>
          追加（push / enqueue）
        </button>
        <button type="button" className="btn small" onClick={take} disabled={empty}>
          取り出す（pop / dequeue）
        </button>
        <button type="button" className="btn small ghost" onClick={reset}>
          リセット
        </button>
      </div>

      <div className="widget-row">
        <div style={{ flex: '1 1 200px' }}>
          <p className="out-label">スタック（LIFO・上が新しい）</p>
          <div
            className="viz-row"
            style={{ flexDirection: 'column-reverse', alignItems: 'flex-start', flexWrap: 'nowrap' }}
          >
            {stack.length === 0 ? (
              <div className="viz-cell dim">
                <span>空</span>
              </div>
            ) : (
              stack.map((v, i) => (
                <div key={i} className={`viz-cell ${i === stack.length - 1 ? 'active' : ''}`}>
                  <span>{v}</span>
                  <span className="idx">{i === stack.length - 1 ? '最上位' : `${i}`}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <p className="out-label">キュー（FIFO・左が先頭）</p>
          <div className="viz-row">
            {queue.length === 0 ? (
              <div className="viz-cell dim">
                <span>空</span>
              </div>
            ) : (
              queue.map((v, i) => (
                <div key={i} className={`viz-cell ${i === 0 ? 'active' : ''}`}>
                  <span>{v}</span>
                  <span className="idx">{i === 0 ? '先頭' : `${i}`}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <p className="viz-step-label">{message}</p>

      <div className="viz-legend">
        <span className="viz-legend-item">
          <span className="viz-swatch active" />
          次に取り出される要素
        </span>
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">格納されている個数</span>
          <span className="out-value mono">{stack.length}</span>
        </div>
        <div className="out-item">
          <span className="out-label">次にスタックから出る値</span>
          <span className="out-value mono">{empty ? '—' : stack[stack.length - 1]}</span>
        </div>
        <div className="out-item">
          <span className="out-label">次にキューから出る値</span>
          <span className="out-value mono">{empty ? '—' : queue[0]}</span>
        </div>
      </div>

      {history.length > 0 && (
        <div className="table-wrap">
          <table className="widget-table">
            <thead>
              <tr>
                <th>取り出した回</th>
                <th>スタックから出た値</th>
                <th>キューから出た値</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.no}>
                  <td>{h.no} 回目</td>
                  <td className="mono">{h.stack}</td>
                  <td className="mono">{h.queue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="widget-note">
        スタックは後入れ先出し（LIFO）で、最後に push した値が最初に pop されます。関数呼出しの戻り番地やローカル変数の保存、式の逆ポーランド表記の計算に使われます。キューは先入れ先出し（FIFO）で、入れた順に取り出されます。プリンタの印刷待ち行列や OS のタスク待ち行列のように「並んだ順に処理する」場面で使われます。試験では push / pop の並びを与えて最後に残る値やレジスタの内容を答えさせる問題が定番です。
      </p>
    </>
  );
}
