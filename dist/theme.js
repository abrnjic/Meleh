// Apply the theme before styles paint, then remember an explicit visitor choice.
(() => {
  const key = 'meleh-theme';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = value => value === 'light' || value === 'dark';
  let choice = null;
  try { const saved = localStorage.getItem(key); if (valid(saved)) choice = saved; } catch {}
  function apply() {
    const theme = choice || (system.matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#111c19' : '#ffffff';
    window.dispatchEvent(new CustomEvent('meleh-theme-change', { detail: theme }));
  }
  window.MelehTheme = {
    toggle() {
      choice = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, choice); } catch {}
      apply();
    }
  };
  system.addEventListener('change', () => { if (!choice) apply(); });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      choice = valid(event.newValue) ? event.newValue : null;
      apply();
    }
  });
  apply();
})();
