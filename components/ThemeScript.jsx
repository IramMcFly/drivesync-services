"use client";

export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('drivesync-theme');
              var isDark = theme ? JSON.parse(theme) : window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (isDark) {
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
                document.body.classList.remove('dark');
              }
            } catch (error) {
              console.error('Error applying theme:', error);
            }
          })();
        `,
      }}
    />
  );
}
