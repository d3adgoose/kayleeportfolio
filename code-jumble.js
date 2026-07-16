(() => {
  const layer = document.querySelector('.code-jumble-layer');
  if (!layer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const tokens = ['</>', '{ }', '01', '( )', '[ ]', '=>', '++', '//', '#', '*', 'C#', 'if', 'for', 'UI', 'git', '∿', '〰', '~~~'];
  const colors = [
    'rgba(111,58,255,.2)',
    'rgba(139,84,211,.19)',
    'rgba(91,51,148,.17)',
    'rgba(31,27,46,.14)',
    'rgba(108,103,128,.16)'
  ];
  const glows = [
    'rgba(111,58,255,.34)',
    'rgba(166,111,232,.3)',
    'rgba(92,59,145,.27)',
    'rgba(31,27,46,.16)',
    'rgba(108,103,128,.2)'
  ];
  const count = Math.min(28, Math.max(14, Math.round(window.innerWidth / 62)));
  const pieces = [];

  for (let i = 0; i < count; i += 1) {
    const el = document.createElement('span');
    const token = tokens[i % tokens.length];
    const isSquiggle = token === '∿' || token === '〰' || token === '~~~';
    el.className = `code-jumble-piece${i % 5 === 0 ? ' code-jumble-piece--glow' : ''}${isSquiggle ? ' code-jumble-piece--squiggle' : ''}`;
    el.textContent = token;
    const depth = .65 + (i % 4) * .16;
    el.style.fontSize = `${11 + (i % 6) * 3}px`;
    el.style.setProperty('--code-color', colors[i % colors.length]);
    el.style.setProperty('--code-glow-color', glows[i % glows.length]);
    el.style.setProperty('--code-glow', i % 5 === 0 ? '9px' : '2px');
    el.style.animationDelay = `${-(i % 7) * .45}s`;
    layer.appendChild(el);

    pieces.push({
      el,
      x: Math.random() * Math.max(1, window.innerWidth - 40),
      y: Math.random() * Math.max(1, window.innerHeight - 40),
      vx: (0.1 + Math.random() * 0.2) * depth * (i % 2 ? 1 : -1),
      vy: (0.09 + Math.random() * 0.18) * depth * (i % 3 ? 1 : -1),
      size: 24 + (i % 6) * 3,
      rotation: Math.random() * 24 - 12,
      spin: (Math.random() * .018 + .006) * (i % 2 ? 1 : -1),
      depth
    });
  }

  let previous = performance.now();

  const animate = (now) => {
    const step = Math.min(2, (now - previous) / 16.67);
    previous = now;
    const width = window.innerWidth;
    const height = window.innerHeight;

    pieces.forEach((piece) => {
      piece.x += piece.vx * step;
      piece.y += piece.vy * step;
      piece.rotation += piece.spin * step;

      if (piece.x <= 0 || piece.x + piece.size >= width) {
        piece.vx *= -1;
        piece.x = Math.max(0, Math.min(piece.x, width - piece.size));
      }
      if (piece.y <= 0 || piece.y + piece.size >= height) {
        piece.vy *= -1;
        piece.y = Math.max(0, Math.min(piece.y, height - piece.size));
      }

      piece.el.style.transform = `translate3d(${piece.x}px, ${piece.y}px, 0) rotate(${piece.rotation}deg) scale(${piece.depth})`;
    });

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
})();
