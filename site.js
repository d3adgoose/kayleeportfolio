// site.js — single, conflict-free mobile nav
document.addEventListener('DOMContentLoaded', () => {
    // Give every project thumbnail one consistent frame while preserving
    // the complete, uncropped artwork in the foreground.
    document.querySelectorAll('.desc-short img.win-thumb').forEach((image) => {
      if (image.parentElement?.classList.contains('win-thumb-frame')) return;

      const frame = document.createElement('div');
      frame.className = 'win-thumb-frame';
      image.parentNode.insertBefore(frame, image);
      frame.appendChild(image);
    });

    // Make long Games and Projects pages clearly scrollable on first view.
    if (document.body.matches('[data-page="games"], [data-page="work"]')) {
      const hint = document.createElement('div');
      hint.className = 'page-scroll-hint';
      hint.setAttribute('aria-hidden', 'true');
      hint.textContent = 'Scroll for more  ↓';
      document.body.appendChild(hint);

      const updateScrollHint = () => {
        const hasMore = document.documentElement.scrollHeight > window.innerHeight + 80;
        hint.classList.toggle('show', hasMore && window.scrollY < 72);
      };

      requestAnimationFrame(updateScrollHint);
      window.addEventListener('scroll', updateScrollHint, { passive: true });
      window.addEventListener('resize', updateScrollHint);
    }

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
  
