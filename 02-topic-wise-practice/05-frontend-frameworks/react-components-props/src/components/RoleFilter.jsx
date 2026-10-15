// Controlled by the parent: it receives the current value and a callback
function RoleFilter({ roles, active, onChange }) {
  return (
    <div className="filter">
      {roles.map(r => (
        <button key={r} className={r === active ? 'chip active' : 'chip'} onClick={() => onChange(r)}>
          {r}
        </button>
      ))}
    </div>
  );
}

export default RoleFilter;
