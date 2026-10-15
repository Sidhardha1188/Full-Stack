export default function ProgressBar({ current, total, timeLeft, maxTime }) {
  const urgent = timeLeft <= 5;
  return (
    <div className="progress">
      <span>Question {current} / {total}</span>
      <div className="timer">
        <div className={urgent ? 'fill urgent' : 'fill'} style={{ width: `${(timeLeft / maxTime) * 100}%` }} />
      </div>
      <span className={urgent ? 'secs urgent-text' : 'secs'}>{timeLeft}s</span>
    </div>
  );
}
