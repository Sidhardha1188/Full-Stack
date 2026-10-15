import Avatar from './Avatar';
import SkillTags from './SkillTags';

// Receives a whole object as a prop and destructures it
function MemberCard({ member, onMessage }) {
  const { name, role, year, skills, github } = member;
  return (
    <div className="member">
      <Avatar name={name} size={56} />
      <div className="details">
        <h3>{name}</h3>
        <p className="role">{role} &middot; Year {year}</p>
        <SkillTags skills={skills} max={3} />
        <div className="actions">
          {github ? <a href={`https://github.com/${github}`} target="_blank" rel="noreferrer">GitHub</a> : <span className="muted">No GitHub</span>}
          <button onClick={() => onMessage(name)}>Message</button>
        </div>
      </div>
    </div>
  );
}

export default MemberCard;
