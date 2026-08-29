import { useState, type JSX } from 'react';

/**
 * キャッシュメモリの実効アクセス時間ウィジェット。
 * キャッシュ／主記憶のアクセス時間とヒット率を変えると、実効アクセス時間と高速化倍率が変わり、
 * ヒット率 0〜100% の折れ線グラフ上に現在位置が打たれる。
 */
export const widgetId = 'cache';

const round = (n: number, digits: number): string => (Number.isFinite(n) ? String(Number(n.toFixed(digits))) : '—');

// グラフの座標系
const W = 320;
const H = 180;
const PAD_L = 34;
const PAD_R = 34;
const PAD_T = 12;
const PAD_B = 26;
const PW = W - PAD_L - PAD_R;
const PH = H - PAD_T - PAD_B;

export default function CacheAccess(): JSX.Element {
  const [cacheNs, setCacheNs] = useState(10);
  const [mainNs, setMainNs] = useState(100);
  const [hitRate, setHitRate] = useState(90);

  const h = hitRate / 100;
  const effective = h * cacheNs + (1 - h) * mainNs;
  const speedup = effective > 0 ? mainNs / effective : 0;
  const maxTime = Math.max(mainNs, cacheNs);
  const maxSpeed = cacheNs > 0 ? mainNs / cacheNs : 1;

  const timeAt = (p: number) => (p / 100) * cacheNs + (1 - p / 100) * mainNs;
  const x = (p: number) => PAD_L + (p / 100) * PW;
  const y = (t: number) => PAD_T + (1 - t / maxTime) * PH;
  const y2 = (s: number) => {
    const t = (s - 1) / Math.max(maxSpeed - 1, 0.0001);
    return PAD_T + (1 - Math.min(Math.max(t, 0), 1)) * PH;
  };

  const samples = Array.from({ length: 21 }, (_, i) => i * 5);
  const timeLine = samples.map((p) => `${x(p)},${y(timeAt(p))}`).join(' ');
  const speedLine = samples
    .map((p) => `${x(p)},${y2(timeAt(p) > 0 ? mainNs / timeAt(p) : 1)}`)
    .join(' ');
  const area = `${PAD_L},${PAD_T + PH} ${timeLine} ${PAD_L + PW},${PAD_T + PH}`;

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">キャッシュの実効アクセス時間</h4>
        <p className="widget-desc">
          ヒット率のスライダを動かしてみてください。実効アクセス時間はまっすぐ下がりますが、
          「何倍速いか」はヒット率が 90% を超えたあたりから急に伸びます。
        </p>
      </div>

      <div className="widget-row">
        <label className="widget-field">
          <span>キャッシュ（ns）</span>
          <input
            type="number"
            min={1}
            max={100}
            value={cacheNs}
            onChange={(e) => setCacheNs(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
          />
        </label>
        <input
          className="slider"
          type="range"
          min={1}
          max={100}
          value={cacheNs}
          onChange={(e) => setCacheNs(Number(e.target.value))}
          aria-label="キャッシュのアクセス時間"
        />
      </div>

      <div className="widget-row">
        <label className="widget-field">
          <span>主記憶（ns）</span>
          <input
            type="number"
            min={1}
            max={500}
            value={mainNs}
            onChange={(e) => setMainNs(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
          />
        </label>
        <input
          className="slider"
          type="range"
          min={1}
          max={500}
          value={mainNs}
          onChange={(e) => setMainNs(Number(e.target.value))}
          aria-label="主記憶のアクセス時間"
        />
      </div>

      <div className="widget-row">
        <label className="widget-field">
          <span>ヒット率（%）</span>
          <input
            type="number"
            min={0}
            max={100}
            value={hitRate}
            onChange={(e) => setHitRate(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
          />
        </label>
        <input
          className="slider"
          type="range"
          min={0}
          max={100}
          value={hitRate}
          onChange={(e) => setHitRate(Number(e.target.value))}
          aria-label="ヒット率"
        />
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">実効アクセス時間</span>
          <span className="out-value mono">{round(effective, 2)} ns</span>
        </div>
        <div className="out-item">
          <span className="out-label">主記憶だけの場合</span>
          <span className="out-value mono">{round(mainNs, 2)} ns</span>
        </div>
        <div className="out-item">
          <span className="out-label">何倍速いか</span>
          <span className="out-value mono">{round(speedup, 2)} 倍</span>
        </div>
        <div className="out-item">
          <span className="out-label">ミス率</span>
          <span className="out-value mono">{round(100 - hitRate, 2)} %</span>
        </div>
      </div>

      <svg className="chart" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="ヒット率と実効アクセス時間">
        {[0, 25, 50, 75, 100].map((p) => (
          <line key={p} className="grid" x1={x(p)} y1={PAD_T} x2={x(p)} y2={PAD_T + PH} />
        ))}
        <line className="axis" x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} />
        <line className="axis" x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} />

        <polygon className="area" points={area} />
        <polyline className="line" points={timeLine} />
        <polyline className="line-2" points={speedLine} />

        <circle className="marker" cx={x(hitRate)} cy={y(effective)} r={4} />

        {[0, 25, 50, 75, 100].map((p) => (
          <text key={p} className="chart-text" x={x(p)} y={PAD_T + PH + 14} textAnchor="middle">
            {p}
          </text>
        ))}
        <text className="chart-text" x={PAD_L - 4} y={PAD_T + 8} textAnchor="end">
          {round(maxTime, 0)}
        </text>
        <text className="chart-text" x={PAD_L - 4} y={PAD_T + PH} textAnchor="end">
          0
        </text>
        <text className="chart-text" x={PAD_L + PW + 4} y={PAD_T + 8} textAnchor="start">
          {round(maxSpeed, 1)}倍
        </text>
        <text className="chart-text" x={PAD_L + PW + 4} y={PAD_T + PH} textAnchor="start">
          1倍
        </text>
        <text className="chart-text" x={PAD_L + PW / 2} y={H - 2} textAnchor="middle">
          ヒット率（%）
        </text>
      </svg>

      <div className="viz-legend">
        <span className="viz-legend-item">
          <span className="viz-swatch active" />
          実効アクセス時間（左目盛・ns）
        </span>
        <span className="viz-legend-item">
          <span className="viz-swatch compare" />
          主記憶だけの場合と比べた倍率（右目盛）
        </span>
      </div>

      <p className="viz-step-label">
        実効アクセス時間 ＝ {round(h, 2)}×{cacheNs}ns ＋ {round(1 - h, 2)}×{mainNs}ns ＝ {round(effective, 2)} ns
      </p>

      <p className="widget-note">
        実効アクセス時間そのものはヒット率に比例してまっすぐ下がりますが、「何倍速いか」は 1÷（ほぼ 0
        に近づくミス率）なので、ヒット率が 100% に近づくほど急激に伸びます。 だから 95% と 99%
        の差が体感では大きく効きます。試験では「ヒット率 h、キャッシュ c、主記憶 m のとき実効アクセス時間は h×c
        ＋（1−h）×m」の式そのものが問われます。
      </p>
    </>
  );
}
