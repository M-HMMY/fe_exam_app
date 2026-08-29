import { useState, type JSX } from 'react';

/**
 * IPv4 のサブネット計算ウィジェット。
 * アドレスとプレフィックス長から、マスク・ネットワーク／ブロードキャストアドレス・
 * 利用可能ホスト範囲・ホスト数 2^n − 2 を求め、境界のオクテットをビットで可視化する。
 */
export const widgetId = 'subnet';

function parseIpv4(text: string): number[] | null {
  const parts = text.trim().split('.');
  if (parts.length !== 4) return null;
  const octets: number[] = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n > 255) return null;
    octets.push(n);
  }
  return octets;
}

function toDotted(value: number): string {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 0xff).join('.');
}

export default function SubnetCalculator(): JSX.Element {
  const [text, setText] = useState('172.16.20.100');
  const [prefix, setPrefix] = useState(26);

  const octets = parseIpv4(text);

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">サブネットを計算する</h4>
        <p className="widget-desc">
          IPv4 アドレスとプレフィックス長を変えると、サブネットマスク・ネットワークアドレス・
          ブロードキャストアドレス・割り当てられるホストの範囲が同時に変わります。
        </p>
      </div>

      <div className="widget-row">
        <label className="widget-field">
          <span>IP アドレス</span>
          <input
            type="text"
            className="wide"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="172.16.20.100"
          />
        </label>
        <label className="widget-field">
          <span>プレフィックス長</span>
          <input
            type="number"
            min={8}
            max={30}
            value={prefix}
            onChange={(e) => setPrefix(Math.max(8, Math.min(30, Number(e.target.value) || 8)))}
          />
        </label>
      </div>

      <div className="widget-row">
        <span className="widget-field mono">/{prefix}</span>
        <input
          className="slider"
          type="range"
          min={8}
          max={30}
          value={prefix}
          onChange={(e) => setPrefix(Number(e.target.value))}
          aria-label="プレフィックス長のスライダ"
        />
      </div>

      {octets === null ? (
        <p className="widget-note" style={{ color: 'var(--ng)', fontWeight: 700 }}>
          IP アドレスの形式が正しくありません。0〜255 の数値をピリオドで区切って 4 つ入力してください（例
          192.168.10.1）。
        </p>
      ) : (
        <SubnetResult octets={octets} prefix={prefix} />
      )}
    </>
  );
}

function SubnetResult({ octets, prefix }: { octets: number[]; prefix: number }): JSX.Element {
  const ip = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
  const mask = (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const hostBits = 32 - prefix;
  const hosts = 2 ** hostBits - 2;

  // プレフィックスの境界が入るオクテット（/24 なら第 4 オクテット）
  const octetIndex = Math.min(3, Math.floor(prefix / 8));
  const netBitsInOctet = Math.max(0, Math.min(8, prefix - octetIndex * 8));
  const octetValue = octets[octetIndex];
  const maskOctet = (mask >>> (8 * (3 - octetIndex))) & 0xff;
  const blockSize = 256 - maskOctet;
  const bits = octetValue.toString(2).padStart(8, '0');
  const blockStart = (network >>> (8 * (3 - octetIndex))) & 0xff;

  return (
    <>
      <div className="viz-bits">
        {[...bits].map((b, i) => (
          <span key={i} className={`viz-bit ${i < netBitsInOctet ? 'on' : ''}`}>
            <span className="viz-bit-value">{b}</span>
            <span className="viz-bit-weight">{2 ** (7 - i)}</span>
          </span>
        ))}
      </div>
      <p className="viz-step-label">
        第 {octetIndex + 1} オクテット（{octetValue}）の 8 ビット。色が付いた {netBitsInOctet} ビットが
        ネットワーク部、残り {8 - netBitsInOctet} ビットがホスト部です。
      </p>
      <div className="viz-legend">
        <span className="viz-legend-item">
          <span className="viz-swatch active" />
          ネットワーク部
        </span>
        <span className="viz-legend-item">
          <span className="viz-swatch" />
          ホスト部
        </span>
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">サブネットマスク</span>
          <span className="out-value mono">{toDotted(mask)}</span>
        </div>
        <div className="out-item">
          <span className="out-label">ネットワークアドレス</span>
          <span className="out-value mono">{toDotted(network)}</span>
        </div>
        <div className="out-item">
          <span className="out-label">ブロードキャストアドレス</span>
          <span className="out-value mono">{toDotted(broadcast)}</span>
        </div>
        <div className="out-item">
          <span className="out-label">利用可能ホスト範囲</span>
          <span className="out-value mono">
            {toDotted((network + 1) >>> 0)} 〜 {toDotted((broadcast - 1) >>> 0)}
          </span>
        </div>
        <div className="out-item">
          <span className="out-label">ホスト数（2^{hostBits} − 2）</span>
          <span className="out-value">{hosts.toLocaleString('ja-JP')} 台</span>
        </div>
        <div className="out-item">
          <span className="out-label">ブロックサイズ</span>
          <span className="out-value">{blockSize}</span>
        </div>
      </div>

      <p className="widget-note">
        手計算の手順：マスク {toDotted(mask)} の区切りとなる第 {octetIndex + 1} オクテットの値は {maskOctet}{' '}
        なので、ブロックサイズ = 256 − {maskOctet} = {blockSize}。第 {octetIndex + 1} オクテットを 0,{' '}
        {blockSize}, {blockSize * 2}, … と {blockSize} 刻みで区切ると、
        {octetValue} は {blockStart} 番のブロックに入ります。だからネットワークアドレスは {toDotted(network)}、
        その 1 つ手前（次のブロックの直前）がブロードキャスト {toDotted(broadcast)} です。
        ネットワークアドレスとブロードキャストアドレスはホストに割り当てられないので、ホスト数は
        2^{hostBits} − 2 = {hosts.toLocaleString('ja-JP')} 台。試験では「必要な台数を収容できる最小のプレフィックス長は？」
        という形でよく問われます。
      </p>
    </>
  );
}
