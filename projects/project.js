// Shared behaviour for project subpages: theme + TOC scrollspy.
(function () {
  // Keep light/dark in sync with the rest of the site.
  document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'light');

  function syncIcon() {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    icon.className = dark ? 'ri-sun-line' : 'ri-moon-line';
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Theme toggle
    syncIcon();
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        syncIcon();
      });
    }

    const links = Array.from(document.querySelectorAll('.toc-list a'));
    if (!links.length) return;

    const map = new Map();
    links.forEach(a => {
      const id = a.getAttribute('href').slice(1);
      const sec = document.getElementById(id);
      if (sec) map.set(sec, a);
    });

    if (!('IntersectionObserver' in window)) return;

    let current = null;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (current) current.classList.remove('active');
          current = map.get(entry.target);
          if (current) current.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    map.forEach((_, sec) => obs.observe(sec));
  });
})();
