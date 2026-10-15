import { useState } from 'react';
import Layout from './components/Layout';
import MemberCard from './components/MemberCard';
import RoleFilter from './components/RoleFilter';
import { members } from './data';

function App() {
  const [role, setRole] = useState('All');
  const roles = ['All', ...new Set(members.map(m => m.role))];
  const shown = role === 'All' ? members : members.filter(m => m.role === role);

  // Passing a function as a prop: the child calls it to tell the parent what was clicked
  function handleSelect(name) {
    alert(`Message sent to ${name}`);
  }

  return (
    <Layout title="ANITS Coding Club" footer={<p>Updated October 2026</p>}>
      <RoleFilter roles={roles} active={role} onChange={setRole} />
      <p className="count">Showing {shown.length} of {members.length} members</p>
      <div className="members">
        {shown.map(m => (
          <MemberCard key={m.id} member={m} onMessage={handleSelect} />
        ))}
      </div>
    </Layout>
  );
}

export default App;
