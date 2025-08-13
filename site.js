// site.js — single, conflict-free mobile nav
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
      if (e.target.closest('a')) close();
    });
  
    // Click outside header closes it
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.site-banner')) close();
    });
  
    // ESC closes it
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  
    // Resize back to desktop cleans up
    window.addEventListener('resize', () => {
      if (window.innerWidth > 820) close();
    });
  });
  