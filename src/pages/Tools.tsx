import { useState, type JSX } from 'react';
import { Widget, widgetIds } from '../components/Widget';

/** 体験ツール（対話ウィジェット）の一覧。教本の該当箇所にも同じものが埋め込まれている */
const GROUPS: { name: string; note: string; ids: string[] }[] = [
  {
    name: '基礎理論・ハードウェア',
    note: '数の表現とコンピュータの動きを、手を動かして確かめます',
    ids: ['radix', 'twos', 'shift', 'logic', 'cpi', 'cache'],
  },
  {
    name: 'アルゴリズム',
    note: '整列・探索・データ構造の動きをステップごとに再生できます',
    ids: ['sort', 'search', 'stackqueue', 'bstree'],
  },
  {
    name: 'システム・ネットワーク',
    note: '計算問題の「なぜその式になるか」を数値を動かして体感します',
    ids: ['subnet', 'page', 'availability', 'queueing'],
  },
  {
    name: '経営・会計',
    note: 'グラフで損益の構造をつかみます',
    ids: ['bep'],
  },
];

export function Tools(): JSX.Element {
  const [openGroup, setOpenGroup] = useState<string>(GROUPS[0].name);
  const known = new Set(GROUPS.flatMap((g) => g.ids));
  const others = widgetIds.filter((id) => !known.has(id));

  return (
    <div className="page">
      <header className="page-head">
        <h1>体験ツール</h1>
        <p className="lead">
          文章だけでは掴みにくいところを、数値を動かして確かめるための道具です。教本の該当セクションにも同じものが埋め込まれています。
        </p>
      </header>

      <div className="chips">
        {GROUPS.map((g) => (
          <button
            key={g.name}
            type="button"
            className={`chip ${openGroup === g.name ? 'on' : ''}`}
            onClick={() => setOpenGroup(g.name)}
          >
            {g.name}（{g.ids.filter((id) => widgetIds.includes(id)).length}）
          </button>
        ))}
      </div>

      {GROUPS.filter((g) => g.name === openGroup).map((g) => (
        <section key={g.name} className="section">
          <h2>{g.name}</h2>
          <p className="hint">{g.note}</p>
          {g.ids.filter((id) => widgetIds.includes(id)).map((id) => (
            <Widget key={id} id={id} />
          ))}
        </section>
      ))}

      {others.length > 0 && (
        <section className="section">
          <h2>その他</h2>
          {others.map((id) => (
            <Widget key={id} id={id} />
          ))}
        </section>
      )}
    </div>
  );
}
