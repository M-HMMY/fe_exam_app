import type { Category, FieldId } from '../types';

export const FIELDS: { id: FieldId; name: string; note: string }[] = [
  { id: 'technology', name: 'テクノロジ系', note: '科目Aの出題の約 6 割。範囲が広く、計算問題もここから出る' },
  { id: 'management', name: 'マネジメント系', note: '出題数は少ないが用語中心で得点しやすい' },
  { id: 'strategy', name: 'ストラテジ系', note: '経営・法務。暗記で確実に稼げる分野' },
];

export const CATEGORIES: Category[] = [
  // --- テクノロジ系 ---
  { id: 't-basic', field: 'technology', name: '基礎理論', summary: '基数変換・論理演算・確率統計・情報理論' },
  { id: 't-algo', field: 'technology', name: 'アルゴリズムとプログラミング', summary: 'データ構造・探索・整列・計算量・擬似言語' },
  { id: 't-hw', field: 'technology', name: 'コンピュータ構成要素', summary: 'プロセッサ・記憶階層・入出力・論理回路' },
  { id: 't-sys', field: 'technology', name: 'システム構成要素', summary: 'システム構成・性能・稼働率・信頼性' },
  { id: 't-sw', field: 'technology', name: 'ソフトウェア', summary: 'OS・タスク管理・仮想記憶・ファイル' },
  { id: 't-db', field: 'technology', name: 'データベース', summary: '正規化・SQL・トランザクション・排他制御' },
  { id: 't-nw', field: 'technology', name: 'ネットワーク', summary: 'OSI 参照モデル・TCP/IP・IP アドレス・伝送計算' },
  { id: 't-sec', field: 'technology', name: 'セキュリティ', summary: '暗号・認証・攻撃手法・対策・マネジメント' },
  { id: 't-dev', field: 'technology', name: '開発技術', summary: '要件定義・設計・テスト・アジャイル' },
  { id: 't-ui', field: 'technology', name: 'ヒューマンIF・マルチメディア', summary: 'UI 設計・画像/音声の符号化' },

  // --- マネジメント系 ---
  { id: 'm-pm', field: 'management', name: 'プロジェクトマネジメント', summary: 'WBS・アローダイアグラム・見積り' },
  { id: 'm-sm', field: 'management', name: 'サービスマネジメント・監査', summary: 'SLA・インシデント管理・システム監査' },

  // --- ストラテジ系 ---
  { id: 's-sys', field: 'strategy', name: 'システム戦略・企画', summary: 'BPR・クラウド・調達・要件定義' },
  { id: 's-biz', field: 'strategy', name: '経営戦略・ビジネス', summary: 'SWOT・PPM・マーケティング・IoT/AI' },
  { id: 's-law', field: 'strategy', name: '企業活動と法務', summary: '会計・財務・知的財産権・労働法・標準化' },
];

export const categoryById = (id: string): Category | undefined => CATEGORIES.find((c) => c.id === id);

export const categoryName = (id: string): string => categoryById(id)?.name ?? id;

export const categoriesOfField = (field: FieldId): Category[] => CATEGORIES.filter((c) => c.field === field);
