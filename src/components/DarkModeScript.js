export default function DarkModeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
            if (darkQuery.matches) {
              document.documentElement.classList.add('dark');
              document.body.style.background = '#111827';
            }
          } catch(e) {}
        `,
      }}
    />
  );
}
