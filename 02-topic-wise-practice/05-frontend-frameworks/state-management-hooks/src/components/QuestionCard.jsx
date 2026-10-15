export default function QuestionCard({ data, selected, onSelect }) {
  return (
    <div className="card">
      <h2>{data.q}</h2>
      <div className="options">
        {data.options.map((opt, i) => {
          let cls = 'option';
          if (selected !== null) {
            if (i === data.answer) cls += ' correct';
            else if (i === selected) cls += ' wrong';
          }
          return (
            <button key={opt} className={cls} onClick={() => onSelect(i)} disabled={selected !== null}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
