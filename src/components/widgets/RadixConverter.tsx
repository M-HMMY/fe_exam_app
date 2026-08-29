import { useState, type JSX } from 'react';

/**
 * 基数変換の対話ウィジェット（他のウィジェットを書くときの見本）。
 * 10 進数を入力すると、2 進・8 進・16 進の表現と各ビットの重みを同時に示す。
 */
export const widgetId = 'radix';

const MAX = 65535;

export default function RadixConverter(): JSX.Element {
  const [value, setValue] = useState(45);

  const bits = value.toString(2).padStart(value > 255 ? 16 : 8, '0');
  const weights = [...bits].map((_, i) => 2 ** (bits.length - 1 - i));
  const groups: string[] = [];
  for (let i = 0; i < bits.length; i += 4) groups.push(bits.slice(i, i + 4));

  const toggle = (index: number) => {
    const arr = [...bits];
    arr[index] = arr[index] === '1' ? '0' : '1';
    setValue(parseInt(arr.join(''), 2));
  };

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">基数変換をためす</h4>
        <p className="widget-desc">
          スライダを動かすか、ビットを直接クリックしてみてください。10 進・2 進・8 進・16 進が同時に変わります。
        </p>
      </div>

      <div className="widget-row">
        <label className="widget-field">
          <span>10 進数</span>
          <input
            type="number"
            min={0}
            max={MAX}
            value={value}
            onChange={(e) => setValue(Math.max(0, Math.min(MAX, Number(e.target.value) || 0)))}
          />
        </label>
        <input
          className="slider"
          type="range"
          min={0}
          max={255}
          value={Math.min(value, 255)}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label="値のスライダ"
        />
      </div>

      <div className="viz-bits">
        {[...bits].map((b, i) => (
          <button
            key={i}
            type="button"
            className={`viz-bit ${b === '1' ? 'on' : ''}`}
            onClick={() => toggle(i)}
            title={`重み ${weights[i]}`}
          >
            <span className="viz-bit-value">{b}</span>
            <span className="viz-bit-weight">{weights[i]}</span>
          </button>
        ))}
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">2 進数</span>
          <span className="out-value mono">{groups.join(' ')}</span>
        </div>
        <div className="out-item">
          <span className="out-label">8 進数</span>
          <span className="out-value mono">{value.toString(8)}</span>
        </div>
        <div className="out-item">
          <span className="out-label">16 進数</span>
          <span className="out-value mono">{value.toString(16).toUpperCase()}</span>
        </div>
      </div>

      <p className="widget-note">
        2 進数を下から 4 桁ずつ区切ると、そのまま 16 進数の 1 桁になります（{groups.join(' ')} →{' '}
        {value.toString(16).toUpperCase()}）。立っているビットの重みを足すと{' '}
        {weights.filter((_, i) => bits[i] === '1').join(' + ') || '0'} = {value} です。
      </p>
    </>
  );
}
