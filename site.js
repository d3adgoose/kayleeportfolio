// site.js — shared UI helpers (mobile nav, small a11y niceties)
(() => {
    const onReady = (fn) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn, { once: true });
      } else {
        fn();
      }
    };
  
    onReady(() => {
      // Mobile nav toggle
      const toggle = document.querySelector('.nav-toggle');
      const nav = document.querySelector('.nav');
      if (toggle && nav) {
        toggle.addEventListener('click', () => {
          const open = nav.classList.toggle('show');
          toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        // Close nav when a link is tapped
        nav.addEventListener('click', (e) => {
          if (e.target.tagName === 'A') {
            nav.classList.remove('show');
            toggle.setAttribute('aria-expanded', 'false');
          }
        });
        // Close nav on ESC
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            nav.classList.remove('show');
            toggle?.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
  })();
  