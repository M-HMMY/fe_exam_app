import { useState, type JSX } from 'react';
import type { QuestionB } from '../types';
import { QUESTIONS_B, questionBById, questionsBOfSection } from '../data/questions';
import { sectionById } from '../data/textbook';
import { QuestionCardB } from '../components/QuestionCardB';
import { actions, useStore } from '../store';
import { navigate, useRoute } from '../lib/router';

interface Session {
  q: QuestionB;
  subIndex: number;
  selected: number | null;
  revealed: boolean;
  correctCount: number;
}

const KIND_LABEL: Record<QuestionB['kind'], string> = {
  algorithm: 'アルゴリズムとプログラミング',
  security: '情報セキュリティ',
};

export function PracticeB(): JSX.Element {
  const state = useStore();
  const route = useRoute();
  const [session, setSession] = useState<Session | null>(null);
  const [filter, setFilter] = useState<'all' | QuestionB['kind']>('all');

  // 教本の節から来た場合は、その節に対応する問題だけを一覧に出す
  const sectionId = route.query.section;
  const section = sectionId ? sectionById(sectionId) : undefined;

  const solvedIds = new Set(state.logs.map((l) => l.qid));
  const list = section
    ? questionsBOfSection(section.id)
    : QUESTIONS_B.filter((q) => filter === 'all' || q.kind === filter);

  // ---- 一覧 ----
  if (!session) {
    return (
      <div className="page">
        <header className="page-head">
          <h1>科目B 演習</h1>
          <p className="lead">
            擬似言語のプログラムを読み解く問題と、情報セキュリティの事例問題です。本番は 20 問 100 分、1 問あたり約 5
            分が目安になります。焦らずトレース表を書く練習をしてください。
          </p>
        </header>

        {section && (
          <section className="section">
            <p className="hint">
              教本「{section.title}」に対応する {list.length} 問です。
            </p>
            <button type="button" className="btn small ghost" onClick={() => navigate('practice-b')}>
              すべての問題から選ぶ
            </button>
          </section>
        )}

        {!section && (
        <div className="chips">
          <button type="button" className={`chip ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>
            すべて（{QUESTIONS_B.length}）
          </button>
          <button
            type="button"
            className={`chip ${filter === 'algorithm' ? 'on' : ''}`}
            onClick={() => setFilter('algorithm')}
          >
            アルゴリズム（{QUESTIONS_B.filter((q) => q.kind === 'algorithm').length}）
          </button>
          <button
            type="button"
            className={`chip ${filter === 'security' ? 'on' : ''}`}
            onClick={() => setFilter('security')}
          >
            セキュリティ（{QUESTIONS_B.filter((q) => q.kind === 'security').length}）
          </button>
        </div>
        )}

        <ul className="blist">
          {list.map((q) => {
            const done = q.subQuestions.every((_, i) => solvedIds.has(`${q.id}#${i}`));
            return (
              <li key={q.id}>
                <button
                  type="button"
                  className="blist-item"
                  onClick={() =>
                    setSession({ q, subIndex: 0, selected: null, revealed: false, correctCount: 0 })
                  }
                >
                  <span className={`check ${done ? 'done' : ''}`}>{done ? '✓' : ''}</span>
                  <span className="blist-text">
                    <span className="blist-title">{q.title}</span>
                    <span className="blist-meta">
                      {KIND_LABEL[q.kind]}・設問 {q.subQuestions.length} 問・{'★'.repeat(q.level)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const { q, subIndex } = session;

  // ---- 終了 ----
  if (subIndex >= q.subQuestions.length) {
    const nextQuestion = list[list.findIndex((x) => x.id === q.id) + 1];
    return (
      <div className="page">
        <header className="page-head">
          <h1>{q.title}</h1>
        </header>
        <div className="card result-summary">
          <span className="stat-value">
            {session.correctCount} / {q.subQuestions.length}
          </span>
          <span className="stat-sub">設問の正解数</span>
        </div>
        <div className="read-actions">
          <button
            type="button"
            className="btn"
            onClick={() => setSession({ q, subIndex: 0, selected: null, revealed: false, correctCount: 0 })}
          >
            もう一度解く
          </button>
          {nextQuestion && (
            <button
              type="button"
              className="btn primary"
              onClick={() =>
                setSession({
                  q: questionBById(nextQuestion.id)!,
                  subIndex: 0,
                  selected: null,
                  revealed: false,
                  correctCount: 0,
                })
              }
            >
              次の問題へ：{nextQuestion.title}
            </button>
          )}
          <button type="button" className="btn ghost" onClick={() => setSession(null)}>
            一覧へ戻る
          </button>
        </div>
      </div>
    );
  }

  const sub = q.subQuestions[subIndex];

  const submit = () => {
    if (session.selected === null) return;
    const correct = session.selected === sub.answer;
    actions.answer({
      qid: `${q.id}#${subIndex}`,
      categoryId: q.kind === 'algorithm' ? 't-algo' : 't-sec',
      correct,
      mode: 'practice',
    });
    setSession({ ...session, revealed: true, correctCount: session.correctCount + (correct ? 1 : 0) });
  };

  return (
    <div className="page">
      <QuestionCardB
        q={q}
        subIndex={subIndex}
        selected={session.selected}
        revealed={session.revealed}
        onSelect={(i) => setSession({ ...session, selected: i })}
        footer={
          session.revealed ? (
            <button
              type="button"
              className="btn primary"
              onClick={() => setSession({ ...session, subIndex: subIndex + 1, selected: null, revealed: false })}
            >
              {subIndex + 1 === q.subQuestions.length ? '結果を見る' : '次の設問へ'}
            </button>
          ) : (
            <button type="button" className="btn primary" disabled={session.selected === null} onClick={submit}>
              解答する
            </button>
          )
        }
      />
      <div className="read-actions">
        <button type="button" className="btn ghost" onClick={() => setSession(null)}>
          一覧へ戻る
        </button>
        <button type="button" className="btn ghost" onClick={() => navigate('textbook/t-algo-3')}>
          擬似言語の読み方を確認する
        </button>
      </div>
    </div>
  );
}
