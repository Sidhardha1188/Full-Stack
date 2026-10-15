// Shows up to "max" tags and a "+N more" label for the rest
function SkillTags({ skills, max = 5 }) {
  const visible = skills.slice(0, max);
  const hidden = skills.length - visible.length;
  return (
    <ul className="tags">
      {visible.map(s => <li key={s}>{s}</li>)}
      {hidden > 0 && <li className="more">+{hidden} more</li>}
    </ul>
  );
}

export default SkillTags;
