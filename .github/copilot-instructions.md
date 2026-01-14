### Quick orientation

- **What this repo is:** a small static portfolio site (HTML/CSS/vanilla JS). No build system or tests — pages are served as plain files.
- **Key entry files:** [index.html](index.html), [published.html](published.html), [design.html](design.html), [contact.html](contact.html). Core scripts/styles: [site.js](site.js), [window-ui.js](window-ui.js), [style.css](style.css).

### Big-picture architecture

- Static pages + shared assets: each top-level HTML page is a standalone view that imports the central `style.css` and a couple of small JS modules. The site uses CDN fonts and Font Awesome.
- UI “component” patterns are implemented with HTML structure + CSS classes + small JS behaviors. There is no framework or virtual DOM; state is represented via DOM classes and `data-*` attributes.

Examples:
- Interactive window panels: articles and popups use the `.mac-window` (and `.photo-popup`) pattern in [published.html](published.html). Behavior is driven by `window-ui.js`.
- Mobile nav: `site.js` toggles the `.nav` visibility using a `.nav-toggle` button.

### Important project-specific conventions

- `.mac-window` semantics: two presentation modes exist — minimized (`.desc-short`) and maximized (`.desc-long`). The maximized state is driven by adding the `.is-max` class to the `.mac-window` element (see [window-ui.js](window-ui.js)).
- Buttons in headers are `.dot` elements with `data-action` set to `close|minimize|maximize`. `window-ui.js` delegates a single captured click handler to these dots.
- Placeholder FLIP behavior: maximize/minimize uses an exact DOM placeholder (created by `makePlaceholder`) so minimize returns the element to its original layout without layout jump. Preserve placeholder creation when changing the markup.
- Data-driven media: thumbnails use `data-video` (e.g., YouTube id) and [window-ui.js](window-ui.js) injects the player on maximize; do not hard-remove `data-video` unless also updating JS.
- CSS variables: theme colors and spacing live in `:root` inside `style.css`. Prefer using variables (e.g. `--primary`, `--border`) to maintain consistent theme updates.

### Integration points & external deps

- Google Fonts and Font Awesome are loaded via CDN in each page head. Media thumbnails use `https://img.youtube.com/vi/<id>/hqdefault.jpg`.
- External links open with `target="_blank" rel="noopener"` (follow the pattern when adding outbound links).

### Developer workflows (practical commands)

- Quick local preview (no build):
  - `python3 -m http.server 8000` (serve repo root, then open http://localhost:8000)
  - or `npx http-server -c-1` if you prefer Node-based server
- There is no `package.json`, build, or test runner. Editing and viewing files directly is the common workflow.

### Debugging tips (project-specific)

- If a window panel doesn’t maximize/minimize: inspect the element for `.is-max` and whether a `.win-placeholder` exists. The minimize FLIP expects the placeholder to be present.
- `window-ui.js` registers a captured click listener (uses `capture=true`) — this pre-empts other handlers. When adding handlers for `.dot` buttons, be aware of event ordering.
- To test video players, maximize a `.mac-window` with a `data-video` attribute and check the injected iframe in the `.ratio` element.
- Closing a window triggers an exit modal (`.exit-overlay`). The current implementation navigates to Google when confirmed — update `openExitModal` if you need a different behavior.

### Safe change guidance

- UI animations: FLIP animation is fairly sensitive to layout changes. If you adjust `.mac-window` paddings or border sizing, test maximize->minimize carefully to avoid visual snapping.
- When renaming `data-*` attributes or CSS classes, update both HTML files and the corresponding logic in `window-ui.js` / `site.js`.

### Where to look for examples

- [published.html](published.html) — lots of real examples of `.mac-window` items, `data-video`, and the `desc-short`/`desc-long` usage.
- [window-ui.js](window-ui.js) — FLIP animation, placeholder logic, captured delegated click handler, scroll locking.
- [site.js](site.js) — mobile navigation and common small helpers.
- [style.css](style.css) — theme variables and component styles.

If anything here is unclear or you want extra examples (e.g., a short snippet showing how to add a new `.mac-window` entry), tell me which part and I’ll expand or adjust the file.
