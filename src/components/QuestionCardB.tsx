import type { JSX, ReactNode } from 'react';
import type { QuestionB } from '../types';
import { ChoiceList, CHOICE_LABELS } from './ChoiceList';
import { Markdown } from '../lib/markdown';

interface Props {
  q: QuestionB;
  /** 表示する設問の番号（0 始まり） */
  subIndex: number;
  selected: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
  counter?: string;
  footer?: ReactNode;
  hideResult?: boolean;
}

/** 擬似言語プログラムを行番号付きで表示する */
function CodeBlock({ code }: { code: string }): JSX.Element {
  const lines = code.replace(/\r\n/g, '\n').split('\n');
  return (
    <div className="pseudo">
      <ol className="pseudo-lines">
        {lines.map((line, i) => (
          <li key={i}>
            <span className="pseudo-code">{line === '' ? ' ' : line}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function QuestionCardB({
  q,
  subIndex,
  selected,
  revealed,
  onSelect,
  counter,
  footer,
  hideResult = false,
}: Props): JSX.Element {
  const sub = q.subQuestions[subIndex];
  const isCorrect = selected === sub.answer;

  return (
    <article className="qcard">
      <header className="qcard-head">
        <div className="qcard-tags">
          <span className="tag">科目B</span>
          <span className="tag tag-cat">
            {q.kind === 'algorithm' ? 'アルゴリズムとプログラミング' : '情報セキュリティ'}
          </span>
          <span className="tag tag-level">{'★'.repeat(q.level)}</span>
        </div>
        {counter && <span className="counter">{counter}</span>}
      </header>

      <h3 className="qtitle">{q.title}</h3>

      <div className="qbody">
        <Markdown source={q.description} />
      </div>

      {q.code && <CodeBlock code={q.code} />}
      {q.supplement && (
        <div className="qbody supplement">
          <Markdown source={q.supplement} />
        </div>
      )}

      {q.subQuestions.length > 1 && (
        <p className="sub-index">
          設問 {subIndex + 1} / {q.subQuestions.length}
        </p>
      )}
      <p className="qprompt">{sub.prompt}</p>

      <ChoiceList
        choices={sub.choices}
        selected={selected}
        answer={hideResult ? null : sub.answer}
        revealed={revealed}
        onSelect={onSelect}
      />

      {revealed && !hideResult && (
        <div className={`result ${isCorrect ? 'ok' : 'ng'}`}>
          <p className="verdict">
            {isCorrect ? '正解' : '不正解'}　正解は {CHOICE_LABELS[sub.answer]}
          </p>
          <div className="explanation">
            <Markdown source={sub.explanation} />
          </div>
        </div>
      )}

      {footer && <div className="qcard-footer">{footer}</div>}
    </article>
  );
}
