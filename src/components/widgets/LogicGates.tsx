import { useState, type JSX } from 'react';

/**
 * 論理演算の対話ウィジェット。
 * 1 ビットの A・B をトグルして各ゲートの出力と真理値表を見せ、
 * 続けて 4 ビットのビット演算（マスク・セット・反転）を試せるようにする。
 */
export const widgetId = 'logic';

interface Gate {
  name: string;
  calc: (a: number, b: number) => number;
}

const GATES: Gate[] = [
  { name: 'AND', calc: (a, b) => a & b },
  { name: 'OR', calc: (a, b) => a | b },
  { name: 'XOR', calc: (a, b) => a ^ b },
  { name: 'NAND', calc: (a, b) => (a & b) ^ 1 },
  { name: 'NOR', calc: (a, b) => (a | b) ^ 1 },
  { name: 'NOT A', calc: (a) => a ^ 1 },
];

const ROWS: Array<[number, number]> = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

const bitOp = (x: string, y: string, f: (a: number, b: number) => number): string =>
  [...x].map((c, i) => String(f(Number(c), Number(y[i])))).join('');

function BitLine({ bits }: { bits: string }): JSX.Element {
  return (
    <div className="viz-bits">
      {[...bits].map((b, i) => (
        <span key={i} className={`viz-bit ${b === '1' ? 'on' : ''}`}>
          <span className="viz-bit-value">{b}</span>
          <span className="viz-bit-weight">{2 ** (bits.length - 1 - i)}</span>
        </span>
      ))}
    </div>
  );
}

export default function LogicGates(): JSX.Element {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [wordA, setWordA] = useState('1011');
  const [wordB, setWordB] = useState('0110');

  const flip = (word: string, i: number): string =>
    [...word].map((c, j) => (j === i ? (c === '1' ? '0' : '1') : c)).join('');

  const andW = bitOp(wordA, wordB, (x, y) => x & y);
  const orW = bitOp(wordA, wordB, (x, y) => x | y);
  const xorW = bitOp(wordA, wordB, (x, y) => x ^ y);

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">論理演算をためす</h4>
        <p className="widget-desc">
          入力 A・B のボタンを押して 0 と 1 を切り替えると、各ゲートの出力と真理値表の該当行が変わります。
        </p>
      </div>

      <div className="widget-controls">
        <button type="button" className={`chip ${a === 1 ? 'on' : ''}`} onClick={() => setA(a ^ 1)}>
          A = {a}
        </button>
        <button type="button" className={`chip ${b === 1 ? 'on' : ''}`} onClick={() => setB(b ^ 1)}>
          B = {b}
        </button>
      </div>

      <div className="widget-out">
        {GATES.map((g) => (
          <div key={g.name} className="out-item">
            <span className="out-label">{g.name}</span>
            <span className="out-value mono">{g.calc(a, b)}</span>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <table className="widget-table">
          <thead>
            <tr>
              <th>A</th>
              <th>B</th>
              {GATES.map((g) => (
                <th key={g.name}>{g.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([ra, rb]) => {
              const active = ra === a && rb === b;
              const cls = (v: number) => (active ? (v === 1 ? 'hit' : 'miss') : undefined);
              return (
                <tr key={`${ra}${rb}`}>
                  <td className={cls(ra)}>{ra}</td>
                  <td className={cls(rb)}>{rb}</td>
                  {GATES.map((g) => {
                    const v = g.calc(ra, rb);
                    return (
                      <td key={g.name} className={cls(v)}>
                        {v}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="viz-step-label">4 ビットのビット演算（ビットをクリックで反転）</p>

      <div className="viz-bits">
        {[...wordA].map((c, i) => (
          <button
            key={i}
            type="button"
            className={`viz-bit ${c === '1' ? 'on' : ''}`}
            onClick={() => setWordA(flip(wordA, i))}
            title={`A の ${2 ** (3 - i)} の位`}
          >
            <span className="viz-bit-value">{c}</span>
            <span className="viz-bit-weight">A</span>
          </button>
        ))}
      </div>

      <div className="viz-bits">
        {[...wordB].map((c, i) => (
          <button
            key={i}
            type="button"
            className={`viz-bit ${c === '1' ? 'on' : ''}`}
            onClick={() => setWordB(flip(wordB, i))}
            title={`B の ${2 ** (3 - i)} の位`}
          >
            <span className="viz-bit-value">{c}</span>
            <span className="viz-bit-weight">B</span>
          </button>
        ))}
      </div>

      <p className="viz-step-label">A AND B（マスク）</p>
      <BitLine bits={andW} />
      <p className="viz-step-label">A OR B（セット）</p>
      <BitLine bits={orW} />
      <p className="viz-step-label">A XOR B（反転）</p>
      <BitLine bits={xorW} />

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">A / B</span>
          <span className="out-value mono">
            {wordA} / {wordB}
          </span>
        </div>
        <div className="out-item">
          <span className="out-label">AND / OR / XOR</span>
          <span className="out-value mono">
            {andW} / {orW} / {xorW}
          </span>
        </div>
      </div>

      <p className="widget-note">
        AND は 0 を掛けたビットを消すので「必要な位だけ取り出すマスク」に、OR は 1 を立てたい位を「セット」するのに、
        XOR は 1 を当てた位だけ「反転」させるのに使います（同じ値で 2 回 XOR すると元に戻る性質も頻出）。
      </p>
    </>
  );
}
