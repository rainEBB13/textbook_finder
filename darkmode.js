const toggleBtn = document.getElementById('theme-toggle');
const body = document.body;

// Load saved theme (if user switched before)
if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark-mode');
  toggleBtn.textContent = '☀️';
}

toggleBtn.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  const isDark = body.classList.contains('dark-mode');
  toggleBtn.textContent = isDark ? '☀️' : '🌙';

  // Save user preference
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
