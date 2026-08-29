import { useState, type JSX } from 'react';

/**
 * 8 ビットのシフト演算ウィジェット。
 * 方向・シフト量・論理／算術を切り替えて、押し出されるビットと入ってくるビットを
 * 色分けしながら、×2ⁿ / ÷2ⁿ の関係と符号ビットの複写を確かめる。
 */
export const widgetId = 'shift';

const MIN = -128;
const MAX = 127;

const toBits = (n: number): string => (n & 0xff).toString(2).padStart(8, '0');
const toSigned = (n: number): number => ((n & 0xff) ^ 0x80) - 0x80;

type Dir = 'left' | 'right';
type Kind = 'logical' | 'arith';

/**
 * 8 桁のビット列をシフトする。
 * 算術シフトは符号ビット（最上位）を固定し、右シフトでは符号ビットを複写して埋める。
 */
function shift(bits: string, dir: Dir, n: number, kind: Kind): string {
  if (dir === 'left') {
    if (kind === 'arith') return bits[0] + (bits.slice(1) + '0'.repeat(n)).slice(n);
    return (bits + '0'.repeat(n)).slice(n);
  }
  const fill = kind === 'arith' ? bits[0] : '0';
  return fill.repeat(n) + bits.slice(0, 8 - n);
}

export default function ShiftOperation(): JSX.Element {
  const [value, setValue] = useState(-40);
  const [dir, setDir] = useState<Dir>('right');
  const [amount, setAmount] = useState(2);
  const [kind, setKind] = useState<Kind>('arith');

  const before = toBits(value);
  const after = shift(before, dir, amount, kind);
  const resultByte = parseInt(after, 2);
  const signed = toSigned(resultByte);

  // 押し出される位置（before の添字）と、入ってくる位置（after の添字）
  const pushedOut = (i: number) =>
    dir === 'left' ? (kind === 'arith' ? i >= 1 && i <= amount : i < amount) : i >= 8 - amount;
  const cameIn = (i: number) => (dir === 'left' ? i >= 8 - amount : i < amount);

  const factor = 2 ** amount;
  const expected = dir === 'left' ? value * factor : Math.floor(value / factor);
  const matches = signed === expected;

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">シフト演算をためす</h4>
        <p className="widget-desc">
          8 ビットの整数をシフトします。押し出されて消えるビットと、空いた側に入ってくるビットを色で区別しています。
        </p>
      </div>

      <div className="widget-row">
        <label className="widget-field">
          <span>値</span>
          <input
            type="number"
            min={MIN}
            max={MAX}
            value={value}
            onChange={(e) => setValue(Math.max(MIN, Math.min(MAX, Math.trunc(Number(e.target.value) || 0))))}
          />
        </label>
        <input
          className="slider"
          type="range"
          min={MIN}
          max={MAX}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label="値のスライダ"
        />
      </div>

      <div className="widget-controls">
        <label className="widget-field">
          <span>方向</span>
          <select value={dir} onChange={(e) => setDir(e.target.value as Dir)}>
            <option value="left">左シフト</option>
            <option value="right">右シフト</option>
          </select>
        </label>
        <label className="widget-field">
          <span>シフト量</span>
          <select value={amount} onChange={(e) => setAmount(Number(e.target.value))}>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} ビット
              </option>
            ))}
          </select>
        </label>
        <label className="widget-field">
          <span>種類</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
            <option value="logical">論理シフト</option>
            <option value="arith">算術シフト</option>
          </select>
        </label>
      </div>

      <p className="viz-step-label">シフト前（{value}）</p>
      <div className="viz-row">
        {[...before].map((b, i) => (
          <span key={i} className={`viz-cell ${pushedOut(i) ? 'swap' : ''} ${i === 0 ? 'active' : ''}`}>
            {b}
            <span className="idx">{i === 0 ? '符号' : 2 ** (7 - i)}</span>
          </span>
        ))}
      </div>

      <p className="viz-step-label">
        シフト後（{dir === 'left' ? '左' : '右'}へ {amount} ビット／{kind === 'arith' ? '算術' : '論理'}シフト）
      </p>
      <div className="viz-row">
        {[...after].map((b, i) => (
          <span key={i} className={`viz-cell ${cameIn(i) ? 'done' : ''}`}>
            {b}
            <span className="idx">{i === 0 ? '符号' : 2 ** (7 - i)}</span>
          </span>
        ))}
      </div>

      <div className="viz-legend">
        <span className="viz-legend-item">
          <span className="viz-swatch swap" />
          押し出されて捨てられるビット
        </span>
        <span className="viz-legend-item">
          <span className="viz-swatch done" />
          新しく入ってくるビット（{dir === 'left' ? '0' : kind === 'arith' ? `符号ビット ${before[0]} の複写` : '0'}）
        </span>
        <span className="viz-legend-item">
          <span className="viz-swatch active" />
          符号ビット
        </span>
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">シフト前</span>
          <span className="out-value mono">{before}</span>
        </div>
        <div className="out-item">
          <span className="out-label">シフト後</span>
          <span className="out-value mono">{after}</span>
        </div>
        <div className="out-item">
          <span className="out-label">10 進（符号付き）</span>
          <span className="out-value">{signed}</span>
        </div>
        <div className="out-item">
          <span className="out-label">10 進（符号なし）</span>
          <span className="out-value">{resultByte}</span>
        </div>
      </div>

      <p className="viz-step-label">
        {dir === 'left'
          ? `左へ ${amount} ビット ＝ ×2^${amount}（×${factor}）：${value} × ${factor} = ${expected}`
          : `右へ ${amount} ビット ＝ ÷2^${amount}（÷${factor}）：${value} ÷ ${factor} = ${expected}（小数点以下切り捨て）`}
        {matches ? ` → 結果 ${signed} と一致します。` : ` → 結果は ${signed} で一致しません。`}
      </p>

      <p className="widget-note">
        {matches
          ? ''
          : dir === 'left'
            ? '左シフトで 1 が符号ビットの外へ押し出されると、けたあふれ（オーバーフロー）で ×2ⁿ の関係が崩れます。 '
            : '論理右シフトは空いた上位に 0 を入れるので、負の数では符号が失われて ÷2ⁿ になりません。 '}
        算術シフトは符号ビットをそのまま残し、右シフトのときは空いた上位に符号ビットを複写します（負の数なら 1 が入る）。
        論理シフトは符号を考えず、必ず 0 を入れます。試験では「算術右シフト後の値」「けたあふれの有無」がよく問われます。
      </p>
    </>
  );
}
