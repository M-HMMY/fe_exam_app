import { useState, type JSX } from 'react';

/**
 * ページ置換アルゴリズム（FIFO / LRU）のシミュレータ。
 * 参照列と実記憶の枠数を変えて、ページフォールトの回数がどう変わるかを見る。
 */
export const widgetId = 'page';

type Algo = 'FIFO' | 'LRU';

interface Step {
  page: number;
  fault: boolean;
  /** 参照後の各枠の内容（空きは null） */
  frames: (number | null)[];
  /** フォールトなら書き込んだ枠、ヒットなら見つかった枠 */
  target: number;
  /** 追い出されたページ（初回ロードなら null） */
  evicted: number | null;
}

const DEFAULT_REFS = '1,2,3,4,1,2,5,1,2,3,4,5';
const MAX_REFS = 20;

function parseRefs(text: string): number[] {
  return text
    .split(/[^0-9]+/)
    .filter((s) => s.length > 0)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 99)
    .slice(0, MAX_REFS);
}

function simulate(refs: number[], size: number, algo: Algo): Step[] {
  const frames: (number | null)[] = Array<number | null>(size).fill(null);
  // FIFO は「入った順」、LRU は「最後に使った順」を保つ管理列（先頭が追い出し候補）
  const order: number[] = [];
  const steps: Step[] = [];

  for (const page of refs) {
    const found = frames.indexOf(page);
    if (found >= 0) {
      // ヒット。LRU のときだけ「最近使った」ことにして最後尾へ回す
      if (algo === 'LRU') {
        const at = order.indexOf(found);
        if (at >= 0) order.splice(at, 1);
        order.push(found);
      }
      steps.push({ page, fault: false, frames: [...frames], target: found, evicted: null });
      continue;
    }

    // フォールト。空き枠があればそこへ、なければ管理列の先頭を追い出す
    const empty = frames.indexOf(null);
    const slot = empty >= 0 ? empty : order.shift()!;
    const evicted = empty >= 0 ? null : frames[slot];
    frames[slot] = page;
    order.push(slot);
    steps.push({ page, fault: true, frames: [...frames], target: slot, evicted });
  }

  return steps;
}

function countFaults(steps: Step[]): number {
  return steps.reduce((sum, s) => sum + (s.fault ? 1 : 0), 0);
}

export default function PageReplacement(): JSX.Element {
  const [algo, setAlgo] = useState<Algo>('FIFO');
  const [text, setText] = useState(DEFAULT_REFS);
  const [size, setSize] = useState(3);

  const refs = parseRefs(text);
  const steps = simulate(refs, size, algo);
  const fifoFaults = countFaults(simulate(refs, size, 'FIFO'));
  const lruFaults = countFaults(simulate(refs, size, 'LRU'));
  const faults = algo === 'FIFO' ? fifoFaults : lruFaults;
  const rate = refs.length > 0 ? (faults / refs.length) * 100 : 0;
  const current = steps[steps.length - 1];

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">ページ置換をシミュレートする</h4>
        <p className="widget-desc">
          アルゴリズム・参照列・実記憶の枠数を変えると、ページフォールト（
          <span style={{ color: 'var(--ng)', fontWeight: 700 }}>赤</span>）とヒット（
          <span style={{ color: 'var(--ok)', fontWeight: 700 }}>緑</span>）の並びが変わります。
        </p>
      </div>

      <div className="widget-controls">
        {(['FIFO', 'LRU'] as const).map((a) => (
          <button
            key={a}
            type="button"
            className={`chip ${algo === a ? 'on' : ''}`}
            onClick={() => setAlgo(a)}
          >
            {a}
          </button>
        ))}
        <label className="widget-field">
          <span>参照列</span>
          <input
            type="text"
            className="wide"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={DEFAULT_REFS}
          />
        </label>
        <button type="button" className="btn small ghost" onClick={() => setText(DEFAULT_REFS)}>
          既定に戻す
        </button>
      </div>

      <div className="widget-row">
        <span className="widget-field">実記憶の枠数：{size}</span>
        <input
          className="slider"
          type="range"
          min={2}
          max={5}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          aria-label="実記憶の枠数のスライダ"
        />
      </div>

      {refs.length === 0 ? (
        <p className="widget-note" style={{ color: 'var(--ng)', fontWeight: 700 }}>
          参照列に数値がありません。「1,2,3,4」のようにページ番号をカンマ区切りで入力してください。
        </p>
      ) : (
        <div className="table-wrap">
          <table className="widget-table">
            <thead>
              <tr>
                <th>参照ページ</th>
                {steps.map((s, i) => (
                  <th key={i}>{s.page}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: size }, (_, f) => (
                <tr key={f}>
                  <th>枠 {f + 1}</th>
                  {steps.map((s, i) => {
                    const v = s.frames[f];
                    let cls = '';
                    if (s.target === f) cls = s.fault ? 'miss' : 'hit';
                    return (
                      <td key={i} className={cls}>
                        {v === null ? '−' : v}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <th>判定</th>
                {steps.map((s, i) => (
                  <td key={i} className={s.fault ? 'miss' : 'hit'}>
                    {s.fault ? '×' : '○'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">{algo} のページフォールト</span>
          <span className="out-value">{faults} 回</span>
        </div>
        <div className="out-item">
          <span className="out-label">参照回数 / フォールト率</span>
          <span className="out-value">
            {refs.length} 回 / {rate.toFixed(1)}%
          </span>
        </div>
        <div className="out-item">
          <span className="out-label">FIFO と LRU の比較</span>
          <span className="out-value">
            FIFO {fifoFaults} 回 ／ LRU {lruFaults} 回
          </span>
        </div>
      </div>

      {current !== undefined && (
        <p className="viz-step-label">
          最後の参照（ページ {current.page}）は{current.fault ? 'ページフォールト' : 'ヒット'}。
          {current.fault
            ? current.evicted === null
              ? `空いていた枠 ${current.target + 1} に読み込みました。`
              : `枠 ${current.target + 1} のページ ${current.evicted} を追い出して置き換えました。`
            : `枠 ${current.target + 1} にすでにありました。`}
        </p>
      )}

      <p className="widget-note">
        FIFO は「入った順」に、LRU は「最後に使われてから最も時間がたったもの」を追い出します。
        同じ参照列でも枠数やアルゴリズムでフォールト回数（現在 FIFO {fifoFaults} 回 ／ LRU {lruFaults} 回）が
        変わるのがポイントです。プログラムには直前に触れた場所を再び使う
        <strong>局所性（ローカリティ）</strong>があるため、通常は LRU の方が有利になります。
        実記憶が足りずページフォールトが多発すると、CPU がページの入れ替えばかりに時間を使う
        <strong>スラッシング</strong>が起き、スループットが急激に落ちます。
        なお FIFO では枠を増やしたのにフォールトが増えることがあり（ベラディの異常）、これも頻出です。
      </p>
    </>
  );
}
