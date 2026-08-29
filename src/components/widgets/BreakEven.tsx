import { useState, type JSX } from 'react';

/**
 * 損益分岐点のウィジェット。
 * 固定費・変動費率・想定売上高を動かして、損益分岐点売上高と利益の出る領域を見る。
 */
export const widgetId = 'bep';

const W = 340;
const H = 200;
const PAD_L = 48;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 30;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

/** 目盛りが読みやすい上限に丸める */
function niceMax(v: number): number {
  const base = 10 ** Math.floor(Math.log10(Math.max(v, 1)));
  return Math.ceil(v / (base / 2)) * (base / 2);
}

function man(v: number): string {
  return `${Math.round(v).toLocaleString('ja-JP')} 万円`;
}

export default function BreakEven(): JSX.Element {
  const [fixed, setFixed] = useState(800);
  const [ratio, setRatio] = useState(0.6);
  const [sales, setSales] = useState(2500);

  const marginRatio = 1 - ratio; // 限界利益率
  const bep = fixed / marginRatio;
  const variable = sales * ratio;
  const margin = sales * marginRatio; // 限界利益
  const profit = sales - variable - fixed;

  const axisMax = niceMax(Math.max(sales, bep) * 1.25);
  const xOf = (v: number): number => PAD_L + (v / axisMax) * PLOT_W;
  const yOf = (v: number): number => PAD_T + (1 - v / axisMax) * PLOT_H;

  const costAtMax = fixed + ratio * axisMax;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * axisMax);

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">損益分岐点を求める</h4>
        <p className="widget-desc">
          固定費・変動費率・想定売上高を動かすと、損益分岐点売上高と利益が変わります。
          売上高の直線が総費用の直線を上回った先が、利益の出る領域です。
        </p>
      </div>

      <div className="widget-row">
        <span className="widget-field">
          固定費 <span className="mono">{man(fixed)}</span>
        </span>
        <input
          className="slider"
          type="range"
          min={100}
          max={5000}
          step={50}
          value={fixed}
          onChange={(e) => setFixed(Number(e.target.value))}
          aria-label="固定費のスライダ"
        />
      </div>
      <div className="widget-row">
        <span className="widget-field">
          変動費率 <span className="mono">{ratio.toFixed(2)}</span>
        </span>
        <input
          className="slider"
          type="range"
          min={0}
          max={0.9}
          step={0.01}
          value={ratio}
          onChange={(e) => setRatio(Number(e.target.value))}
          aria-label="変動費率のスライダ"
        />
      </div>
      <div className="widget-row">
        <span className="widget-field">
          想定売上高 <span className="mono">{man(sales)}</span>
        </span>
        <input
          className="slider"
          type="range"
          min={0}
          max={8000}
          step={100}
          value={sales}
          onChange={(e) => setSales(Number(e.target.value))}
          aria-label="想定売上高のスライダ"
        />
      </div>

      <svg className="chart" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="損益分岐点のグラフ">
        {ticks.map((t) => (
          <g key={`y${t}`}>
            <line className="grid" x1={PAD_L} y1={yOf(t)} x2={W - PAD_R} y2={yOf(t)} />
            <text className="chart-text" x={PAD_L - 6} y={yOf(t) + 3} textAnchor="end">
              {Math.round(t).toLocaleString('ja-JP')}
            </text>
          </g>
        ))}
        {ticks.map((t) => (
          <text key={`x${t}`} className="chart-text" x={xOf(t)} y={H - PAD_B + 14} textAnchor="middle">
            {Math.round(t).toLocaleString('ja-JP')}
          </text>
        ))}

        {/* 利益が出る領域（売上高の直線と総費用の直線に挟まれた部分） */}
        <path
          className="area"
          d={`M ${xOf(bep)},${yOf(bep)} L ${xOf(axisMax)},${yOf(axisMax)} L ${xOf(axisMax)},${yOf(
            costAtMax,
          )} Z`}
        />
        {/* 売上高の直線 y = x */}
        <line className="line" x1={xOf(0)} y1={yOf(0)} x2={xOf(axisMax)} y2={yOf(axisMax)} />
        {/* 総費用の直線 y = 固定費 + 変動費率 × 売上高 */}
        <line className="line-2" x1={xOf(0)} y1={yOf(fixed)} x2={xOf(axisMax)} y2={yOf(costAtMax)} />

        <line className="axis" x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} />
        <line className="axis" x1={PAD_L} y1={PAD_T + PLOT_H} x2={W - PAD_R} y2={PAD_T + PLOT_H} />

        <line className="grid" x1={xOf(sales)} y1={PAD_T} x2={xOf(sales)} y2={PAD_T + PLOT_H} />
        <circle className="marker" cx={xOf(bep)} cy={yOf(bep)} r={4.5} />
        <text
          className="chart-text"
          x={Math.min(xOf(bep) + 7, W - PAD_R - 60)}
          y={Math.max(yOf(bep) - 6, PAD_T + 9)}
        >
          損益分岐点 {Math.round(bep).toLocaleString('ja-JP')}
        </text>
        <text className="chart-text" x={xOf(sales)} y={H - PAD_B + 26} textAnchor="middle">
          想定売上高
        </text>
        <text className="chart-text" x={PAD_L - 6} y={PAD_T - 2} textAnchor="end">
          万円
        </text>
      </svg>

      <div className="viz-legend">
        <span className="viz-legend-item">
          <span className="viz-swatch active" />
          売上高（実線）
        </span>
        <span className="viz-legend-item">
          <span className="viz-swatch compare" />
          総費用 = 固定費 + 変動費率 × 売上高（破線）
        </span>
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">損益分岐点売上高 = 固定費 ÷ (1 − 変動費率)</span>
          <span className="out-value">{man(bep)}</span>
        </div>
        <div className="out-item">
          <span className="out-label">限界利益率 (1 − 変動費率)</span>
          <span className="out-value mono">{(marginRatio * 100).toFixed(1)} %</span>
        </div>
        <div className="out-item">
          <span className="out-label">限界利益（想定売上高）</span>
          <span className="out-value">{man(margin)}</span>
        </div>
        <div className="out-item">
          <span className="out-label">変動費</span>
          <span className="out-value">{man(variable)}</span>
        </div>
        <div className="out-item">
          <span className="out-label">利益 = 売上 − 変動費 − 固定費</span>
          <span className="out-value" style={{ color: profit >= 0 ? 'var(--ok)' : 'var(--ng)' }}>
            {profit >= 0 ? '' : '△'}
            {man(Math.abs(profit))}
          </span>
        </div>
      </div>

      <p className="widget-note">
        計算式は {Math.round(fixed).toLocaleString('ja-JP')} ÷ (1 − {ratio.toFixed(2)}) ={' '}
        {man(bep)}。売上高がこの点を超えると、限界利益（売上 − 変動費）が固定費を上回って黒字になります
        （現在の想定売上高 {man(sales)} は損益分岐点を
        {sales >= bep ? '上回っており黒字' : '下回っており赤字'}）。
        変動費率を上げると限界利益率が下がり、分岐点は右へ大きく動きます。
        試験では「損益分岐点売上高」「変動費率」「固定費」のうち 2 つが与えられて残りを求める形や、
        目標利益を足して（固定費 + 目標利益）÷ 限界利益率 を求める形で問われます。
      </p>
    </>
  );
}
