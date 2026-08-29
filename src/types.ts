/** アプリ全体で使う型定義 */

/** 試験の大分類 */
export type FieldId = 'technology' | 'management' | 'strategy';

/** 中分類（シラバスの「分野」相当）。教本の章と問題のタグを兼ねる */
export interface Category {
  id: string;
  field: FieldId;
  /** 表示名（例: 基礎理論） */
  name: string;
  /** 一行説明 */
  summary: string;
}

/** 教本の 1 セクション（＝ひとつの学習単位） */
export interface TextbookSection {
  id: string;
  categoryId: string;
  title: string;
  /** 学習の狙い。一覧に出す */
  goal: string;
  /** 本文。Markdown サブセット（見出し/表/箇条書き/コード/強調） */
  body: string;
  /** 目安学習時間（分） */
  minutes: number;
}

/** 科目A（多肢選択式） */
export interface QuestionA {
  id: string;
  categoryId: string;
  /** 関連する教本セクション（解説からの導線に使う） */
  sectionId?: string;
  question: string;
  choices: [string, string, string, string];
  /** 正解の添字（0=ア, 1=イ, 2=ウ, 3=エ） */
  answer: 0 | 1 | 2 | 3;
  explanation: string;
  /** 体感難易度 1（易）〜3（難） */
  level: 1 | 2 | 3;
}

/** 科目B の設問（1 つの問題文に複数の設問がぶら下がることがある） */
export interface SubQuestionB {
  /** 設問文（空文字なら問題文直後の単一設問） */
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
}

/** 科目B（アルゴリズムとプログラミング／情報セキュリティ） */
export interface QuestionB {
  id: string;
  /** 出題分野。本試験は 20 問中 16 問が algorithm、4 問が security */
  kind: 'algorithm' | 'security';
  title: string;
  /** 問題文（Markdown） */
  description: string;
  /** 擬似言語プログラム。等幅・行番号付きで表示する */
  code?: string;
  /** トレース表など、コードの後ろに置く補足（Markdown） */
  supplement?: string;
  subQuestions: SubQuestionB[];
  level: 1 | 2 | 3;
}

/** 解答履歴の 1 レコード */
export interface AttemptLog {
  /** 問題 ID（科目Bは `${id}#${設問番号}`） */
  qid: string;
  categoryId: string;
  correct: boolean;
  /** epoch ms */
  at: number;
  /** 出題モード */
  mode: 'practice' | 'review' | 'mock' | 'check';
}

/** SRS（間隔反復）のカード状態。SM-2 を簡略化したもの */
export interface SrsCard {
  qid: string;
  categoryId: string;
  /** 難易度係数 */
  ease: number;
  /** 次回までの間隔（日） */
  interval: number;
  /** 連続正解数 */
  streak: number;
  /** 次回出題日時 epoch ms */
  due: number;
  /** 総解答回数 */
  reps: number;
  lapses: number;
}

/** 模試 1 回分の結果 */
export interface MockResult {
  id: string;
  at: number;
  subject: 'A' | 'B';
  total: number;
  correct: number;
  /** 所要時間（秒） */
  elapsed: number;
  /** 分野別の正誤 */
  byCategory: Record<string, { total: number; correct: number }>;
}

/** localStorage に保存する状態のすべて */
export interface AppState {
  version: number;
  /** 読了した教本セクション ID */
  readSections: string[];
  logs: AttemptLog[];
  srs: Record<string, SrsCard>;
  mocks: MockResult[];
  /** 教本の栞（最後に開いたセクション） */
  bookmark?: string;
  /** セクション ID ごとの読了日時（epoch ms）。「今日の進捗」の集計に使う */
  readAt?: Record<string, number>;
  /** 試験日（YYYY-MM-DD）。未設定ならカウントダウン非表示 */
  examDate?: string;
  /** 表示テーマ。既定は 'auto'（OS 追従） */
  theme?: 'light' | 'dark' | 'auto';
}
