/**
 * 計算ドリル：出題のたびに数値が変わる自動生成問題。
 *
 * 計算問題は同じ問題文を暗記してしまうと本番で崩れるため、
 * 値を振り直して「手順」だけが身に付くようにしている。
 * 生成した問題は復習カード（SRS）には登録しない（同じ問題が二度と現れないため）。
 */

export interface DrillItem {
  question: string;
  choices: string[];
  answer: number;
  /** 計算手順の解説 */
  explanation: string;
}

export interface Drill {
  id: string;
  name: string;
  categoryId: string;
  sectionId: string;
  summary: string;
  generate: () => DrillItem;
}

// ---------------------------------------------------------------- 補助関数

const rnd = (min: number, max: number): number => min + Math.floor(Math.random() * (max - min + 1));

function pick<T>(items: readonly T[]): T {
  return items[rnd(0, items.length - 1)];
}

/** 小数を読みやすく整える（末尾の 0 を落とす） */
function fx(n: number, digits = 2): string {
  return Number(n.toFixed(digits)).toString();
}

/** 正解と誤答候補から 4 択を作る。重複は除き、足りなければ補充関数で埋める */
function build(
  correct: string,
  wrongs: string[],
  fallback?: (i: number) => string,
): { choices: string[]; answer: number } {
  const pool: string[] = [];
  for (const w of wrongs) {
    if (w !== correct && !pool.includes(w)) pool.push(w);
    if (pool.length === 3) break;
  }
  for (let i = 1; pool.length < 3 && i < 60; i++) {
    const extra = fallback ? fallback(i) : String(i);
    if (extra !== correct && !pool.includes(extra)) pool.push(extra);
  }
  const all = [correct, ...pool];
  for (let j = all.length - 1; j > 0; j--) {
    const k = rnd(0, j);
    [all[j], all[k]] = [all[k], all[j]];
  }
  return { choices: all, answer: all.indexOf(correct) };
}

/** 数値の 4 択。ありがちな誤答を先に使い、足りない分は倍率でずらして作る */
function buildNumeric(
  correct: number,
  fmt: (n: number) => string,
  mistakes: number[],
): { choices: string[]; answer: number } {
  const wrongs = mistakes.filter((n) => Number.isFinite(n) && n >= 0).map(fmt);
  const factors = [2, 0.5, 1.5, 0.8, 1.25, 3, 0.25, 1.1, 0.9];
  let fi = 0;
  return build(fmt(correct), wrongs, () => fmt(correct * factors[fi++ % factors.length]));
}

/** 2 進数を 4 桁ずつ区切る */
const group4 = (bits: string): string => bits.replace(/(.{4})(?=.)/g, '$1 ');

/** 立っているビットの重みを「32 + 8 + 4 + 1」の形で返す */
function weightSum(n: number): string {
  const parts: string[] = [];
  for (let b = 15; b >= 0; b--) {
    const w = 2 ** b;
    if ((n & w) !== 0) parts.push(String(w));
  }
  return parts.join(' + ');
}

/** ページ置換をシミュレートしてフォールト回数を返す */
function simulatePage(refs: number[], frames: number, algo: 'FIFO' | 'LRU'): number {
  const mem: number[] = [];
  const lastUsed = new Map<number, number>();
  let faults = 0;
  refs.forEach((p, t) => {
    if (mem.includes(p)) {
      lastUsed.set(p, t);
      return;
    }
    faults += 1;
    if (mem.length >= frames) {
      if (algo === 'FIFO') {
        mem.shift();
      } else {
        let victim = mem[0];
        let oldest = lastUsed.get(victim) ?? -1;
        for (const q of mem) {
          const u = lastUsed.get(q) ?? -1;
          if (u < oldest) {
            victim = q;
            oldest = u;
          }
        }
        mem.splice(mem.indexOf(victim), 1);
      }
    }
    mem.push(p);
    lastUsed.set(p, t);
  });
  return faults;
}

const ipToText = (v: number): string => [24, 16, 8, 0].map((s) => (v >>> s) & 0xff).join('.');

// ---------------------------------------------------------------- ドリル本体

