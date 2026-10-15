// ---------- Form validation with input, blur and submit events ----------
const rules = {
  name: v => v.trim().length >= 3 || "Name must have at least 3 letters",
  roll: v => /^A\d{11}$/.test(v.trim()) || "Roll number looks like A24126552177",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email",
  password: v => v.length >= 8 || "Password needs at least 8 characters"
};

function validateField(id) {
  const input = document.getElementById(id);
  const result = rules[id](input.value);
  const errorBox = document.querySelector(`.err[data-for="${id}"]`);
  const ok = result === true;
  errorBox.textContent = ok ? "" : result;
  input.classList.toggle("invalid", !ok);
  input.classList.toggle("valid", ok);
  return ok;
}

Object.keys(rules).forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener("blur", () => validateField(id));
  input.addEventListener("input", () => {
    if (input.classList.contains("invalid")) validateField(id);
  });
});

// Password strength meter on every key press
document.getElementById("password").addEventListener("input", e => {
  const v = e.target.value;
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/\d/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  const bar = document.getElementById("strengthBar");
  bar.style.width = `${score * 25}%`;
  bar.style.background = ["#c62828", "#c62828", "#f9a825", "#7cb342", "#2e7d32"][score];
});

document.getElementById("signup").addEventListener("submit", e => {
  e.preventDefault();
  const allOk = Object.keys(rules).map(validateField).every(Boolean);
  const msg = document.getElementById("formMsg");
  msg.textContent = allOk ? `Welcome, ${document.getElementById("name").value.trim()}!` : "Please fix the errors above.";
  msg.style.color = allOk ? "#2e7d32" : "#c62828";
});

// ---------- Fetch API with async/await, filtering and error handling ----------
let allPosts = [];

async function loadPosts() {
  const status = document.getElementById("status");
  status.textContent = "Loading...";
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=20");
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    allPosts = await res.json();
    status.textContent = `${allPosts.length} posts loaded`;
    renderPosts();
  } catch (err) {
    status.textContent = `Could not load posts: ${err.message}`;
  }
}

function renderPosts() {
  const term = document.getElementById("search").value.toLowerCase();
  const list = document.getElementById("posts");
  list.innerHTML = "";
  allPosts
    .filter(p => p.title.toLowerCase().includes(term))
    .forEach(p => {
      const li = document.createElement("li");
      const b = document.createElement("b");
      b.textContent = p.title;
      li.append(b, document.createElement("br"), p.body.split("\n")[0]);
      list.appendChild(li);
    });
}

document.getElementById("search").addEventListener("input", renderPosts);
document.getElementById("reload").addEventListener("click", loadPosts);
window.addEventListener("DOMContentLoaded", loadPosts);
