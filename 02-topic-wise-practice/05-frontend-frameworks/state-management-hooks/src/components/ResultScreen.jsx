import { questions } from '../questions';

export default function ResultScreen({ score, best, answers, onRestart }) {
  const percent = Math.round((score / questions.length) * 100);
  return (
    <div className="screen">
      <h2>You scored {score} / {questions.length} ({percent}%)</h2>
      <p>Best score: {best}</p>
      <ol className="review">
        {questions.map((q, i) => {
          const a = answers[i];
          const ok = a === q.answer;
          return (
            <li key={q.q} className={ok ? 'ok' : 'bad'}>
              {q.q}<br />
              <small>
                {a === null ? 'Time ran out' : `Your answer: ${q.options[a]}`}
                {!ok && ` | Correct: ${q.options[q.answer]}`}
              </small>
            </li>
          );
        })}
      </ol>
      <button className="primary" onClick={onRestart}>Try again</button>
    </div>
  );
}