export const DRILLS: Drill[] = [
  {
    id: 'radix',
    name: '基数変換',
    categoryId: 't-basic',
    sectionId: 't-basic-1',
    summary: '10 進 ⇔ 2 進 ⇔ 16 進の変換',
    generate: () => {
      const n = rnd(20, 250);
      const mode = pick(['to2', 'to16', 'from16'] as const);
      if (mode === 'to2') {
        const correct = group4(n.toString(2).padStart(8, '0'));
        const { choices, answer } = build(correct, [
          group4((n + 1).toString(2).padStart(8, '0')),
          group4((n - 1).toString(2).padStart(8, '0')),
          group4((n ^ 0b1000).toString(2).padStart(8, '0')),
          group4((n ^ 0b100000).toString(2).padStart(8, '0')),
        ]);
        return {
          question: `10 進数 ${n} を 8 桁の 2 進数で表したものはどれか。`,
          choices,
          answer,
          explanation: `重みの大きい方から引いていくと ${n} = ${weightSum(n)}。対応するビットを立てて ${correct} となる。2 で割った余りを下から読む方法でも同じ結果になる。`,
        };
      }
      if (mode === 'to16') {
        const correct = n.toString(16).toUpperCase();
        const { choices, answer } = build(correct, [
          (n + 1).toString(16).toUpperCase(),
          n.toString(8),
          [...n.toString(16).toUpperCase()].reverse().join(''),
          (n - 16).toString(16).toUpperCase(),
        ]);
        return {
          question: `10 進数 ${n} を 16 進数で表したものはどれか。`,
          choices,
          answer,
          explanation: `2 進数にすると ${group4(n.toString(2).padStart(8, '0'))}。これを 4 桁ずつ区切って 16 進の 1 桁に置き換えると ${correct} になる。16 で割った商と余りから求めても同じ。`,
        };
      }
      const hex = n.toString(16).toUpperCase();
      const correct = String(n);
      const { choices, answer } = build(correct, [
        String(n + 16),
        String(n - 10),
        String(n * 2),
        String(Math.floor(n / 2)),
      ]);
      return {
        question: `16 進数 ${hex} を 10 進数で表したものはどれか。`,
        choices,
        answer,
        explanation: `各桁に 16 の累乗の重みを掛けて足す。${hex} は 2 進数で ${group4(n.toString(2).padStart(8, '0'))} なので、${weightSum(n)} = ${n}。`,
      };
    },
  },

  {
    id: 'twos',
    name: '2 の補数',
    categoryId: 't-basic',
    sectionId: 't-basic-1',
    summary: '負数のビット表現と表現できる範囲',
    generate: () => {
      if (Math.random() < 0.3) {
        const bits = pick([8, 16, 32]);
        const correct = `−${2 ** (bits - 1)} 〜 ${2 ** (bits - 1) - 1}`;
        const { choices, answer } = build(correct, [
          `−${2 ** (bits - 1) - 1} 〜 ${2 ** (bits - 1) - 1}`,
          `−${2 ** (bits - 1)} 〜 ${2 ** (bits - 1)}`,
          `0 〜 ${2 ** bits - 1}`,
          `−${2 ** bits} 〜 ${2 ** bits - 1}`,
        ]);
        return {
          question: `${bits} ビットの 2 進数を 2 の補数で表現するとき、表せる整数の範囲はどれか。`,
          choices,
          answer,
          explanation: `n ビットの 2 の補数の範囲は −2^(n−1) 〜 2^(n−1)−1。${bits} ビットなら −${2 ** (bits - 1)} 〜 ${2 ** (bits - 1) - 1} で、負の側が 1 つ多い。0 〜 ${2 ** bits - 1} は符号なしの範囲。`,
        };
      }
      const x = rnd(3, 120);
      const twos = (256 - x) & 0xff;
      const correct = group4(twos.toString(2).padStart(8, '0'));
      const { choices, answer } = build(correct, [
        group4((255 - x).toString(2).padStart(8, '0')),
        group4(x.toString(2).padStart(8, '0')),
        group4(((256 - x + 1) & 0xff).toString(2).padStart(8, '0')),
      ]);
      return {
        question: `8 ビットの 2 の補数表現で −${x} を表したものはどれか。`,
        choices,
        answer,
        explanation: `${x} は ${group4(x.toString(2).padStart(8, '0'))}。全ビットを反転して ${group4((255 - x).toString(2).padStart(8, '0'))}（1 の補数）、これに 1 を加えて ${correct}。検算すると ${x} と足したとき 9 桁目の桁あふれを捨てて 0 になる。`,
      };
    },
  },

  {
    id: 'shift',
    name: 'シフト演算',
    categoryId: 't-basic',
    sectionId: 't-basic-2',
    summary: 'シフトと乗除算の対応',
    generate: () => {
      const k = rnd(1, 4);
      if (Math.random() < 0.5) {
        const v = rnd(3, 30);
        const correct = v * 2 ** k;
        const { choices, answer } = buildNumeric(correct, (n) => String(Math.round(n)), [
          v * k,
          v + 2 ** k,
          Math.floor(v / 2 ** k),
          v * 2 ** (k + 1),
        ]);
        return {
          question: `10 進数 ${v} を ${k} ビット左に論理シフトした結果を 10 進数で表したものはどれか。`,
          choices,
          answer,
          explanation: `左シフト 1 ビットで 2 倍になるので、${k} ビットでは 2^${k} = ${2 ** k} 倍。${v} × ${2 ** k} = ${correct}。右シフトなら 2^n で割ることになる。`,
        };
      }
      const v = rnd(2, 30) * 2 ** k;
      const correct = v / 2 ** k;
      const { choices, answer } = buildNumeric(correct, (n) => `−${Math.round(n)}`, [
        v / k,
        v * 2 ** k,
        Math.abs(v - 2 ** k),
      ]);
      return {
        question: `8 ビットの符号付き整数 −${v} を ${k} ビット算術右シフトした結果はどれか。`,
        choices,
        answer,
        explanation: `算術右シフトは空いた上位ビットに符号ビットと同じ値を入れるため、負数のまま 2^${k} = ${2 ** k} で割った値になる。−${v} ÷ ${2 ** k} = −${correct}。論理シフトだと 0 が入るので正の大きな値になってしまう。`,
      };
    },
  },

  {
    id: 'cpi',
    name: 'CPI と MIPS',
    categoryId: 't-hw',
    sectionId: 't-hw-1',
    summary: '平均 CPI から実行時間を求める',
    generate: () => {
      const p = pick([20, 25, 40, 50, 60, 75, 80]);
      const c1 = rnd(2, 5);
      const c2 = c1 + rnd(1, 4);
      const ghz = pick([1, 2, 2.5, 4, 5]);
      const cpi = (p / 100) * c1 + (1 - p / 100) * c2;
      const period = 1 / ghz;
      const correct = cpi * period;
      const { choices, answer } = buildNumeric(correct, (n) => `${fx(n, 2)} ナノ秒`, [
        cpi,
        ((c1 + c2) / 2) * period,
        cpi * ghz,
      ]);
      return {
        question: `クロック周波数 ${ghz} GHz のプロセッサで、命令の ${p}% が ${c1} クロック、残り ${100 - p}% が ${c2} クロックで実行される。平均命令実行時間はどれか。`,
        choices,
        answer,
        explanation: `平均 CPI = ${p / 100} × ${c1} + ${fx(1 - p / 100)} × ${c2} = ${fx(cpi)} クロック。${ghz} GHz のクロック周期は 1 ÷ ${ghz} = ${fx(period, 3)} ナノ秒なので、${fx(cpi)} × ${fx(period, 3)} = ${fx(correct, 2)} ナノ秒。加重平均を先に出してから周期を掛けるのが手順。`,
      };
    },
  },

  {
    id: 'cache',
    name: 'キャッシュの実効アクセス時間',
    categoryId: 't-hw',
    sectionId: 't-hw-2',
    summary: 'ヒット率から平均アクセス時間を求める',
    generate: () => {
      const t1 = pick([4, 5, 8, 10, 12, 15, 20, 25]);
      const t2 = pick([50, 60, 70, 80, 100, 120, 150, 200, 250]);
      const h = pick([0.7, 0.75, 0.8, 0.85, 0.88, 0.9, 0.92, 0.95, 0.96, 0.98]);
      const correct = h * t1 + (1 - h) * t2;
      const { choices, answer } = buildNumeric(correct, (n) => `${fx(n, 1)} ナノ秒`, [
        h * t2 + (1 - h) * t1,
        (t1 + t2) / 2,
        t2 - h * t1,
      ]);
      return {
        question: `キャッシュのアクセス時間が ${t1} ナノ秒、主記憶のアクセス時間が ${t2} ナノ秒、キャッシュのヒット率が ${Math.round(h * 100)}% のとき、実効アクセス時間はどれか。`,
        choices,
        answer,
        explanation: `実効アクセス時間 = ヒット率 × キャッシュ + (1 − ヒット率) × 主記憶 = ${h} × ${t1} + ${fx(1 - h)} × ${t2} = ${fx(correct, 1)} ナノ秒。ヒット率を % のまま掛けないよう注意する。`,
      };
    },
  },

  {
    id: 'availability',
    name: '稼働率（直列・並列）',
    categoryId: 't-sys',
    sectionId: 't-sys-1',
    summary: '構成から全体の稼働率を求める',
    generate: () => {
      const a = pick([0.7, 0.75, 0.8, 0.85, 0.88, 0.9, 0.92, 0.95, 0.96, 0.98, 0.99]);
      const mode = pick(['serial2', 'parallel2', 'serial3', 'parallel3'] as const);
      const n = mode.endsWith('3') ? 3 : 2;
      const serial = mode.startsWith('serial');
      const correct = serial ? a ** n : 1 - (1 - a) ** n;
      const other = serial ? 1 - (1 - a) ** n : a ** n;
      const { choices, answer } = buildNumeric(correct, (v) => fx(v, 4), [other, a * n, 1 - a ** n]);
      return {
        question: `稼働率がいずれも ${a} の装置 ${n} 台を${serial ? '直列' : '並列'}に接続したシステム全体の稼働率はどれか。${serial ? 'すべてが動作している必要がある。' : '1 台でも動作していればよい。'}`,
        choices,
        answer,
        explanation: serial
          ? `直列構成は全部が動いている必要があるので稼働率の積になる。${a} の ${n} 乗 = ${fx(correct, 4)}。台数を増やすほど下がる。`
          : `並列構成は「全部が同時に停止する確率」を 1 から引く。1 − (1 − ${a}) の ${n} 乗 = 1 − ${fx((1 - a) ** n, 4)} = ${fx(correct, 4)}。冗長化すると大きく上がる。`,
      };
    },
  },

  {
    id: 'mtbf',
    name: 'MTBF と稼働率',
    categoryId: 't-sys',
    sectionId: 't-sys-1',
    summary: '平均故障間隔と平均修理時間から稼働率を求める',
    generate: () => {
      const m = rnd(10, 48) * 20;
      const r = rnd(1, 10) * 5;
      const correct = (m / (m + r)) * 100;
      const { choices, answer } = buildNumeric(correct, (n) => `${fx(n, 2)}%`, [
        (r / (m + r)) * 100,
        (m / r) * 100,
        ((m - r) / m) * 100,
      ]);
      return {
        question: `MTBF が ${m} 時間、MTTR が ${r} 時間のシステムの稼働率はどれか。`,
        choices,
        answer,
        explanation: `稼働率 = MTBF ÷ (MTBF + MTTR) = ${m} ÷ ${m + r} = ${fx(correct / 100, 4)}、すなわち ${fx(correct, 2)}%。MTBF を伸ばすだけでなく MTTR を短くしても稼働率は上がる。`,
      };
    },
  },

  {
    id: 'queueing',
    name: '待ち行列（M/M/1）',
    categoryId: 't-basic',
    sectionId: 't-basic-3',
    summary: '利用率から待ち時間・応答時間を求める',
    generate: () => {
      const rho = pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9]);
      const s = pick([5, 10, 15, 20, 25, 30, 40, 50, 60]);
      const wait = (rho / (1 - rho)) * s;
      const resp = s / (1 - rho);
      const askWait = Math.random() < 0.5;
      const correct = askWait ? wait : resp;
      const { choices, answer } = buildNumeric(correct, (n) => `${fx(n, 1)} ミリ秒`, [
        askWait ? resp : wait,
        s * rho,
        s / rho,
      ]);
      return {
        question: `M/M/1 の待ち行列モデルで、窓口の利用率が ${rho}、平均サービス時間が ${s} ミリ秒のとき、平均${askWait ? '待ち' : '応答'}時間はどれか。`,
        choices,
        answer,
        explanation: askWait
          ? `平均待ち時間 = ρ ÷ (1 − ρ) × サービス時間 = ${rho} ÷ ${fx(1 - rho)} × ${s} = ${fx(wait, 1)} ミリ秒。応答時間はこれにサービス時間を足した ${fx(resp, 1)} ミリ秒。`
          : `平均応答時間 = 1 ÷ (1 − ρ) × サービス時間 = 1 ÷ ${fx(1 - rho)} × ${s} = ${fx(resp, 1)} ミリ秒。うち待ち時間は ${fx(wait, 1)} ミリ秒。ρ が 1 に近づくと急激に発散する。`,
      };
    },
  },

  {
    id: 'transfer',
    name: '伝送時間',
    categoryId: 't-nw',
    sectionId: 't-nw-5',
    summary: '回線速度と伝送効率から転送時間を求める',
    generate: () => {
      const mbps = pick([10, 50, 100, 200, 500, 1000]);
      const eff = pick([0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9]);
      const mb = pick([2, 5, 8, 10, 20, 30, 50, 100, 200, 500]);
      const correct = (mb * 8) / (mbps * eff);
      const { choices, answer } = buildNumeric(correct, (n) => `${fx(n, 2)} 秒`, [
        mb / (mbps * eff),
        (mb * 8) / mbps,
        (mb * 8 * eff) / mbps,
      ]);
      return {
        question: `伝送速度 ${mbps} M ビット/秒、伝送効率 ${Math.round(eff * 100)}% の回線で ${mb} M バイトのデータを送信するのに要する時間はどれか。`,
        choices,
        answer,
        explanation: `データ量をビットに直すと ${mb} × 8 = ${mb * 8} M ビット。実効速度は ${mbps} × ${eff} = ${fx(mbps * eff)} M ビット/秒。${mb * 8} ÷ ${fx(mbps * eff)} = ${fx(correct, 2)} 秒。バイトからビットへの ×8 を忘れないこと。`,
      };
    },
  },

  {
    id: 'subnet-hosts',
    name: 'サブネットの収容台数',
    categoryId: 't-nw',
    sectionId: 't-nw-2',
    summary: 'プレフィックス長と収容できるホスト数',
    generate: () => {
      if (Math.random() < 0.5) {
        const prefix = rnd(20, 30);
        const correct = 2 ** (32 - prefix) - 2;
        const { choices, answer } = buildNumeric(correct, (n) => `${Math.round(n)} 台`, [
          2 ** (32 - prefix),
          2 ** (32 - prefix) - 1,
          2 ** (31 - prefix) - 2,
        ]);
        return {
          question: `プレフィックス長が /${prefix} のサブネットに割り当てられるホストアドレスの最大数はどれか。`,
          choices,
          answer,
          explanation: `ホスト部は 32 − ${prefix} = ${32 - prefix} ビットなので 2^${32 - prefix} = ${2 ** (32 - prefix)} 通り。ネットワークアドレスとブロードキャストアドレスの 2 つは割り当てられないので ${correct} 台。この「−2」が定番の引っかけ。`,
        };
      }
      const need = pick([6, 10, 14, 25, 30, 50, 60, 100, 120, 200, 300, 400, 500, 1000, 2000]);
      let hostBits = 1;
      while (2 ** hostBits - 2 < need) hostBits += 1;
      const prefix = 32 - hostBits;
      const correct = `/${prefix}`;
      const { choices, answer } = build(correct, [`/${prefix + 1}`, `/${prefix - 1}`, `/${prefix + 2}`]);
      return {
        question: `${need} 台のホストを収容できる最小のサブネットのプレフィックス長はどれか。`,
        choices,
        answer,
        explanation: `ホスト数は 2^n − 2 なので、${need} 台には n = ${hostBits} ビット必要（2^${hostBits} − 2 = ${2 ** hostBits - 2} 台）。プレフィックス長は 32 − ${hostBits} = ${prefix} で /${prefix}。1 段小さい /${prefix + 1} では ${2 ** (hostBits - 1) - 2} 台しか収容できない。`,
      };
    },
  },

  {
    id: 'subnet-addr',
    name: 'ネットワークアドレスの算出',
    categoryId: 't-nw',
    sectionId: 't-nw-2',
    summary: 'IP アドレスとプレフィックスから所属ネットワークを求める',
    generate: () => {
      const prefix = pick([25, 26, 27, 28, 29]);
      const base = pick([(0xc0a80000 | (rnd(0, 20) << 8)) >>> 0, (0xac100000 | (rnd(0, 20) << 8)) >>> 0]);
      const host = rnd(1, 254);
      const ip = (base | host) >>> 0;
      const mask = (0xffffffff << (32 - prefix)) >>> 0;
      const network = (ip & mask) >>> 0;
      const broadcast = (network | (~mask >>> 0)) >>> 0;
      const block = 256 - (mask & 0xff);
      const askNetwork = Math.random() < 0.5;
      const correct = ipToText(askNetwork ? network : broadcast);
      const { choices, answer } = build(correct, [
        ipToText(askNetwork ? broadcast : network),
        ipToText(base >>> 0),
        ipToText((network + block) >>> 0),
        ipToText((network + 1) >>> 0),
      ]);
      return {
        question: `IP アドレス ${ipToText(ip)}/${prefix} が所属するネットワークの${askNetwork ? 'ネットワークアドレス' : 'ブロードキャストアドレス'}はどれか。`,
        choices,
        answer,
        explanation: `/${prefix} のサブネットマスクは ${ipToText(mask)}。第 4 オクテットのブロックサイズは 256 − ${mask & 0xff} = ${block} なので、0, ${block}, ${block * 2}, … と区切る。${host} は ${network & 0xff} 番のブロックに入るため、ネットワークアドレスは ${ipToText(network)}、ブロードキャストは ${ipToText(broadcast)} となる。`,
      };
    },
  },

  {
    id: 'page',
    name: 'ページフォールト回数',
    categoryId: 't-sw',
    sectionId: 't-sw-2',
    summary: 'FIFO と LRU のページ置換をたどる',
    generate: () => {
      const pages = rnd(4, 5);
      const refs = Array.from({ length: 12 }, () => rnd(1, pages));
      const frames = rnd(2, 3);
      const algo = pick(['FIFO', 'LRU'] as const);
      const correct = simulatePage(refs, frames, algo);
      const other = simulatePage(refs, frames, algo === 'FIFO' ? 'LRU' : 'FIFO');
      const { choices, answer } = buildNumeric(correct, (n) => `${Math.round(n)} 回`, [
        other,
        correct + 1,
        correct - 1,
        new Set(refs).size,
      ]);
      return {
        question: `実記憶のページ枠が ${frames} のとき、ページ参照列 ${refs.join(', ')} を ${algo} 方式で処理すると、ページフォールトは何回発生するか。最初の読込みもフォールトに数える。`,
        choices,
        answer,
        explanation: `枠を表にして 1 参照ずつ埋めていくと ${correct} 回になる。${algo === 'FIFO' ? '最も古く読み込んだページを追い出す' : '最も長く参照されていないページを追い出す'}のが ${algo} の規則で、もう一方の方式なら ${other} 回になる。`,
      };
    },
  },

  {
    id: 'bep',
    name: '損益分岐点',
    categoryId: 's-law',
    sectionId: 's-law-1',
    summary: '固定費と変動費率から損益分岐点売上高を求める',
    generate: () => {
      const fixed = pick([150, 200, 240, 300, 360, 400, 450, 480, 540, 600, 720, 900]);
      const ratio = pick([0.25, 0.3, 0.4, 0.45, 0.5, 0.6, 0.625, 0.7, 0.75, 0.8]);
      const correct = fixed / (1 - ratio);
      const { choices, answer } = buildNumeric(correct, (n) => `${fx(n, 0)} 万円`, [
        fixed / ratio,
        fixed * (1 - ratio),
        fixed / (1 + ratio),
        fixed,
      ]);
      return {
        question: `固定費が ${fixed} 万円、変動費率が ${ratio} の企業の損益分岐点売上高はどれか。`,
        choices,
        answer,
        explanation: `限界利益率 = 1 − 変動費率 = ${fx(1 - ratio)}。損益分岐点売上高 = 固定費 ÷ 限界利益率 = ${fixed} ÷ ${fx(1 - ratio)} = ${fx(correct, 0)} 万円。この売上高のとき利益がちょうど 0 になる。`,
      };
    },
  },

  {
    id: 'depreciation',
    name: '減価償却',
    categoryId: 's-law',
    sectionId: 's-law-4',
    summary: '定額法の償却費と帳簿価額',
    generate: () => {
      const life = pick([4, 5, 6, 8]);
      const acq = life * pick([30, 45, 60, 75, 90]);
      const annual = acq / life;
      const years = rnd(1, life - 1);
      const correct = acq - annual * years;
      const { choices, answer } = buildNumeric(correct, (n) => `${fx(n, 0)} 万円`, [
        annual * years,
        acq - annual,
        annual,
      ]);
      return {
        question: `取得原価 ${acq} 万円、耐用年数 ${life} 年、残存価額 0 の設備を定額法で償却する。${years} 年後の帳簿価額はどれか。`,
        choices,
        answer,
        explanation: `定額法の年間償却費 = 取得原価 ÷ 耐用年数 = ${acq} ÷ ${life} = ${fx(annual, 0)} 万円。${years} 年ぶんで ${fx(annual * years, 0)} 万円を償却するので、帳簿価額は ${acq} − ${fx(annual * years, 0)} = ${fx(correct, 0)} 万円。定率法なら初期の償却額が大きくなる。`,
      };
    },
  },

  {
    id: 'evm',
    name: 'EVM の指標',
    categoryId: 'm-pm',
    sectionId: 'm-pm-2',
    summary: 'PV・EV・AC から差異と効率を求める',
    generate: () => {
      // 差異が 0 になると選択肢が重複し、AC が 0 になると除算が破綻するため、
      // 増減幅は非ゼロの値だけから選ぶ
      const delta = [-3, -2, -1, 1, 2, 3] as const;
      const pv = rnd(6, 12) * 50;
      const ev = pv + pick(delta) * 25;
      const ac = ev + pick(delta) * 25;
      const sv = ev - pv;
      const cv = ev - ac;
      const kind = pick(['SV', 'CV', 'SPI', 'CPI'] as const);
      const sign = (v: number): string => `${v >= 0 ? '+' : '−'}${Math.abs(v)} 万円`;

      if (kind === 'SV' || kind === 'CV') {
        const correct = kind === 'SV' ? sv : cv;
        const { choices, answer } = build(
          sign(correct),
          [sign(-correct), sign(kind === 'SV' ? cv : sv), sign(pv - ac), sign(correct + 25)],
          (i) => sign(correct + 25 * (i + 1)),
        );
        return {
          question: `あるプロジェクトの PV が ${pv} 万円、EV が ${ev} 万円、AC が ${ac} 万円である。${kind}（${kind === 'SV' ? 'スケジュール差異' : 'コスト差異'}）はどれか。`,
          choices,
          answer,
          explanation: `${kind} = EV − ${kind === 'SV' ? 'PV' : 'AC'} = ${ev} − ${kind === 'SV' ? pv : ac} = ${correct} 万円。${
            correct < 0
              ? kind === 'SV'
                ? '負の値なので予定より遅れている。'
                : '負の値なので予算を超過している。'
              : kind === 'SV'
                ? '正の値なので予定より進んでいる。'
                : '正の値なので予算内に収まっている。'
          }どちらも EV から引くのが要点。`,
        };
      }

      const correct = kind === 'SPI' ? ev / pv : ev / ac;
      const { choices, answer } = buildNumeric(correct, (n) => fx(n, 2), [
        kind === 'SPI' ? ev / ac : ev / pv,
        1 / correct,
        correct + 0.1,
      ]);
      return {
        question: `あるプロジェクトの PV が ${pv} 万円、EV が ${ev} 万円、AC が ${ac} 万円である。${kind}（${kind === 'SPI' ? 'スケジュール効率指数' : 'コスト効率指数'}）はどれか。`,
        choices,
        answer,
        explanation: `${kind} = EV ÷ ${kind === 'SPI' ? 'PV' : 'AC'} = ${ev} ÷ ${kind === 'SPI' ? pv : ac} = ${fx(correct, 2)}。1 未満なら${kind === 'SPI' ? '進捗が遅れている' : '予算を超過している'}ことを示す。`,
      };
    },
  },

  {
    id: 'fp',
    name: 'ファンクションポイント法',
    categoryId: 'm-pm',
    sectionId: 'm-pm-3',
    summary: '機能数と重みから規模を見積もる',
    generate: () => {
      const ei = rnd(2, 6);
      const eo = rnd(1, 5);
      const eq = rnd(1, 4);
      const ilf = rnd(1, 4);
      const raw = ei * 4 + eo * 5 + eq * 4 + ilf * 7;
      const adj = pick([0.75, 0.8, 0.9, 1.0, 1.1, 1.2]);
      const correct = raw * adj;
      const { choices, answer } = buildNumeric(correct, (n) => `${fx(n, 1)} FP`, [
        raw,
        raw / adj,
        (ei + eo + eq + ilf) * adj,
      ]);
      return {
        question: `外部入力 ${ei} 個（重み 4）、外部出力 ${eo} 個（重み 5）、外部照会 ${eq} 個（重み 4）、内部論理ファイル ${ilf} 個（重み 7）のシステムがある。調整係数を ${adj} とするとき、調整済みファンクションポイントはどれか。`,
        choices,
        answer,
        explanation: `未調整 FP = ${ei}×4 + ${eo}×5 + ${eq}×4 + ${ilf}×7 = ${raw}。調整済み FP = ${raw} × ${adj} = ${fx(correct, 1)} FP。FP は利用者から見える機能で数えるので、開発言語を変えても値は変わらない。`,
      };
    },
  },

  {
    id: 'commpath',
    name: 'コミュニケーションパス',
    categoryId: 'm-pm',
    sectionId: 'm-pm-1',
    summary: '要員数と連絡経路の数',
    generate: () => {
      const a = rnd(3, 9);
      const b = a + rnd(2, 6);
      const pa = (a * (a - 1)) / 2;
      const pb = (b * (b - 1)) / 2;
      const correct = pb - pa;
      const { choices, answer } = buildNumeric(correct, (n) => `${Math.round(n)} 本`, [
        pb,
        b - a,
        ((b - a) * (b - a - 1)) / 2,
        pa,
      ]);
      return {
        question: `プロジェクトのメンバが ${a} 人から ${b} 人に増えたとき、コミュニケーションパスは何本増えるか。`,
        choices,
        answer,
        explanation: `n 人のときのパス数は n(n−1)/2。${a} 人では ${pa} 本、${b} 人では ${pb} 本なので、増加は ${pb} − ${pa} = ${correct} 本。人数の増加に対して調整コストが急増することを示す計算。`,
      };
    },
  },

  {
    id: 'expected',
    name: '期待値',
    categoryId: 't-basic',
    sectionId: 't-basic-3',
    summary: '確率と金額から期待値を求める',
    generate: () => {
      const prize = pick([500, 1000, 1500, 2000, 3000, 5000, 8000, 10000]);
      const k = pick([10, 20, 25, 40, 50, 80, 100, 200]);
      const cost = pick([10, 20, 30, 50, 80, 100]);
      const ev = prize / k;
      const correct = ev - cost;
      const yen = (v: number): string => `${v >= 0 ? '' : '−'}${fx(Math.abs(v), 1)} 円`;
      const { choices, answer } = build(yen(correct), [
        yen(ev),
        yen(ev + cost),
        yen(cost - ev),
        yen(prize - cost),
      ]);
      return {
        question: `1 回 ${cost} 円で引けるくじがある。確率 1/${k} で ${prize} 円が当たり、外れると 0 円である。1 回引いたときの期待利益（賞金の期待値から参加費を引いた値）はどれか。`,
        choices,
        answer,
        explanation: `賞金の期待値 = ${prize} × 1/${k} = ${fx(ev, 1)} 円。ここから参加費 ${cost} 円を引いて ${fx(correct, 1)} 円。${correct < 0 ? '期待値が負なので、引き続けるほど損をする。' : '期待値が正なので、回数を重ねるほど得になる。'}`,
      };
    },
  },

  {
    id: 'imagesize',
    name: '画像のデータ量',
    categoryId: 't-ui',
    sectionId: 't-ui-1',
    summary: '画素数と色情報からデータ量を求める',
    generate: () => {
      const [w, h] = pick([
        [640, 480],
        [800, 600],
        [1024, 768],
        [1280, 800],
        [1280, 960],
        [1440, 900],
        [1600, 1200],
        [1920, 1080],
        [2048, 1536],
        [2560, 1440],
      ] as const);
      const bits = pick([8, 16, 24, 32]);
      const bytes = (w * h * bits) / 8;
      const correct = bytes / 1024 / 1024;
      const { choices, answer } = buildNumeric(correct, (n) => `${fx(n, 2)} M バイト`, [
        (w * h * bits) / 1024 / 1024,
        bytes / 1000 / 1000,
        (w * h) / 1024 / 1024,
      ]);
      return {
        question: `${w} × ${h} 画素、1 画素あたり ${bits} ビットで表現される画像 1 枚のデータ量はおよそどれか。1 M バイト = 1024 × 1024 バイトとする。`,
        choices,
        answer,
        explanation: `${w} × ${h} × ${bits} ÷ 8 = ${fx(bytes, 0)} バイト。1024 × 1024 で割ると ${fx(correct, 2)} M バイト。ビットからバイトへの ÷8 を忘れると 8 倍の値になってしまう。`,
      };
    },
  },

  {
    id: 'hdd',
    name: 'HDD のアクセス時間',
    categoryId: 't-hw',
    sectionId: 't-hw-4',
    summary: 'シーク時間・回転待ち・転送時間の合計',
    generate: () => {
      const rpm = pick([4200, 5400, 7200, 10000, 15000]);
      const seek = pick([3, 4, 5, 8, 10]);
      const kb = pick([4, 8, 16, 32]);
      const rate = pick([50, 100, 200]);
      const rotation = 60000 / rpm;
      const latency = rotation / 2;
      const transferMs = (kb / 1024 / rate) * 1000;
      const correct = seek + latency + transferMs;
      const { choices, answer } = buildNumeric(correct, (n) => `${fx(n, 2)} ミリ秒`, [
        seek + rotation + transferMs,
        seek + latency,
        latency + transferMs,
      ]);
      return {
        question: `平均シーク時間 ${seek} ミリ秒、回転速度 ${rpm} 回転/分、転送速度 ${rate} M バイト/秒の磁気ディスクから ${kb} K バイトのデータを読み出すときの平均アクセス時間はどれか。`,
        choices,
        answer,
        explanation: `1 回転は 60000 ÷ ${rpm} = ${fx(rotation, 2)} ミリ秒なので、平均回転待ちはその半分の ${fx(latency, 2)} ミリ秒。転送時間は ${kb} K バイト ÷ ${rate} M バイト/秒 = ${fx(transferMs, 3)} ミリ秒。合計 ${seek} + ${fx(latency, 2)} + ${fx(transferMs, 3)} = ${fx(correct, 2)} ミリ秒。回転待ちを 1 回転ぶんにしてしまうのが定番の誤り。`,
      };
    },
  },

  {
    id: 'binsearch',
    name: '2 分探索の比較回数',
    categoryId: 't-algo',
    sectionId: 't-algo-2',
    summary: '整列済みデータの探索回数',
    generate: () => {
      const n = pick([63, 127, 255, 100, 500, 1000, 2000, 5000, 10000, 50000, 100000, 250000, 1000000]);
      const correct = Math.floor(Math.log2(n)) + 1;
      const { choices, answer } = buildNumeric(correct, (v) => `${Math.round(v)} 回`, [
        Math.floor(Math.log2(n)),
        Math.ceil(Math.log10(n)),
        n / 2,
        Math.ceil(Math.sqrt(n)),
      ]);
      return {
        question: `昇順に整列された ${n.toLocaleString('en-US')} 件のデータを 2 分探索するとき、最大何回の比較で目的のデータの有無を判定できるか。`,
        choices,
        answer,
        explanation: `1 回の比較で探索範囲が半分になるので、必要な回数は log2(${n.toLocaleString('en-US')}) を超えない最大の整数に 1 を足した ${correct} 回。線形探索なら最大 ${n.toLocaleString('en-US')} 回で、件数が増えるほど差が開く。`,
      };
    },
  },

  {
    id: 'keys',
    name: '暗号鍵の必要数',
    categoryId: 't-sec',
    sectionId: 't-sec-2',
    summary: '共通鍵方式と公開鍵方式で必要な鍵の数',
    generate: () => {
      const n = rnd(5, 30);
      const common = (n * (n - 1)) / 2;
      const publicKeys = n * 2;
      const askCommon = Math.random() < 0.6;
      const correct = askCommon ? common : publicKeys;
      const { choices, answer } = buildNumeric(correct, (v) => `${Math.round(v)} 個`, [
        askCommon ? publicKeys : common,
        n,
        n * (n - 1),
        n * n,
      ]);
      return {
        question: `${n} 人が互いに暗号通信を行う。${askCommon ? '共通鍵暗号方式' : '公開鍵暗号方式'}で必要となる鍵の総数はどれか。`,
        choices,
        answer,
        explanation: askCommon
          ? `共通鍵方式では 2 人の組合せごとに 1 つの鍵が要るので n(n−1)/2 = ${n} × ${n - 1} ÷ 2 = ${common} 個。人数が増えると急増するのが課題で、公開鍵方式なら 2n = ${publicKeys} 個で済む。`
          : `公開鍵方式では各人が公開鍵と秘密鍵のペアを 1 組持つだけなので 2n = ${publicKeys} 個。共通鍵方式だと n(n−1)/2 = ${common} 個も必要になる。`,
      };
    },
  },
];

export const drillById = (id: string): Drill | undefined => DRILLS.find((d) => d.id === id);
