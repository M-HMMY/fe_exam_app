import { useState, type JSX } from 'react';

/**
 * CPI と MIPS を求める計算機ウィジェット。
 * クロック周波数と命令種別ごとの出現率・所要クロック数を変えると、
 * 平均 CPI・1 命令あたりの実行時間・MIPS 値と、その計算式の展開が同時に変わる。
 */
export const widgetId = 'cpi';

interface Kind {
  name: string;
  rate: number; // 出現率 (%)
  cycles: number; // 所要クロック数
}

const INITIAL: Kind[] = [
  { name: '演算命令', rate: 60, cycles: 4 },
  { name: '転送命令', rate: 30, cycles: 6 },
  { name: '分岐命令', rate: 10, cycles: 10 },
];

/** 桁数を指定して丸め、余分な 0 を落とした文字列にする */
const round = (n: number, digits: number): string => (Number.isFinite(n) ? String(Number(n.toFixed(digits))) : '—');

export default function CpiCalculator(): JSX.Element {
  const [clock, setClock] = useState(1000); // MHz
  const [kinds, setKinds] = useState<Kind[]>(INITIAL);

  const update = (i: number, patch: Partial<Kind>) =>
    setKinds(kinds.map((k, j) => (j === i ? { ...k, ...patch } : k)));

  const totalRate = kinds.reduce((s, k) => s + k.rate, 0);
  const avgCpi = kinds.reduce((s, k) => s + (k.rate / 100) * k.cycles, 0);
  const valid = avgCpi > 0 && clock > 0;

  const nsPerInstruction = valid ? (avgCpi * 1000) / clock : 0; // ns
  const mips = valid ? clock / avgCpi : 0;

  const formula = kinds.map((k) => `${round(k.rate / 100, 3)}×${k.cycles}`).join(' + ');

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">CPI と MIPS を計算する</h4>
        <p className="widget-desc">
          クロック周波数と命令の出現率・所要クロック数を変えると、平均 CPI・1 命令あたりの実行時間・MIPS
          値がどう変わるかを確かめられます。
        </p>
      </div>

      <div className="widget-row">
        <label className="widget-field">
          <span>クロック（MHz）</span>
          <input
            type="number"
            min={1}
            max={5000}
            value={clock}
            onChange={(e) => setClock(Math.max(1, Math.min(5000, Math.trunc(Number(e.target.value) || 0))))}
          />
        </label>
        <input
          className="slider"
          type="range"
          min={100}
          max={5000}
          step={100}
          value={clock}
          onChange={(e) => setClock(Number(e.target.value))}
          aria-label="クロック周波数のスライダ"
        />
      </div>

      <div className="table-wrap">
        <table className="widget-table">
          <thead>
            <tr>
              <th>命令の種別</th>
              <th>出現率（%）</th>
              <th>所要クロック数</th>
              <th>寄与（率×クロック）</th>
            </tr>
          </thead>
          <tbody>
            {kinds.map((k, i) => (
              <tr key={k.name}>
                <td>{k.name}</td>
                <td>
                  <span className="widget-field">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={k.rate}
                      onChange={(e) => update(i, { rate: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                      aria-label={`${k.name}の出現率`}
                    />
                  </span>
                </td>
                <td>
                  <span className="widget-field">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={k.cycles}
                      onChange={(e) => update(i, { cycles: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })}
                      aria-label={`${k.name}の所要クロック数`}
                    />
                  </span>
                </td>
                <td className="mono">{round((k.rate / 100) * k.cycles, 3)}</td>
              </tr>
            ))}
            <tr>
              <td>合計</td>
              <td className={totalRate === 100 ? 'hit' : 'miss'}>{round(totalRate, 2)}</td>
              <td>—</td>
              <td className="mono">{round(avgCpi, 3)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {totalRate !== 100 && (
        <p className="viz-step-label">
          注意：出現率の合計が {round(totalRate, 2)}% で 100% になっていません（計算はこのまま続けています）。
        </p>
      )}

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">平均 CPI</span>
          <span className="out-value mono">{round(avgCpi, 3)}</span>
        </div>
        <div className="out-item">
          <span className="out-label">1 命令あたりの実行時間</span>
          <span className="out-value mono">{valid ? `${round(nsPerInstruction, 3)} ns` : '—'}</span>
        </div>
        <div className="out-item">
          <span className="out-label">MIPS 値</span>
          <span className="out-value mono">{valid ? round(mips, 2) : '—'}</span>
        </div>
        <div className="out-item">
          <span className="out-label">1 クロックの時間</span>
          <span className="out-value mono">{round(1000 / clock, 4)} ns</span>
        </div>
      </div>

      <p className="viz-step-label">
        平均 CPI ＝ {formula} ＝ {round(avgCpi, 3)}
      </p>
      <p className="viz-step-label">
        1 命令の実行時間 ＝ 平均 CPI ÷ クロック周波数 ＝ {round(avgCpi, 3)} ÷ {clock}MHz ＝{' '}
        {valid ? `${round(nsPerInstruction, 3)} ns` : '—'}
      </p>
      <p className="viz-step-label">
        MIPS ＝ 1 秒間の実行命令数 ÷ 100 万 ＝ {clock} ÷ {round(avgCpi, 3)} ＝ {valid ? round(mips, 2) : '—'} MIPS
      </p>

      <p className="widget-note">
        1GHz は 1 秒間に 10 億クロック、つまり 1 クロックは 1ns です。平均 CPI が小さいほど 1 命令が速く終わり、MIPS
        値は大きくなります。試験では「クロック周波数と CPI から MIPS を求める」「MIPS から 1
        命令の実行時間を逆算する」の形で問われます。
      </p>
    </>
  );
}
