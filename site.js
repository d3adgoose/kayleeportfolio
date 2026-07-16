// site.js — single, conflict-free mobile nav
document.addEventListener('DOMContentLoaded', () => {
    const projectRoles = {
      'indev-linebyline': 'Lead Producer',
      'indev-nudge': 'Usability & Playtesting Lead',
      'steam-markus': 'Lead Producer & Project Manager',
      'steam-2': '2D Artist · Storyboarder · QA',
      'jam-pulsepole': 'Game Designer & Programmer',
      'jam-skyisthelimit': 'Game Designer',
      'jam-alienated': 'Game Designer',
      'jam-thingsleftunspoken': 'Main Programmer',
      'proto-batbomb': 'Concept Designer · Programmer',
      'proto-puzzlepath': 'Level Designer · Programmer',
      'usc-sushi': 'Game & Systems Designer'
    };

    document.querySelectorAll('.mac-window[data-win-id]').forEach((windowCard) => {
      let role = projectRoles[windowCard.dataset.winId];
      const title = windowCard.querySelector('.win-title')?.textContent || '';

      // Pulse & Pole previously shared an identifier with Sky Is the Limit.
      if (title.includes('Pulse & Pole')) role = 'Game Designer & Programmer';
      if (!role) return;

      const makePill = () => {
        const pill = document.createElement('div');
        pill.className = 'role-pill';
        pill.innerHTML = `<span>My role</span><strong>${role}</strong>`;
        return pill;
      };

      const shortPanel = windowCard.querySelector('.desc-short');
      if (shortPanel && !shortPanel.querySelector('.role-pill')) {
        const actions = document.createElement('div');
        actions.className = 'card-actions';
        const existingButtons = [...shortPanel.querySelectorAll(':scope > .btn')];
        actions.appendChild(makePill());
        existingButtons.forEach((button) => actions.appendChild(button));
        shortPanel.appendChild(actions);
      }

      const longPanel = windowCard.querySelector('.desc-long');
      if (longPanel && !longPanel.querySelector(':scope > .role-pill')) {
        longPanel.prepend(makePill());
      }
    });

    // Give every project thumbnail one consistent frame while preserving
    // the complete, uncropped artwork in the foreground.
    document.querySelectorAll('.desc-short img.win-thumb').forEach((image) => {
      if (image.parentElement?.classList.contains('win-thumb-frame')) return;

      const frame = document.createElement('div');
      frame.className = 'win-thumb-frame';
      image.parentNode.insertBefore(frame, image);
      frame.appendChild(image);

      const chooseFit = () => {
        if (!image.naturalWidth || !image.naturalHeight) return;
        const imageRatio = image.naturalWidth / image.naturalHeight;
        const frameRatio = 16 / 9;
        frame.classList.toggle('win-thumb-frame--fit', Math.abs(imageRatio - frameRatio) > .48);
      };

      if (image.complete) chooseFit();
      else image.addEventListener('load', chooseFit, { once: true });
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
  
