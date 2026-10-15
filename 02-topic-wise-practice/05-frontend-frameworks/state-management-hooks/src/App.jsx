import { useReducer, useCallback, useMemo, useEffect, useState } from 'react';
import { questions } from './questions';
import useCountdown from './hooks/useCountdown';
import QuestionCard from './components/QuestionCard';
import ProgressBar from './components/ProgressBar';
import ResultScreen from './components/ResultScreen';

const SECONDS_PER_QUESTION = 15;

const initialState = { status: 'start', index: 0, selected: null, answers: [] };

function quizReducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...initialState, status: 'playing' };
    case 'SELECT':
      if (state.selected !== null) return state; // locked after the first choice
      return { ...state, selected: action.option };
    case 'NEXT': {
      const answers = [...state.answers, state.selected]; // null means timed out
      const done = state.index + 1 >= questions.length;
      return { ...state, answers, selected: null, index: state.index + 1, status: done ? 'finished' : 'playing' };
    }
    case 'RESTART':
      return initialState;
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [best, setBest] = useState(() => Number(localStorage.getItem('bestScore')) || 0);

  const next = useCallback(() => dispatch({ type: 'NEXT' }), []);
  const timeLeft = useCountdown(SECONDS_PER_QUESTION, next, state.status === 'playing' && state.selected === null, state.index);

  const score = useMemo(
    () => state.answers.filter((a, i) => a === questions[i].answer).length,
    [state.answers]
  );

  useEffect(() => {
    if (state.status === 'finished' && score > best) {
      setBest(score);
      try { localStorage.setItem('bestScore', String(score)); } catch { /* ignore */ }
    }
  }, [state.status, score, best]);

  return (
    <div className="quiz">
      <h1>Full Stack Quiz</h1>

      {state.status === 'start' && (
        <div className="screen">
          <p>{questions.length} questions, {SECONDS_PER_QUESTION} seconds each.</p>
          <p>Best score so far: {best}/{questions.length}</p>
          <button className="primary" onClick={() => dispatch({ type: 'START' })}>Start quiz</button>
        </div>
      )}

      {state.status === 'playing' && (
        <>
          <ProgressBar current={state.index + 1} total={questions.length} timeLeft={timeLeft} maxTime={SECONDS_PER_QUESTION} />
          <QuestionCard
            data={questions[state.index]}
            selected={state.selected}
            onSelect={option => dispatch({ type: 'SELECT', option })}
          />
          <button className="primary" disabled={state.selected === null} onClick={next}>
            {state.index + 1 === questions.length ? 'Finish' : 'Next'}
          </button>
        </>
      )}

      {state.status === 'finished' && (
        <ResultScreen score={score} best={best} answers={state.answers} onRestart={() => dispatch({ type: 'RESTART' })} />
      )}
    </div>
  );
}
