// src/components/DarkModeScript.tsx — no-flash au 1er paint
export default function DarkModeScript() {
  const code = `
  (function () {
    try {
      var THEME_KEY = 'theme';
      var stored = localStorage.getItem(THEME_KEY); // 'light' | 'dark' | 'system' | null
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var mode = (stored === 'dark' || stored === 'light')
        ? stored
        : (prefersDark ? 'dark' : 'light');
      var root = document.documentElement;
      var isDark = mode === 'dark';
      root.classList.toggle('dark', isDark);
      root.classList.toggle('light', !isDark);
      root.setAttribute('data-theme', mode);
      root.style.colorScheme = isDark ? 'dark' : 'light';
    } catch (e) {}
  })();`
  return <script dangerouslySetInnerHTML={{ __html: code }} />
}
