/* Portfolio Template — based on diyor.design */

const REVEAL_THRESHOLD = 0.15;

/* --- Scroll Reveal --- */

function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: REVEAL_THRESHOLD }
  );

  reveals.forEach((el, i) => {
    el.style.transitionDelay = `${i * 50}ms`;
    observer.observe(el);
  });
}

/* --- External links inside project cards (stop bubbling to parent <a>) --- */

function initProjectLinks() {
  document.querySelectorAll('.project-name-link[data-href]').forEach((link) => {
    function openLink(e) {
      e.stopPropagation();
      e.preventDefault();
      window.open(link.dataset.href, '_blank');
    }
    link.addEventListener('click', openLink);
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openLink(e);
    });
  });
}

/* --- GoatCounter Events --- */

function initGoatCounterEvents() {
  if (!window.goatcounter || !window.goatcounter.count) return;

  function gc(name, title) {
    window.goatcounter.count({ path: name, title: title, event: true });
  }

  /* External project links */
  document.querySelectorAll('.project-name-link').forEach((el) => {
    el.addEventListener('click', () => {
      const name = el.closest('.project-item')
        ?.querySelector('.project-name-title')?.textContent?.trim() || 'unknown';
      gc('ext-' + name.toLowerCase().replace(/\s+/g, '-'), 'External: ' + name);
    });
  });

  /* Language switcher */
  document.querySelectorAll('.nav-lang a').forEach((el) => {
    el.addEventListener('click', () => {
      const lang = el.href.includes('/en/') || el.textContent.trim() === 'En' ? 'en' : 'ru';
      gc('lang-switch-to-' + lang, 'Language: ' + lang.toUpperCase());
    });
  });

  /* Contact links on about page */
  document.querySelectorAll('.about-links a').forEach((el) => {
    el.addEventListener('click', () => {
      const channel = el.textContent.trim().toLowerCase();
      gc('contact-' + channel, 'Contact: ' + channel);
    });
  });

  /* Scroll depth on case pages (fire once at 90%) */
  if (document.querySelector('.main--case')) {
    let scrollFired = false;
    window.addEventListener('scroll', () => {
      if (scrollFired) return;
      const pct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (pct >= 0.9) {
        scrollFired = true;
        const caseName = document.title.split('\u2014')[0].trim().toLowerCase().replace(/\s+/g, '-');
        gc('read-complete-' + caseName, 'Read complete: ' + caseName);
      }
    });
  }
}

/* Shared observer reference for re-observing on tab switch */
let observer;

/* --- Lightbox --- */

