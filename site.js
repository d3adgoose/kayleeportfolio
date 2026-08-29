// site.js — single, conflict-free mobile nav
document.addEventListener('DOMContentLoaded', () => {
    const siteHeader = document.querySelector('.site-banner .banner-inner');
    if (siteHeader && !document.body.matches('[data-page="home"]')) {
      const headerTip = document.createElement('aside');
      headerTip.className = 'header-window-tip';
      headerTip.setAttribute('aria-label', 'Window button reminder');
      headerTip.innerHTML = `
        <strong>psst... the dots work!</strong>
        <span><i class="tip-dot tip-dot--red"></i> exit</span>
        <span><i class="tip-dot tip-dot--yellow"></i> shrink</span>
        <span><i class="tip-dot tip-dot--green"></i> expand</span>`;
      const navToggle = siteHeader.querySelector('.nav-toggle');
      siteHeader.insertBefore(headerTip, navToggle || siteHeader.querySelector('.nav'));
    }

    const projectRoles = {
      'indev-linebyline': 'Lead Producer',
      'indev-nudge': 'Usability Team Member',
      'ucsc-mural': 'Creative Director & Mural Artist',
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

    const portfolioProjects = [
      { match: 'Sushi Rat', title: 'Sushi Rat Revolution', roles: ['game-design'], slug: 'sushi-rat-revolution' },
      { match: 'Line By Line', title: 'Line By Line', roles: ['production'], slug: 'line-by-line' },
      { match: 'nudge', title: 'nudge', roles: ['usability'], slug: 'nudge' },
      { match: 'Markus’s Miasma', title: 'Markus’s Miasma', roles: ['production'], slug: 'markus-miasma' },
      { match: 'Red Trees Rail Co', title: 'Red Trees Rail Co', roles: ['art-ux'], slug: 'red-trees-rail-co' },
      { match: 'Pulse & Pole', title: 'Pulse & Pole', roles: ['game-design', 'programming'], slug: 'pulse-and-pole' },
      { match: 'Sky Is The Limit', title: 'Sky Is The Limit', roles: ['game-design'], slug: 'sky-is-the-limit' },
      { match: 'Alienated', title: 'Alienated', roles: ['game-design'], slug: 'alienated' },
      { match: 'Things Left Unspoken', title: 'Things Left Unspoken', roles: ['programming'], slug: 'things-left-unspoken' },
      { match: 'Bat Bomb', title: 'Bat Bomb', roles: ['game-design', 'programming'], slug: 'bat-bomb' },
      { match: 'Puzzle Path', title: 'Puzzle Path', roles: ['game-design', 'programming'], slug: 'puzzle-path' }
    ];
    const roleLabels = {
      all: 'All work',
      'game-design': 'Game Design',
      production: 'Production',
      programming: 'Programming',
      usability: 'Usability',
      'art-ux': 'Art / UX'
    };
    const roleStorageKey = 'kaylee-portfolio-role';
    const readSavedRole = () => {
      try {
        const saved = localStorage.getItem(roleStorageKey);
        return roleLabels[saved] ? saved : 'production';
      } catch (_) {
        return 'production';
      }
    };
    const saveRole = (role) => {
      try { localStorage.setItem(roleStorageKey, role); } catch (_) { /* Privacy mode fallback */ }
    };

    // nudge is now published: keep it with the other Steam releases.
    const nudgeCard = document.querySelector('[data-win-id="indev-nudge"]');
    const steamGrid = [...document.querySelectorAll('body[data-page="games"] main.section > section')]
      .find((section) => section.querySelector('.section-heading .fa-steam-symbol'))?.querySelector('.grid');
    if (nudgeCard && steamGrid) {
      steamGrid.prepend(nudgeCard);
    }
    const projectCards = [...document.querySelectorAll('body[data-page="games"] .mac-window[data-win-id]')];
    projectCards.forEach((card) => {
      const title = card.querySelector('.win-title')?.textContent || '';
      const project = portfolioProjects.find((item) => title.includes(item.match));
      if (!project) return;
      card.dataset.portfolioRoles = project.roles.join(' ');
      card.id = `project-${project.slug}`;
    });

    const applyRole = (role, shouldSave = false) => {
      const selectedRole = roleLabels[role] ? role : 'all';
      if (shouldSave) saveRole(selectedRole);

      document.querySelectorAll('[data-role-filter] button').forEach((button) => {
        const active = button.dataset.role === selectedRole;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });

      let visibleCount = 0;
      projectCards.forEach((card) => {
        const matches = selectedRole === 'all' || card.dataset.portfolioRoles?.split(' ').includes(selectedRole);
        card.hidden = !matches;
        if (matches) visibleCount += 1;
      });
      document.querySelectorAll('body[data-page="games"] main.section > section:not(.games-role-sort)').forEach((section) => {
        section.hidden = !section.querySelector('.mac-window:not([hidden])');
      });

      const status = document.querySelector('[data-role-status]');
      if (status) status.textContent = selectedRole === 'all'
        ? `Showing all ${visibleCount} games.`
        : `Showing ${visibleCount} project${visibleCount === 1 ? '' : 's'} featuring ${roleLabels[selectedRole]}.`;

      const preview = document.querySelector('[data-role-preview]');
      if (preview) {
        const matches = portfolioProjects.filter((project) => selectedRole === 'all' || project.roles.includes(selectedRole)).slice(0, 3);
        preview.innerHTML = `<p>${selectedRole === 'all' ? 'A little bit of everything:' : `${roleLabels[selectedRole]} highlights:`}</p><div>${matches.map((project) => `<a href="published.html#project-${project.slug}">${project.title}<span aria-hidden="true">↗</span></a>`).join('')}</div>`;
      }
    };

    document.querySelectorAll('[data-role-filter]').forEach((filter) => {
      filter.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-role]');
        if (button) applyRole(button.dataset.role, true);
      });
    });
    applyRole('all');
    if (location.hash && document.querySelector(location.hash)) {
      requestAnimationFrame(() => document.querySelector(location.hash).scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }

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
        const projectContext = shortPanel.querySelector(':scope > .project-context');
        if (projectContext) actions.insertAdjacentElement('afterend', projectContext);
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
  
