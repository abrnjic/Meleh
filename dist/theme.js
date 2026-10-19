// Migrate visitors with an older saved theme to the light-only appearance.
document.documentElement.dataset.theme = 'light';
try { localStorage.removeItem('meleh-theme'); } catch {}