function initLightbox() {
  const overlay = document.createElement('div');
  overlay.className = 'case-lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Image viewer');
  overlay.innerHTML = '<img alt=""><button class="lb-close" aria-label="Close">&times;</button>';
  document.body.appendChild(overlay);
  let previousFocus = null;

  const lbImg = overlay.querySelector('img');
  let scale = 1, panX = 0, panY = 0;
  const SCALE_MIN = 1, SCALE_MAX = 5, SCALE_STEP = 0.15;

  let isDragging = false, dragStartX = 0, dragStartY = 0, dragMoved = false;

  function applyTransform() {
    if (scale > 1) {
      lbImg.style.transform = 'scale(' + scale + ') translate(' + (panX / scale) + 'px,' + (panY / scale) + 'px)';
      lbImg.style.cursor = 'grab';
    } else {
      lbImg.style.transform = '';
      lbImg.style.cursor = 'zoom-in';
      panX = 0; panY = 0;
    }
  }

  function resetZoom() {
    scale = 1; panX = 0; panY = 0;
    applyTransform();
  }

  function openOverlay(src) {
    lbImg.src = src;
    lbImg.style.maxWidth = '95vw';
    lbImg.style.maxHeight = '95vh';
    lbImg.style.width = 'auto';
    lbImg.style.height = 'auto';
    resetZoom();
    overlay.classList.add('open');
    overlay.style.touchAction = 'none';
    previousFocus = document.activeElement;
    overlay.querySelector('.lb-close').focus();
  }

  function closeOverlay() {
    overlay.classList.remove('open');
    overlay.style.touchAction = '';
    resetZoom();
    if (previousFocus) previousFocus.focus();
  }

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      overlay.querySelector('.lb-close').focus();
    }
  });

  document.addEventListener('click', (e) => {
    const img = e.target.closest('.case-img-full, .case-img-row img');
    if (!img) return;
    let src = img.src;
    const picture = img.closest('picture');
    if (picture) {
      const source = picture.querySelector('source[srcset]');
      if (source) src = source.getAttribute('srcset');
    }
    openOverlay(src);
  });

  overlay.addEventListener('click', (e) => {
    if (dragMoved) { dragMoved = false; return; }
    closeOverlay();
  });

  overlay.addEventListener('mousedown', (e) => {
    if (scale <= 1) return;
    isDragging = true; dragMoved = false;
    dragStartX = e.clientX - panX;
    dragStartY = e.clientY - panY;
    lbImg.style.cursor = 'grabbing';
    e.preventDefault();
  });

  overlay.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panX = e.clientX - dragStartX;
    panY = e.clientY - dragStartY;
    dragMoved = true;
    applyTransform();
  });

  overlay.addEventListener('mouseup', () => {
    isDragging = false;
    if (scale > 1) lbImg.style.cursor = 'grab';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOverlay();
  });

  overlay.addEventListener('wheel', (e) => {
    if (!overlay.classList.contains('open')) return;
    e.preventDefault();
    if (e.deltaY < 0) {
      scale = Math.min(SCALE_MAX, scale + SCALE_STEP);
    } else {
      scale = Math.max(SCALE_MIN, scale - SCALE_STEP);
    }
    applyTransform();
  }, { passive: false });
}

/* --- Mobile burger menu --- */

function initBurger() {
  const burger = document.querySelector('.nav-burger');
  const mobile = document.querySelector('.nav-mobile');
  if (!burger || !mobile) return;

  const links = document.querySelector('.nav-links');
  const lang = document.querySelector('.nav-lang');
  if (links) {
    links.querySelectorAll('a').forEach(a => {
      const clone = a.cloneNode(true);
      mobile.appendChild(clone);
    });
  }
  if (lang) {
    const langDiv = document.createElement('div');
    langDiv.className = 'nav-mobile-lang';
    langDiv.innerHTML = lang.innerHTML;
    mobile.appendChild(langDiv);
  }

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    mobile.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    mobile.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobile.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      burger.classList.remove('open');
      mobile.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      mobile.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobile.classList.contains('open')) {
      burger.click();
    }
  });
}

/* --- Terminal Easter Egg (press ~) --- */

