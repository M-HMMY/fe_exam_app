import { useState, type JSX } from 'react';

/**
 * M/M/1 待ち行列モデルのウィジェット。
 * 利用率 ρ とサービス時間から平均待ち時間・平均応答時間を求め、
 * ρ が 1 に近づくと応答時間が発散する様子をグラフで示す。
 */
export const widgetId = 'queueing';

const W = 340;
const H = 190;
const PAD_L = 42;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 28;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const RHO_MAX = 0.95;
const Y_MAX = 20; // 応答時間の上限（サービス時間の何倍か）

const xOf = (rho: number): number => PAD_L + (rho / RHO_MAX) * PLOT_W;
const yOf = (mult: number): number => PAD_T + (1 - Math.min(mult, Y_MAX) / Y_MAX) * PLOT_H;

function fmt(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} 秒`;
  return `${ms.toFixed(1)} ミリ秒`;
}

export default function QueueingModel(): JSX.Element {
  const [rho, setRho] = useState(0.5);
  const [service, setService] = useState(20);

  const wait = (rho / (1 - rho)) * service;
  const response = (1 / (1 - rho)) * service;

  const points: string[] = [];
  for (let r = 0; r <= RHO_MAX + 1e-9; r += 0.01) {
    points.push(`${xOf(r).toFixed(1)},${yOf(1 / (1 - r)).toFixed(1)}`);
  }
  const line = `M ${points.join(' L ')}`;
  const area = `M ${xOf(0).toFixed(1)},${(PAD_T + PLOT_H).toFixed(1)} L ${points.join(' L ')} L ${xOf(
    RHO_MAX,
  ).toFixed(1)},${(PAD_T + PLOT_H).toFixed(1)} Z`;

  const yTicks = [0, 5, 10, 15, 20];
  const xTicks = [0, 0.25, 0.5, 0.75, 0.95];

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">待ち行列（M/M/1）をためす</h4>
        <p className="widget-desc">
          利用率 ρ を上げていくと、平均待ち時間と平均応答時間がどう伸びるかを見ます。
          ρ が 1 に近づくと、わずかな増加で応答時間が跳ね上がります。
        </p>
      </div>

      <div className="widget-row">
        <span className="widget-field">
          利用率 ρ = <span className="mono">{rho.toFixed(2)}</span>
        </span>
        <input
          className="slider"
          type="range"
          min={0.05}
          max={0.95}
          step={0.01}
          value={rho}
          onChange={(e) => setRho(Number(e.target.value))}
          aria-label="利用率 ρ のスライダ"
        />
        <label className="widget-field">
          <span>平均サービス時間（ミリ秒）</span>
          <input
            type="number"
            min={1}
            max={10000}
            value={service}
            onChange={(e) => setService(Math.max(1, Math.min(10000, Number(e.target.value) || 1)))}
          />
        </label>
      </div>

      <svg className="chart" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="利用率と平均応答時間のグラフ">
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line className="grid" x1={PAD_L} y1={yOf(t)} x2={W - PAD_R} y2={yOf(t)} />
            <text className="chart-text" x={PAD_L - 6} y={yOf(t) + 3} textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={`x${t}`} className="chart-text" x={xOf(t)} y={H - PAD_B + 14} textAnchor="middle">
            {t}
          </text>
        ))}
        <path className="area" d={area} />
        <path className="line" d={line} />
        <line className="axis" x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} />
        <line className="axis" x1={PAD_L} y1={PAD_T + PLOT_H} x2={W - PAD_R} y2={PAD_T + PLOT_H} />
        <line
          className="grid"
          x1={xOf(rho)}
          y1={PAD_T}
          x2={xOf(rho)}
          y2={PAD_T + PLOT_H}
        />
        <circle className="marker" cx={xOf(rho)} cy={yOf(1 / (1 - rho))} r={4.5} />
        <text
          className="chart-text"
          x={Math.min(xOf(rho) + 6, W - PAD_R - 40)}
          y={Math.max(yOf(1 / (1 - rho)) - 7, PAD_T + 9)}
        >
          {(1 / (1 - rho)).toFixed(1)} 倍
        </text>
        <text className="chart-text" x={PAD_L - 6} y={PAD_T - 2} textAnchor="end">
          倍
        </text>
        <text className="chart-text" x={W - PAD_R} y={H - PAD_B + 26} textAnchor="end">
          利用率 ρ
        </text>
      </svg>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">平均待ち時間 = ρ/(1−ρ) × サービス時間</span>
          <span className="out-value">{fmt(wait)}</span>
        </div>
        <div className="out-item">
          <span className="out-label">平均応答時間 = 1/(1−ρ) × サービス時間</span>
          <span className="out-value">{fmt(response)}</span>
        </div>
        <div className="out-item">
          <span className="out-label">サービス時間の何倍か</span>
          <span className="out-value mono">{(1 / (1 - rho)).toFixed(2)} 倍</span>
        </div>
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">ρ = 0.5 のときの応答時間</span>
          <span className="out-value">{fmt(2 * service)}（2 倍）</span>
        </div>
        <div className="out-item">
          <span className="out-label">ρ = 0.8 のときの応答時間</span>
          <span className="out-value">{fmt(5 * service)}（5 倍）</span>
        </div>
        <div className="out-item">
          <span className="out-label">0.5 → 0.8 で</span>
          <span className="out-value">2.5 倍に悪化</span>
        </div>
      </div>

      <p className="widget-note">
        利用率が 0.5 から 0.8 へ上がると、CPU の仕事量は 1.6 倍にしかなっていないのに応答時間は
        2 倍 → 5 倍、つまり <strong>2.5 倍</strong>に伸びます。これが「使用率を上げすぎると急に遅くなる」理由で、
        試験でも「利用率が 0.5 から 0.8 になったとき応答時間は何倍か」という形で頻出です。
        ρ = λ/μ（到着率 ÷ サービス率）が 1 に近づくと 1/(1−ρ) が発散するため、
        実運用では利用率に余裕を残す設計が必要になります。
      </p>
    </>
  );
}
