import { useState, type JSX } from 'react';

/**
 * 8 ビットの 2 の補数を体感するウィジェット。
 * 「絶対値のビット列 → 反転（1 の補数）→ +1（2 の補数）」の 3 段を並べて、
 * 負数がどう表現されるかと、足すと 0 になる検算を見せる。
 */
export const widgetId = 'twos';

const MIN = -128;
const MAX = 127;

/** 0〜255 の数を 8 桁の 2 進文字列にする */
const toBits = (n: number): string => (n & 0xff).toString(2).padStart(8, '0');

/** 8 ビットのビット列を符号付き 10 進として読む */
const toSigned = (n: number): number => ((n & 0xff) ^ 0x80) - 0x80;

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];
const SIGNED_WEIGHTS = [-128, 64, 32, 16, 8, 4, 2, 1];

function BitRow({ bits, weights }: { bits: string; weights: number[] }): JSX.Element {
  return (
    <div className="viz-bits">
      {[...bits].map((b, i) => (
        <span key={i} className={`viz-bit ${b === '1' ? 'on' : ''}`}>
          <span className="viz-bit-value">{b}</span>
          <span className="viz-bit-weight">{weights[i]}</span>
        </span>
      ))}
    </div>
  );
}

export default function TwosComplement(): JSX.Element {
  const [value, setValue] = useState(-45);

  const abs = Math.abs(value);
  const absBits = toBits(abs);
  const invBits = [...absBits].map((b) => (b === '1' ? '0' : '1')).join('');
  const twosByte = (parseInt(invBits, 2) + 1) & 0xff;
  const twosBits = toBits(twosByte);

  // 実際の 8 ビット表現（正なら値そのまま、負なら 2 の補数）
  const repBits = toBits(value);
  const positive = value >= 0;

  // 検算：|値| のビット列 + 2 の補数 = 1 0000 0000（9 ビット目は捨てる）
  const sum = abs + twosByte;
  const sumBits = sum.toString(2).padStart(9, '0');

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">2 の補数をつくる</h4>
        <p className="widget-desc">
          値を変えると、絶対値のビット列 →
          反転（1 の補数）→ +1（2 の補数）の手順と、その結果が 8 ビットでどう表現されるかが分かります。
        </p>
      </div>

      <div className="widget-row">
        <label className="widget-field">
          <span>10 進数</span>
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

      <p className="viz-step-label">① 絶対値 {abs} のビット列</p>
      <BitRow bits={absBits} weights={WEIGHTS} />

      <p className="viz-step-label">② 全ビットを反転（1 の補数）</p>
      <BitRow bits={invBits} weights={WEIGHTS} />

      <p className="viz-step-label">③ 1 を足す（2 の補数）→ これが −{abs} の表現</p>
      <BitRow bits={twosBits} weights={SIGNED_WEIGHTS} />

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">{value} の 8 ビット表現</span>
          <span className="out-value mono">{repBits}</span>
        </div>
        <div className="out-item">
          <span className="out-label">16 進</span>
          <span className="out-value mono">{(value & 0xff).toString(16).toUpperCase().padStart(2, '0')}</span>
        </div>
        <div className="out-item">
          <span className="out-label">最上位ビット</span>
          <span className="out-value">{positive ? '0 → 正' : '1 → 負'}</span>
        </div>
      </div>

      <p className="viz-step-label">
        検算： {abs}（{absBits}）＋ {twosByte}（{twosBits}）＝ {sumBits.slice(0, 1)} {sumBits.slice(1)}
        （9 ビット目のけたあふれを捨てると {sumBits.slice(1)} ＝ 0）
      </p>

      <p className="widget-note">
        {positive
          ? `${value} は正の数なので、最上位ビットが 0 のビット列 ${repBits} がそのまま表現になります。上の ③ は −${abs}（${twosBits} = ${toSigned(twosByte)}）の表現です。`
          : `${value} は負の数なので、絶対値 ${abs} の 2 の補数 ${twosBits} が表現になります。最上位ビットが 1 なので負と分かります。`}{' '}
        8 ビットの 2 の補数で表せる範囲は −128〜127（負のほうが 1 つ多い）。試験では「2 の補数を求めよ」「けたあふれを無視して足すと 0 になる」の形で問われます。
      </p>
    </>
  );
}