function initTerminal() {
  let el = null;
  const isRu = !location.pathname.includes('/en/');
  const history = [];
  let historyIdx = -1;

  const fortunes = [
    '"Good design is as little design as possible." \u2014 Dieter Rams',
    '"Design is not just what it looks like. Design is how it works." \u2014 Steve Jobs',
    '"Simplicity is the ultimate sophistication." \u2014 Leonardo da Vinci',
    '"The details are not the details. They make the design." \u2014 Charles Eames',
    '"Less, but better." \u2014 Dieter Rams',
    '"Design is intelligence made visible." \u2014 Alina Wheeler',
    '"White space is to be regarded as an active element, not a passive background." \u2014 Jan Tschichold',
    '"Typography is the craft of endowing human language with a durable visual form." \u2014 Robert Bringhurst',
    '"Have no fear of perfection \u2014 you\'ll never reach it." \u2014 Salvador Dal\u00ed',
    '"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." \u2014 Antoine de Saint-Exup\u00e9ry',
    '"Make it simple, but significant." \u2014 Don Draper',
    '"Design creates culture. Culture shapes values. Values determine the future." \u2014 Robert L. Peters',
    '"People ignore design that ignores people." \u2014 Frank Chimero',
    '"Styles come and go. Good design is a language, not a style." \u2014 Massimo Vignelli',
    '"Design is thinking made visual." \u2014 Saul Bass',
  ];

  const commandNames = ['help', 'projects', 'contact', 'skills', 'about', 'fortune', 'sudo', 'clear', 'exit'];

  const commands = {
    help: () => isRu
      ? 'projects\ncontact\nskills\nabout\nfortune          \u0446\u0438\u0442\u0430\u0442\u0430 \u043e \u0434\u0438\u0437\u0430\u0439\u043d\u0435\nsudo\nclear\nexit'
      : 'projects\ncontact\nskills\nabout\nfortune          design quote\nsudo\nclear\nexit',
    projects: () => 'Project Alpha \u00b7 Project Beta \u00b7 Project Gamma',
    contact: () => 'email: hello@example.com\ntelegram: @janesmith',
    skills: () =>
      'Design:  Product, Brand, UI/UX\nCode:    HTML, CSS, JavaScript',
    about: () => isRu
      ? 'Jane Smith \u2014 \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u043e\u0432\u044b\u0439 \u0434\u0438\u0437\u0430\u0439\u043d\u0435\u0440.'
      : 'Jane Smith \u2014 product designer.',
    fortune: () => {
      if (!commands._fortunePool || !commands._fortunePool.length)
        commands._fortunePool = fortunes.slice().sort(() => Math.random() - 0.5);
      return commands._fortunePool.pop();
    },
    sudo: () => isRu ? '\u0423 \u0432\u0430\u0441 \u043d\u0435\u0442 \u043f\u0440\u0430\u0432. \u041d\u043e \u0435\u0441\u0442\u044c \u0432\u043a\u0443\u0441.' : 'Permission denied. But you have great taste.',
    clear: () => '__CLEAR__',
    exit: () => '__EXIT__',
  };

  function create() {
    el = document.createElement('div');
    el.id = 'terminal';
    el.innerHTML =
      '<div id="term-header"><span>~/portfolio</span><button id="term-close">&times;</button></div>' +
      '<div id="term-body"><div id="term-output"></div>' +
      '<div id="term-line"><span id="term-prompt">\u2192</span><input id="term-input" type="text" autocomplete="off" spellcheck="false"></div></div>' +
      '<div id="term-footer">\u2191\u2193 history \u00b7 Tab autocomplete \u00b7 clear \u00b7 Esc close</div>';
    document.body.appendChild(el);

    const style = document.createElement('style');
    style.textContent =
      '#terminal{position:fixed;bottom:24px;right:24px;width:500px;max-width:calc(100vw - 32px);' +
      'background:#1a1a1a;border-radius:12px;box-shadow:0 16px 48px rgba(0,0,0,.35);z-index:9999;' +
      'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;overflow:hidden;' +
      'animation:termIn .25s ease}' +
      '@keyframes termIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}' +
      '#term-header{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;' +
      'background:#252525;color:#888;font-size:12px;user-select:none}' +
      '#term-close{background:none;border:none;color:#666;font-size:18px;cursor:pointer;padding:0 4px;line-height:1}' +
      '#term-close:hover{color:#fff}' +
      '#term-body{padding:12px 14px 14px;max-height:320px;overflow-y:auto}' +
      '#term-output{color:#ccc;white-space:pre-wrap;word-break:break-word;line-height:1.5}' +
      '#term-output .cmd{color:#f8401c}' +
      '#term-output .out{color:#aaa}' +
      '#term-line{display:flex;align-items:center;gap:8px;margin-top:8px}' +
      '#term-prompt{color:#f8401c;flex-shrink:0}' +
      '#term-input{flex:1;background:none;border:none;color:#fff;font:inherit;outline:none;caret-color:#f8401c}' +
      '#term-footer{padding:8px 14px;background:#252525;color:#555;font-size:11px;border-top:1px solid #333}';
    document.head.appendChild(style);

    const input = el.querySelector('#term-input');
    const output = el.querySelector('#term-output');
    const welcome = isRu ? '\u041f\u0440\u0438\u0432\u0435\u0442. \u0412\u0432\u0435\u0434\u0438 help \u0434\u043b\u044f \u0441\u043f\u0438\u0441\u043a\u0430 \u043a\u043e\u043c\u0430\u043d\u0434.' : 'Hi. Type help for available commands.';
    output.innerHTML = '<span class="out">' + welcome + '</span>\n';
    input.focus();

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length && historyIdx < history.length - 1) {
          historyIdx++;
          input.value = history[history.length - 1 - historyIdx];
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx > 0) {
          historyIdx--;
          input.value = history[history.length - 1 - historyIdx];
        } else {
          historyIdx = -1;
          input.value = '';
        }
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        const partial = input.value.trim().toLowerCase();
        if (!partial) return;
        const match = commandNames.find(c => c.startsWith(partial));
        if (match) input.value = match;
        return;
      }

      if (e.key !== 'Enter') return;
      const raw = input.value.trim();
      const cmd = raw.toLowerCase();
      input.value = '';
      if (!cmd) return;

      history.push(raw);
      historyIdx = -1;

      output.innerHTML += '<span class="cmd">\u2192 ' + raw + '</span>\n';

      const fn = commands[cmd];
      if (fn) {
        const result = fn();
        if (result === '__CLEAR__') { output.innerHTML = ''; return; }
        if (result === '__EXIT__') { destroy(); return; }
        output.innerHTML += '<span class="out">' + result + '</span>\n';
      } else {
        const msg = isRu ? '\u041d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u0430\u044f \u043a\u043e\u043c\u0430\u043d\u0434\u0430. \u0412\u0432\u0435\u0434\u0438 help.' : 'Unknown command. Type help.';
        output.innerHTML += '<span class="out">' + msg + '</span>\n';
      }
      el.querySelector('#term-body').scrollTop = 9999;
    });

    el.querySelector('#term-close').addEventListener('click', destroy);
  }

  function destroy() {
    if (el) { el.remove(); el = null; }
  }

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Backquote' || e.key === '`' || e.key === '\u0451' || e.key === '\u0401') {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
      if (el) destroy(); else create();
    }
    if (e.key === 'Escape' && el) {
      destroy();
    }
  });
}

/* --- Email copy with tooltip --- */

function initEmailCopy() {
  const emailLink = document.querySelector('a[href^="mailto:"]');
  if (!emailLink) return;

  emailLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = emailLink.href.replace('mailto:', '');
    navigator.clipboard.writeText(email).then(() => {
      const tip = document.createElement('span');
      tip.textContent = document.documentElement.lang === 'en' ? 'Copied!' : '\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u043e!';
      tip.style.cssText =
        'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
        'background:#222;color:#fff;padding:8px 20px;border-radius:8px;font-family:var(--font-sans);' +
        'font-size:14px;z-index:10000;animation:tipFade 1.5s ease forwards;pointer-events:none';
      if (!document.getElementById('tip-fade-style')) {
        var style = document.createElement('style');
        style.id = 'tip-fade-style';
        style.textContent = '@keyframes tipFade{0%{opacity:0;transform:translate(-50%,-50%) scale(.9)}10%{opacity:1;transform:translate(-50%,-50%) scale(1)}70%{opacity:1}100%{opacity:0;transform:translate(-50%,-60%)}}';
        document.head.appendChild(style);
      }
      document.body.appendChild(tip);
      setTimeout(() => { tip.remove(); }, 1600);
    }).catch(() => {
      window.location.href = emailLink.href;
    });
  });
}

/* --- Vanilla Badge --- */

function initVanillaBadge() {
  const p = location.pathname;
  if (p.includes('/projects/') || p.includes('about')) return;

  const badge = document.createElement('div');
  badge.innerHTML =
    '<span style="opacity:.5">0 frameworks \u00b7 0 dependencies \u00b7 vanilla everything</span>';

  badge.style.cssText =
    'position:fixed;bottom:16px;left:50%;transform:translateX(-50%) translateY(20px);' +
    'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;' +
    'color:#999;background:rgba(255,255,255,.55);padding:8px 16px;border-radius:6px;' +
    '-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);' +
    'border:1px solid rgba(0,0,0,.06);' +
    'pointer-events:auto;white-space:nowrap;' +
    'transition:all .3s;z-index:1;cursor:default;opacity:0';

  document.body.appendChild(badge);

  setTimeout(() => {
    badge.style.opacity = '1';
    badge.style.transform = 'translateX(-50%) translateY(0)';
  }, 2000);

  document.addEventListener('mousemove', (e) => {
    const hot = e.clientY > window.innerHeight - 80;
    badge.style.background = hot ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,.55)';
    badge.style.color = hot ? '#000' : '#999';
  });
}

/* --- Design System Toggle (Shift+G) --- */

function initDesignSystemToggle() {
  let overlay = null;
  let styleEl = null;

  function create() {
    overlay = document.createElement('div');
    overlay.id = 'ds-overlay';

    styleEl = document.createElement('style');
    styleEl.id = 'ds-style';
    styleEl.textContent =
      '#ds-overlay{position:fixed;inset:0;z-index:9990;pointer-events:none;animation:dsIn .2s ease}' +
      '@keyframes dsIn{from{opacity:0}to{opacity:1}}' +
      '#ds-grid{position:absolute;inset:0;max-width:calc(var(--content-max) + var(--side-padding)*2);' +
      'margin:0 auto;padding:0 var(--side-padding);display:flex;gap:20px}' +
      '#ds-grid .col{flex:1;background:rgba(248,64,28,0.04);border-left:1px solid rgba(248,64,28,0.1);' +
      'border-right:1px solid rgba(248,64,28,0.1)}' +
      '#ds-panel{position:fixed;bottom:52px;left:50%;transform:translateX(-50%);' +
      'background:#1a1a1a;color:#ccc;border-radius:12px;padding:14px 20px;' +
      'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;' +
      'display:flex;gap:20px;align-items:center;pointer-events:auto;' +
      'box-shadow:0 12px 40px rgba(0,0,0,.3);white-space:nowrap}' +
      '#ds-panel .sw{width:14px;height:14px;border-radius:3px;display:inline-block;' +
      'vertical-align:middle;margin-right:5px;box-shadow:0 0 0 1px rgba(255,255,255,.15)}' +
      '#ds-panel .sep{width:1px;height:20px;background:rgba(255,255,255,.12)}' +
      '#ds-panel .lb{color:#666;font-size:9px;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:1px}';
    document.head.appendChild(styleEl);

    const root = getComputedStyle(document.documentElement);
    const bg = root.getPropertyValue('--bg').trim();
    const accent = root.getPropertyValue('--accent').trim();
    const text = root.getPropertyValue('--text').trim();
    const dim = root.getPropertyValue('--text-dim').trim();
    const font = root.getPropertyValue('--font-sans').trim().split(',')[0].replace(/'/g, '');
    const mono = root.getPropertyValue('--font-mono').trim().split(',')[0].replace(/'/g, '');

    let gridHTML = '<div id="ds-grid">';
    for (let i = 0; i < 12; i++) gridHTML += '<div class="col"></div>';
    gridHTML += '</div>';

    overlay.innerHTML = gridHTML +
      '<div id="ds-panel">' +
        '<div><span class="lb">Colors</span>' +
        `<span class="sw" style="background:${bg}"></span>bg ` +
        `<span class="sw" style="background:${accent}"></span>accent ` +
        `<span class="sw" style="background:${text}"></span>text ` +
        `<span class="sw" style="background:${dim}"></span>dim</div>` +
        '<div class="sep"></div>' +
        `<div><span class="lb">Type</span>${font} \u00b7 ${mono}</div>` +
        '<div class="sep"></div>' +
        '<div><span class="lb">Layout</span>1156px \u00b7 12 col \u00b7 20px gap</div>' +
      '</div>';

    document.body.appendChild(overlay);
  }

  function destroy() {
    if (overlay) { overlay.remove(); overlay = null; }
    if (styleEl) { styleEl.remove(); styleEl = null; }
  }

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.shiftKey && e.code === 'KeyG') {
      e.preventDefault();
      if (overlay) destroy(); else create();
    }
  });
}

/* --- Nav scroll line --- */

function initNavScrollLine() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

/* --- Reading Progress Bar --- */

function initReadingProgress() {
  if (!document.querySelector('.main--case')) return;

  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  document.body.appendChild(bar);

  function update() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) * 100 : 0;
    bar.style.width = pct + '%';
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  update();
}

/* --- Cursor trail on 404 --- */

function initCursorTrail() {
  if (!document.querySelector('.e404')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const CELL = 24;
  const POOL_SIZE = 30;
  const pool = [];
  let idx = 0;
  const visited = new Set();

  for (let i = 0; i < POOL_SIZE; i++) {
    const px = document.createElement('div');
    px.style.cssText =
      'position:fixed;width:' + CELL + 'px;height:' + CELL + 'px;pointer-events:none;z-index:9990;' +
      'opacity:0;transition:opacity 1.2s ease;';
    document.body.appendChild(px);
    pool.push(px);
  }

  document.addEventListener('mousemove', (e) => {
    const gx = Math.floor(e.clientX / CELL) * CELL;
    const gy = Math.floor(e.clientY / CELL) * CELL;
    const key = gx + ',' + gy;

    if (visited.has(key)) return;
    visited.add(key);
    setTimeout(() => visited.delete(key), 1200);

    const px = pool[idx];
    idx = (idx + 1) % POOL_SIZE;

    px.style.transition = 'none';
    px.style.background = '#F8401C';
    px.style.left = gx + 'px';
    px.style.top = gy + 'px';
    px.style.opacity = '0.25';

    requestAnimationFrame(() => {
      px.style.transition = 'opacity 1.2s ease';
      px.style.opacity = '0';
    });
  });
}

/* --- Animated stat counters --- */

function initStatCounters() {
  const stats = document.querySelectorAll('.case-stat-value');
  if (!stats.length) return;

  const ob = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      ob.unobserve(entry.target);
      animateStat(entry.target);
    });
  }, { threshold: 0.5 });

  stats.forEach(el => ob.observe(el));
}

function animateStat(el) {
  const raw = el.textContent.trim();
  const match = raw.match(/^([+\u2212\u2212-]?)(\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) return;

  const prefix = match[1];
  const target = parseFloat(match[2].replace(',', '.'));
  const suffix = match[3];
  const isFloat = match[2].includes('.') || match[2].includes(',');
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const val = target * ease;
    el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* --- Skeleton cleanup --- */

function initSkeletonCleanup() {
  document.querySelectorAll('.case-img-full, .case-img-row img, picture img').forEach(img => {
    if (img.complete) { img.dataset.loaded = ''; return; }
    img.addEventListener('load', () => { img.dataset.loaded = ''; }, { once: true });
  });
}

/* --- Theme Toggle --- */

function initThemeToggle() {
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');

  if (stored === 'dark') root.classList.add('dark');
  else if (stored === 'light') root.classList.add('light');

  const navLang = document.querySelector('.nav-lang');
  if (!navLang) return;

  const btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.setAttribute('aria-label', 'Toggle dark mode');
  btn.innerHTML = '<span class="icon-moon">\u263D</span><span class="icon-sun">\u2600</span>';
  navLang.prepend(btn);

  const mobileNav = document.querySelector('.nav-mobile');
  if (mobileNav) {
    const mBtn = btn.cloneNode(true);
    mBtn.style.fontSize = '28px';
    mBtn.style.marginRight = '0';
    mBtn.style.marginTop = '8px';
    mobileNav.appendChild(mBtn);
    mBtn.addEventListener('click', toggle);
  }

  function isDark() {
    return root.classList.contains('dark') ||
      (!root.classList.contains('light') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function toggle() {
    if (isDark()) {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }

  btn.addEventListener('click', toggle);
}

/* --- Init --- */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavScrollLine();
  initScrollReveal();
  initProjectLinks();
  initLightbox();
  initBurger();
  initTerminal();
  initEmailCopy();
  initDesignSystemToggle();
  initVanillaBadge();
  initReadingProgress();
  initStatCounters();
  initCursorTrail();
  initSkeletonCleanup();

  /* GoatCounter loads async */
  try {
    const gcInterval = setInterval(() => {
      if (window.goatcounter && window.goatcounter.count) {
        clearInterval(gcInterval);
        initGoatCounterEvents();
      }
    }, 500);
    setTimeout(() => clearInterval(gcInterval), 5000);
  } catch (_) {}
});

/* Suppress View Transitions AbortError */
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && e.reason.name === 'AbortError') e.preventDefault();
});
