import { useState, type JSX } from 'react';

/**
 * 稼働率の計算ウィジェット。
 * (a) MTBF / MTTR から稼働率を出し、(b) 直列・並列の組み合わせで稼働率がどう変わるかを比べる。
 */
export const widgetId = 'availability';

interface Row {
  name: string;
  formula: string;
  value: number;
}

function pct(v: number): string {
  return `${(v * 100).toFixed(2)} %`;
}

export default function AvailabilityCalc(): JSX.Element {
  const [mtbf, setMtbf] = useState(480);
  const [mttr, setMttr] = useState(20);
  const [unit, setUnit] = useState(0.9);

  const total = mtbf + mttr;
  const availability = total > 0 ? mtbf / total : 0;

  const rows: Row[] = [
    { name: '装置 1 台', formula: 'A', value: unit },
    { name: '直列 2 台', formula: 'A²', value: unit ** 2 },
    { name: '並列 2 台', formula: '1 − (1 − A)²', value: 1 - (1 - unit) ** 2 },
    { name: '直列 3 台', formula: 'A³', value: unit ** 3 },
    { name: '並列 3 台', formula: '1 − (1 − A)³', value: 1 - (1 - unit) ** 3 },
  ];

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">稼働率を計算する</h4>
        <p className="widget-desc">
          MTBF（平均故障間隔）と MTTR（平均修復時間）から稼働率を求め、
          同じ装置を直列・並列につないだときに全体の稼働率がどう変わるかを比べます。
        </p>
      </div>

      <div className="widget-row">
        <label className="widget-field">
          <span>MTBF（時間）</span>
          <input
            type="number"
            min={1}
            max={100000}
            value={mtbf}
            onChange={(e) => setMtbf(Math.max(1, Math.min(100000, Number(e.target.value) || 1)))}
          />
        </label>
        <label className="widget-field">
          <span>MTTR（時間）</span>
          <input
            type="number"
            min={0}
            max={100000}
            value={mttr}
            onChange={(e) => setMttr(Math.max(0, Math.min(100000, Number(e.target.value) || 0)))}
          />
        </label>
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">稼働率 = MTBF ÷ (MTBF + MTTR)</span>
          <span className="out-value">{pct(availability)}</span>
        </div>
        <div className="out-item">
          <span className="out-label">計算式</span>
          <span className="out-value mono">
            {mtbf} ÷ {total} = {availability.toFixed(4)}
          </span>
        </div>
        <div className="out-item">
          <span className="out-label">停止している割合</span>
          <span className="out-value">{pct(1 - availability)}</span>
        </div>
      </div>

      <div className="widget-row" style={{ marginTop: 16 }}>
        <span className="widget-field">
          装置 1 台の稼働率 A = <span className="mono">{unit.toFixed(3)}</span>
        </span>
        <input
          className="slider"
          type="range"
          min={0.5}
          max={0.999}
          step={0.001}
          value={unit}
          onChange={(e) => setUnit(Number(e.target.value))}
          aria-label="装置 1 台の稼働率のスライダ"
        />
      </div>

      <div className="table-wrap">
        <table className="widget-table">
          <thead>
            <tr>
              <th>構成</th>
              <th>式</th>
              <th>稼働率</th>
              <th>長さで比較</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td className="mono">{r.formula}</td>
                <td className="mono">{pct(r.value)}</td>
                <td>
                  <span className="hbar">
                    <span className="hbar-fill" style={{ width: `${r.value * 100}%` }} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="widget-note">
        直列（どれか 1 台でも止まると全体が止まる）は稼働率の<strong>積</strong>なので、
        台数を増やすほど下がります（A = {unit.toFixed(3)} なら 3 台直列で{' '}
        {pct(unit ** 3)}）。並列（1 台でも生きていれば動く）は
        <strong>1 −（全部止まる確率）= 1 − (1 − A)ⁿ</strong> なので、台数を増やすほど劇的に上がります
        （同じ A でも 3 台並列なら {pct(1 - (1 - unit) ** 3)}）。
        システムの信頼性を上げたいときに「冗長構成（並列）にする」のはこのためです。
        試験では直列と並列が混ざった構成が出るので、並列部分をまとめて 1 台分の稼働率に置き換えてから
        直列の積を取る、という順で計算します。
      </p>
    </>
  );
}
