import type { JSX, ReactNode } from 'react';
import type { QuestionA } from '../types';
import { ChoiceList, CHOICE_LABELS } from './ChoiceList';
import { categoryName } from '../data/categories';
import { Markdown } from '../lib/markdown';
import { sectionById } from '../data/textbook';
import { navigate } from '../lib/router';

interface Props {
  q: QuestionA;
  selected: number | null;
  /** 解答を確定して解説を表示している状態か */
  revealed: boolean;
  onSelect: (index: number) => void;
  /** 進捗表示（例: 3 / 20） */
  counter?: string;
  /** 解説の下に置く操作ボタン群 */
  footer?: ReactNode;
  /** 模試モードでは正誤も解説も伏せる */
  hideResult?: boolean;
}

export function QuestionCardA({
  q,
  selected,
  revealed,
  onSelect,
  counter,
  footer,
  hideResult = false,
}: Props): JSX.Element {
  const section = q.sectionId ? sectionById(q.sectionId) : undefined;
  const isCorrect = selected === q.answer;

  return (
    <article className="qcard">
      <header className="qcard-head">
        <div className="qcard-tags">
          <span className="tag">科目A</span>
          <span className="tag tag-cat">{categoryName(q.categoryId)}</span>
          <span className="tag tag-level">{'★'.repeat(q.level)}</span>
          {q.source && <span className="tag tag-src">公式過去問</span>}
        </div>
        {counter && <span className="counter">{counter}</span>}
      </header>

      <div className="qbody">
        <Markdown source={q.question} />
      </div>

      <ChoiceList
        choices={q.choices}
        selected={selected}
        answer={hideResult ? null : q.answer}
        revealed={revealed}
        onSelect={onSelect}
      />

      {revealed && !hideResult && (
        <div className={`result ${isCorrect ? 'ok' : 'ng'}`}>
          <p className="verdict">
            {isCorrect ? '正解' : '不正解'}　正解は {CHOICE_LABELS[q.answer]}
          </p>
          <div className="explanation">
            <Markdown source={q.explanation} />
          </div>
          {section && (
            <button type="button" className="link-btn" onClick={() => navigate(`textbook/${section.id}`)}>
              教本で復習する：{section.title}
            </button>
          )}
        </div>
      )}

      {q.source && <p className="qsource">出典：{q.source}（独立行政法人情報処理推進機構）</p>}

      {footer && <div className="qcard-footer">{footer}</div>}
    </article>
  );
}
