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
  // site.js — mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-banner .nav');
    if (!toggle || !nav) return;
  
    const close = () => {
      nav.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
    };
  
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = nav.classList.toggle('show');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  
    // Close on link click (nice on mobile)
    nav.addEventListener('click', (e) => {
      if (e.target.matches('a')) close();
    });
  
    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.site-banner')) close();
    });
  
    // If resized back to desktop, ensure clean state
    window.addEventListener('resize', () => {
      if (window.innerWidth > 820) close();
    });
  });
  