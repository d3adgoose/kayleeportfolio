// Self-hosted PDF.js renders pages without invoking browser PDF extensions.
const documents = {
  'unspoken-code': { title: 'Things Left Unspoken — Code Architecture', file: 'assets/files/Things-Left-Unspoken-Code-Architecture.pdf' },
  'unspoken-gdd': { title: 'Things Left Unspoken — Game Design Document', file: 'assets/files/Things-Left-Unspoken-GDD.pdf' },
  'sushi-rules': { title: 'Sushi Rat Revolution — Rules', file: 'assets/files/Team4-Rules.pdf' },
  'sushi-playtest-1': { title: 'Sushi Rat Revolution — Playtest Report Week 1', file: 'assets/files/Team4-PlaytestReport-Wk5.pdf' },
  'sushi-playtest-2': { title: 'Sushi Rat Revolution — Playtests Week 2', file: 'assets/files/Team4-Playtests-Wk6.pdf' },
  'sushi-journal-1': { title: 'Sushi Rat Revolution — Design Journal Week 1', file: 'assets/files/Team4-DesignPhotoJournal-Wk5.pdf' },
  'sushi-journal-2': { title: 'Sushi Rat Revolution — Design Journal Week 2', file: 'assets/files/Team4-DesignPhotoJournal-Wk6.pdf' },
  'sushi-cards': { title: 'Sushi Rat Revolution — Card Designs', file: 'assets/files/Sushi-Rat-Revolution-Cards.pdf' },
  'sushi-presentation': { title: 'Sushi Rat Revolution — Presentation Deck', file: 'assets/files/Shing-Team4-UtR-Presentation.pdf' },
  design: { title: 'Pulse & Pole — Game Design Document', file: 'assets/files/Pulse%26PoleRatchetUpGDD.pdf' },
  log: { title: 'Pulse & Pole — Development Log', file: 'assets/files/Pulse%26PoleDevLog.pdf' },
  alienated: { title: 'Alienated — Global Game Jam 2026', file: 'assets/files/Alienated-Global-Game-Jam-2026.pdf' },
  'alienated-symbols': { title: 'Alienated — Symbol Cheat Sheet', file: 'assets/images/alienated-cheat-sheet.png', type: 'image' }
};
const chosen = documents[new URLSearchParams(location.search).get('doc')];
const status = document.querySelector('#status');
const pages = document.querySelector('#pages');
document.querySelector('#zoom').addEventListener('change', event => {
  pages.style.width = `${event.target.value}%`;
  pages.style.maxWidth = event.target.value === '100' ? '1100px' : 'none';
});
async function load() {
  if (!chosen) throw new Error('Unknown document');
  document.title = chosen.title;
  document.querySelector('#title').textContent = chosen.title;
  const download = document.querySelector('#download');
  download.href = chosen.file;
  download.hidden = false;
  if (chosen.type === 'image') {
    download.textContent = 'Download image';
    const image = document.createElement('img');
    image.alt = 'Alienated symbol cheat sheet: Neutral A and B (0), Good (+1), Bad (-1), Very Good (+2), Very Bad (-2), Copy Previous, Copy Next, Copy First, Reset, Invert, and Nullify Next.';
    image.style.cssText = 'display:block;width:100%;height:auto';
    image.addEventListener('load', () => { status.textContent = 'Scroll to explore · Use zoom for a closer look'; });
    image.addEventListener('error', () => { status.textContent = 'The image could not load. Use Download image above to open a copy.'; });
    image.src = chosen.file;
    pages.append(image);
    return;
  }
  const pdfjs = await import('./assets/vendor/pdfjs/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('./assets/vendor/pdfjs/build/pdf.worker.mjs', import.meta.url).href;
  const pdf = await pdfjs.getDocument({
    url: chosen.file,
    cMapUrl: './assets/vendor/pdfjs/cmaps/', cMapPacked: true,
    standardFontDataUrl: './assets/vendor/pdfjs/standard_fonts/',
    wasmUrl: './assets/vendor/pdfjs/wasm/',
    isEvalSupported: false
  }).promise;
  status.textContent = `${pdf.numPages} pages · Scroll to read`;
  // Render only nearby pages to keep the two independent previews responsive.
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      renderPage(entry.target).catch(() => {
        entry.target.textContent = 'This page could not load. Use Download PDF above to keep a copy.';
      });
    }
  }, { rootMargin: '600px' });
  async function renderPage(section) {
    const number = Number(section.dataset.page);
    const page = await pdf.getPage(number);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 1500 / base.width });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Page ${number}. Read the page text below.`);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    section.replaceChildren(canvas);
    section.style.minHeight = '';
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = `Page ${number} text`;
    const text = document.createElement('div');
    text.className = 'page-text';
    const content = await page.getTextContent();
    text.textContent = content.items.map(item => item.str + (item.hasEOL ? '\n' : ' ')).join('');
    details.append(summary, text);
    section.append(details);
    page.cleanup();
  }
  for (let number = 1; number <= pdf.numPages; number++) {
    const section = document.createElement('section');
    section.className = 'page';
    section.dataset.page = number;
    section.setAttribute('aria-label', `Page ${number}`);
    section.style.minHeight = '650px';
    section.textContent = `Loading page ${number}…`;
    pages.append(section);
    observer.observe(section);
  }
}
load().catch(error => {
  console.error('Document preview failed:', error);
  status.textContent = 'The preview could not load. Use Download PDF above to keep a copy and read it.';
});
