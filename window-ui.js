/* window-ui.js — fullscreen on ALL pages + ultra-smooth FLIP + zero-snap minimize
   Works for: .mac-window, .photo-popup (if present)
   Maximize: fullscreen (100vw x 100dvh) on every page (covers header)
   Minimize: FLIP back to placeholder (no pixel jump)
   Close: confirm -> Google (no state changes unless confirmed)
*/
(() => {
  const onReady = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  };

  onReady(() => {
    const WIN_SEL = '.mac-window, .photo-popup';

    // ---------- Exit modal ----------
    function ensureExitModal(){
      if (document.querySelector('.exit-overlay')) return;
      const overlay = document.createElement('div');
      overlay.className = 'exit-overlay';
      overlay.innerHTML = `
        <div class="exit-modal" role="dialog" aria-modal="true" aria-labelledby="exitTitle">
          <div class="exit-modal-header" id="exitTitle">Leave site?</div>
          <div class="exit-modal-body">Are you sure you want to exit the website?</div>
          <div class="exit-modal-actions">
            <button class="btn btn-ghost" data-exit="no">No</button>
            <button class="btn btn-danger" data-exit="yes">Yes</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.matches('[data-exit="no"]')) {
          overlay.classList.remove('show'); // cancel => do NOT change window state
        }
        if (e.target.matches('[data-exit="yes"]')) {
          window.location.href = 'https://www.google.com';
        }
      });
    }
    const openExitModal = () => { ensureExitModal(); document.querySelector('.exit-overlay').classList.add('show'); };

    // ---------- Utils ----------
    const px = (n) => `${Math.round(n * 1000) / 1000}px`;
    const lockScroll = (on) => { document.documentElement.style.overflow = on ? 'hidden' : ''; };
    const pageRect = (el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left + window.scrollX, top: r.top + window.scrollY, width: r.width, height: r.height };
    };

    function makePlaceholder(win){
      const cs = getComputedStyle(win);
      const ph = document.createElement('div');
      ph.className = 'win-placeholder';
      ph.style.display = (cs.display === 'inline') ? 'inline-block' : 'block';
      ph.style.width   = cs.width;
      ph.style.height  = cs.height;
      ph.style.margin  = cs.margin;
      ph.style.visibility = 'hidden';
      return ph;
    }

    function lift(win){
      const r = pageRect(win);
      if (!win.dataset._savedMargin)   win.dataset._savedMargin = getComputedStyle(win).margin;
      if (!win.dataset._savedMaxWidth) win.dataset._savedMaxWidth = getComputedStyle(win).maxWidth;

      win.classList.add('is-animating','no-hover');
      win.style.position = 'fixed';
      win.style.left = px(r.left - window.scrollX);
      win.style.top  = px(r.top  - window.scrollY);
      win.style.width  = px(r.width);
      win.style.height = px(r.height);
      win.style.zIndex = 2000; // on top of header
      win.style.margin = '0';
      win.style.maxWidth = 'none';
      win.style.transformOrigin = 'top left';
      win.style.willChange = 'transform';
      return r;
    }

    function drop(win){
      win.classList.remove('is-animating','no-hover');
      win.style.position = '';
      win.style.left = '';
      win.style.top = '';
      win.style.width = '';
      win.style.height = '';
      win.style.zIndex = '';
      win.style.margin = win.dataset._savedMargin || '';
      win.style.maxWidth = win.dataset._savedMaxWidth || '';
      win.style.transform = '';
      win.style.willChange = '';
      win.style.paddingBottom = ''; // reset safe-area padding
    }

    // Targets
    const fullscreenTarget = () => ({ mode: 'fullscreen' });

    // FLIP with WAAPI (distance-based duration)
    function flipAnimate(win, firstRect, target){
      if (target.mode === 'fullscreen'){
        // Use dynamic viewport height for mobile + safe area
        win.style.left = '0px';
        win.style.top  = '0px';
        win.style.width  = '100vw';
        win.style.height = '100dvh';
        win.style.paddingBottom = 'env(safe-area-inset-bottom)';
      } else {
        win.style.left = px(target.left);
        win.style.top  = px(target.top);
        win.style.width  = px(target.width);
        win.style.height = px(target.height);
      }
      const last = win.getBoundingClientRect();

      const dx = firstRect.left - last.left;
      const dy = firstRect.top  - last.top;
      const sx = firstRect.width  / Math.max(1, last.width);
      const sy = firstRect.height / Math.max(1, last.height);

      const dist = Math.hypot(dx, dy);
      const duration = Math.min(700, Math.max(320, dist * 0.55));

      const anim = win.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
          { transform: 'translate(0,0) scale(1,1)' }
        ],
        {
          duration,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both'
        }
      );
      anim.addEventListener('finish', () => { win.style.transform = ''; });
      return anim;
    }

    // ---------- State ----------
    // per-window: { mode: 'normal'|'maximized', placeholder }
    const state = new WeakMap();

    // Make photo-popup dots actionable if they’re spans
    (function ensurePhotoPopupButtons(){
      document.querySelectorAll('.photo-popup .mini-header').forEach(head => {
        head.querySelectorAll('.dot').forEach((d, i) => {
          if (d.tagName.toLowerCase() === 'button' && d.dataset.action) return;
          const b = document.createElement('button');
          b.className = d.className + ' dot';
          b.dataset.action = i === 0 ? 'close' : i === 1 ? 'minimize' : 'maximize';
          b.setAttribute('aria-label', b.dataset.action[0].toUpperCase() + b.dataset.action.slice(1));
          d.replaceWith(b);
        });
      });
    })();

    // Init windows
    document.querySelectorAll(WIN_SEL).forEach(win => {
      if (!state.get(win)) state.set(win, { mode: 'normal', placeholder: null });
    });

    // Delegated click handling (dots)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.dot');
      if (!btn) return;
      const win = btn.closest(WIN_SEL);
      if (!win) return;

      const action = btn.dataset.action;

      // CLOSE: open confirm only; do NOT change any window state here
      if (action === 'close') { openExitModal(); return; }

      // Ensure state
      if (!state.get(win)) state.set(win, { mode: 'normal', placeholder: null });
      const st = state.get(win);

      if (action === 'maximize') {
        lockScroll(true);
        // Create placeholder once (so minimize returns exactly to origin)
        if (st.mode !== 'maximized') {
          const ph = makePlaceholder(win);
          win.parentNode.insertBefore(ph, win);
          st.placeholder = ph;
          st.mode = 'maximized';
          state.set(win, st);
        }
        const first = lift(win);
        flipAnimate(win, first, fullscreenTarget());
        return;
      }

      if (action === 'minimize') {
        const ph = st.placeholder;
        if (!ph) return;

        // Target rect BEFORE move
        const r = ph.getBoundingClientRect();
        // Lift and FLIP to placeholder
        const first = lift(win);
        flipAnimate(win, first, { mode: 'box', left: r.left, top: r.top, width: r.width, height: r.height })
          .addEventListener('finish', () => {
            // Swap then pin for a frame to avoid any snap
            ph.replaceWith(win);
            win.style.position = 'fixed';
            win.style.left = px(r.left);
            win.style.top  = px(r.top);
            win.style.width  = px(r.width);
            win.style.height = px(r.height);

            requestAnimationFrame(() => {
              drop(win);
              lockScroll(false);
              st.mode = 'normal';
              st.placeholder = null;
              state.set(win, st);
            });
          });
        return;
      }
    });

    // Keep fullscreen coverage on resize / orientation change
    const refreshFullscreen = () => {
      document.querySelectorAll(WIN_SEL).forEach(win => {
        const st = state.get(win);
        if (st?.mode === 'maximized') {
          const first = lift(win);
          flipAnimate(win, first, fullscreenTarget());
        }
      });
    };
    window.addEventListener('resize', refreshFullscreen);
    window.addEventListener('orientationchange', () => {
      setTimeout(refreshFullscreen, 60);
    });
  });
})();
