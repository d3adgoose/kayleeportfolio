/* window-ui.js — fullscreen on ALL pages + ultra-smooth FLIP + stable state
   Works for: .mac-window, .photo-popup
   Maximize: fullscreen (100vw x 100vh)
   Minimize: FLIP back to exact placeholder
   Close: confirm -> Google (NO state change if user cancels)
*/
(() => {
  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else { fn(); }
  };

  onReady(() => {
    const WIN_SEL = '.mac-window, .photo-popup';

    /* ------------ Exit modal (one per page) ------------ */
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
        </div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.matches('[data-exit="no"]')) {
          overlay.classList.remove('show');             // Do nothing else (state unchanged)
        }
        if (e.target.matches('[data-exit="yes"]')) {
          window.location.href = 'https://www.google.com';
        }
      });
    }
    const openExitModal = () => { ensureExitModal(); document.querySelector('.exit-overlay').classList.add('show'); };

    /* ------------ Utils ------------ */
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
      win.style.zIndex = 2000;
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
    }

    const fullscreenTarget = () => ({ mode: 'fullscreen' });

    function flipAnimate(win, firstRect, target){
      if (target.mode === 'fullscreen'){
        win.style.left = '0px';
        win.style.top  = '0px';
        win.style.width  = '100vw';
        win.style.height = '100vh';
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
        { duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' }
      );
      anim.addEventListener('finish', () => { win.style.transform = ''; });
      return anim;
    }

    /* ------------ State ------------ */
    // per-window: { mode: 'normal'|'maximized', placeholder }
    const state = new WeakMap();

    // Ensure popup headers use button dots
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

    document.querySelectorAll(WIN_SEL).forEach(win => {
      if (!state.get(win)) state.set(win, { mode: 'normal', placeholder: null });
    });

    /* ------------ Single delegated handler ------------ */
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.dot');
      if (!btn) return;

      // Stop ALL other handlers from also reacting (prevents rogue .is-max toggles)
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();

      const win = btn.closest(WIN_SEL);
      if (!win) return;

      const action = btn.dataset.action;

      // Close -> just show modal; DO NOT change classes or state
      if (action === 'close') {
        openExitModal();
        return;
      }

      if (!state.get(win)) state.set(win, { mode: 'normal', placeholder: null });
      const st = state.get(win);

      if (action === 'maximize') {
        // Mark logical state
        st.mode = 'maximized';
        state.set(win, st);
        win.classList.add('is-max');     // <-- drives your long/short content swap

        // Create placeholder (for perfect minimize)
        if (!st.placeholder) {
          const ph = makePlaceholder(win);
          win.parentNode.insertBefore(ph, win);
          st.placeholder = ph;
          state.set(win, st);
        }

        lockScroll(true);
        const first = lift(win);
        flipAnimate(win, first, fullscreenTarget());
        return;
      }

      if (action === 'minimize') {
        const ph = st.placeholder;
        if (!ph) return;

        // Target rect BEFORE move
        const r = ph.getBoundingClientRect();
        const first = lift(win);
        flipAnimate(win, first, { mode: 'box', left: r.left, top: r.top, width: r.width, height: r.height })
          .addEventListener('finish', () => {
            // Swap positions without snap
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
              win.classList.remove('is-max');   // <-- back to minimized content
            });
          });
        return;
      }
    }, true); // capture=true to pre-empt other listeners

    // Keep fullscreen coverage on resize
    window.addEventListener('resize', () => {
      document.querySelectorAll(WIN_SEL).forEach(win => {
        const st = state.get(win);
        if (st?.mode === 'maximized') {
          const first = lift(win);
          flipAnimate(win, first, fullscreenTarget());
        }
      });
    });
  });
})();