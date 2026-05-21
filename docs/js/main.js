// ========== 深色/浅色主题切换 ==========
(function() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const html = document.documentElement;
  const stored = localStorage.getItem('theme');

  if (stored) {
    html.setAttribute('data-theme', stored);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    html.setAttribute('data-theme', 'dark');
  }

  toggle.addEventListener('click', () => {
    const theme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  });

  // 设置初始按钮文字
  const current = html.getAttribute('data-theme') || 'light';
  toggle.textContent = current === 'dark' ? '☀️' : '🌙';
})();
