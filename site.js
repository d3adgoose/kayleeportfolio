// site.js — mobile nav (single source of truth)
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-banner .nav');
    if (!toggle || !nav) return;
  
    const close = () => {
      nav.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
    };
    const open = () => {
      nav.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
    };
  
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.contains('show') ? close() : open();
    });
  
    // Close on link tap, outside click, ESC, or desktop resize
    nav.addEventListener('click', (e) => { if (e.target.matches('a')) close(); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.site-banner')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 820) close(); });
  });
  