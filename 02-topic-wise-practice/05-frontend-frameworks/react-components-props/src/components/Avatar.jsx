// Computes initials and a colour from the name prop; size has a default value
const colours = ['#6a4c93', '#1982c4', '#8ac926', '#ff595e', '#ffca3a'];

function Avatar({ name, size = 48 }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colour = colours[name.length % colours.length];
  return (
    <div className="avatar" style={{ width: size, height: size, background: colour, fontSize: size / 2.6 }}>
      {initials}
    </div>
  );
}

export default Avatar;
