import './style.css';
import { icon } from './icons';
import { celebrate, stopCelebration } from './confetti';
import { clamp, constrain, imagePoint, zoomAt, panBy, hitDifference, shuffle } from './geometry.mjs';
type Difference = { id: string; label: string; x: number; y: number; radius: number; bounds: { x: number; y: number; width: number; height: number } };
type Round = { id: string; sceneId: string; variant: number; title: string; subtitle: string; original: string; image: string; thumbnail: string; width: number; height: number; differences: Difference[] };
type View = { x: number; y: number; zoom: number };
type Save = { roundId: string; found: string[]; seconds: number; completed: string[]; hints: number };
const app = document.querySelector<HTMLDivElement>('#app')!;
const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
let rounds: Round[] = [], round: Round;
let view: View = { x: .5, y: .5, zoom: 1 };
let found: string[] = [], completed: string[] = [], deck: string[] = [];
let seconds = 0, hints = 0, loadingGeneration = 0, liveTimer = 0;
let ready = false, modalOpen = false;
let save: Partial<Save> = {};
try { save = JSON.parse(localStorage.getItem('little-differences-v1') || '{}') || {}; } catch { /* Storage is optional. */ }
const $ = <T extends Element = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
function persist() {
  try { localStorage.setItem('little-differences-v1', JSON.stringify({ roundId: round.id, found, seconds, completed, hints })); } catch { /* Still playable without storage. */ }
}
async function init() {
  app.innerHTML = '<div class="boot"><span class="boot-mark">◌</span><p>Finding a little moment of calm…</p></div>';
  try {
    const response = await fetch(assetUrl('data/puzzles.json'));
    if (!response.ok) throw new Error('The puzzle collection could not be loaded.');
    rounds = (await response.json()).rounds;
    if (!rounds.length) throw new Error('No puzzles are available yet.');
    completed = Array.isArray(save.completed) ? save.completed.filter(id => rounds.some(r => r.id === id)) : [];
    const initial = rounds.find(r => r.id === save.roundId) || pickNext();
    shell(); loadRound(initial, initial.id === save.roundId);
    setInterval(() => {
      if (ready && found.length < 5 && !modalOpen && !document.hidden) { seconds++; updateTime(); if (seconds % 5 === 0) persist(); }
    }, 1000);
    window.addEventListener('pagehide', persist);
    window.addEventListener('blur', hideMirrorCursor);
  } catch (error) {
    app.innerHTML = `<div class="boot"><h1>A small pause</h1><p>${error instanceof Error ? error.message : 'Something went wrong.'}</p><button onclick="location.reload()">Try again</button></div>`;
  }
}
function shell() {
  app.innerHTML = `
  <aside class="sidebar">
    <a class="brand" href="./" aria-label="Five Circles home"><span class="brand-symbol">${icon('mark')}</span><span>Five<br>Circles<span class="brand-dot">.</span></span></a>
    <div class="side-label">YOUR LITTLE ESCAPE</div>
    <button class="nav-item active" id="play-nav">${icon('mark')}<span>Find the differences</span><span class="nav-indicator"></span></button>
    <button class="nav-item" id="collection-nav">${icon('grid')}<span>The collection</span><span class="count">9</span></button>
    <div class="sidebar-divider"></div><div class="side-label scenes-label">SCENES TO GET LOST IN <span>09</span></div>
    <div id="scene-list" class="scene-list"></div>
    <div class="sidebar-bottom"><span class="leaf-stamp">${icon('leaf')}</span><p>No rush. No pressure.<br>Just a little closer.</p><span class="made-for">A MOMENT, JUST FOR YOU</span></div>
  </aside>
  <main>
    <header class="topbar"><span class="breadcrumb">THE LITTLE THINGS <span>/</span> <b>PLAY</b></span><button class="quiet-button" id="how-to">${icon('help')}<span>How to play</span></button></header>
    <section class="game-heading"><div><div class="eyebrow"><span></span>A MOMENT TO NOTICE</div><h1>Look a little closer<span>.</span></h1><p>Two almost-identical pictures. Five little differences. Take your time.</p></div><button class="button secondary" id="new-round" aria-label="New random scene">${icon('shuffle')}<span>New scene</span></button></section>
    <section class="game-card" aria-label="Find the differences game">
      <div class="game-meta"><div><span class="scene-index" id="scene-index"></span><h2 id="scene-title"></h2><p id="scene-subtitle"></p></div><div class="timer" aria-label="Time played">${icon('clock')}<span id="timer">00:00</span></div></div>
      <div class="progress-row"><div class="progress-label"><strong id="found-count">0</strong><span>/ 5 found</span></div><div class="progress-dots" id="progress-dots" aria-label="0 of 5 differences found"></div><span class="small-note">A good eye takes its time.</span></div>
      <div class="board-wrap"><div id="board" class="board"></div><div id="load-state" class="load-state" hidden>Getting your scene ready…</div></div>
      <div id="completion" class="completion" hidden></div>
      <div class="game-toolbar"><div class="linked">${icon('mark')}<span>Views stay in sync</span></div><div class="zoom-controls" aria-label="Image zoom"><button class="icon-button" id="zoom-out" aria-label="Zoom out">${icon('minus')}</button><output id="zoom-level" aria-live="polite">100%</output><button class="icon-button" id="zoom-in" aria-label="Zoom in">${icon('plus')}</button><span class="control-divider"></span><button class="icon-button" id="reset-view" aria-label="Fit images to view">${icon('fit')}</button></div><button class="hint-button" id="hint">${icon('hint')}<span>A little hint</span></button></div>
    </section>
    <footer class="game-footer"><span>${icon('hand')} Drag to explore <i>·</i> Scroll or pinch to zoom <i>·</i> Tap a difference in either picture</span><span class="collection-progress" id="collection-progress"></span></footer>
    <div id="announcement" class="sr-only" aria-live="polite" role="status"></div><div id="toast" class="toast" role="status"></div>
  </main><dialog id="modal" aria-labelledby="modal-title"></dialog>`;
  $('#new-round').addEventListener('click', () => loadRound(pickNext()));
  $('#collection-nav').addEventListener('click', openCollection);
  $('#play-nav').addEventListener('click', () => $('main').scrollIntoView({ behavior: 'smooth' }));
  $('#how-to').addEventListener('click', openHelp);
  $('#zoom-in').addEventListener('click', () => setView(constrain({ ...view, zoom: view.zoom + .5 })));
  $('#zoom-out').addEventListener('click', () => setView(constrain({ ...view, zoom: view.zoom - .5 })));
  $('#reset-view').addEventListener('click', () => setView({ x: .5, y: .5, zoom: 1 }));
  $('#hint').addEventListener('click', showHint);
  const modal = $<HTMLDialogElement>('#modal');
  modal.addEventListener('close', () => { modalOpen = false; });
  modal.addEventListener('click', e => { const r = modal.getBoundingClientRect(); if (e.target === modal && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) modal.close(); });
}
function pickNext() {
  deck = deck.filter(id => id !== round?.id && !completed.includes(id));
  if (!deck.length) deck = shuffle(rounds.filter(r => r.id !== round?.id && !completed.includes(r.id)).map(r => r.id));
  if (!deck.length) deck = shuffle(rounds.filter(r => r.id !== round?.id).map(r => r.id));
  return rounds.find(r => r.id === deck.pop()) || rounds[0];
}
async function loadRound(next: Round, resume = false) {
  stopCelebration();
  const generation = ++loadingGeneration;
  ready = false; round = next; view = { x: .5, y: .5, zoom: 1 };
  found = resume && Array.isArray(save.found) ? [...new Set(save.found.filter(id => next.differences.some(d => d.id === id)))] : [];
  seconds = resume && Number.isFinite(save.seconds) ? Math.max(0, save.seconds!) : 0;
  hints = resume && Number.isFinite(save.hints) ? Math.max(0, save.hints!) : 0;
  $('#scene-title').textContent = next.title; $('#scene-subtitle').textContent = next.subtitle;
  $('#scene-index').textContent = `SCENE ${String(Math.floor(rounds.indexOf(next) / 2) + 1).padStart(2, '0')} · VARIATION ${next.variant === 1 ? 'A' : 'B'}`;
  const board = $('#board');
  board.className = `board ${next.width > next.height ? 'stacked' : 'side-by-side'}`;
  board.innerHTML = [next.original, next.image].map((src, i) => `<div class="image-panel"><div class="panel-label"><span class="panel-letter">${i ? 'B' : 'A'}</span><span>${i ? 'A small change of scenery' : 'A little moment, as it is'}</span><span class="panel-label-end">${i ? 'LOOK CLOSER' : 'THE ORIGINAL'}</span></div><div class="viewport" tabindex="0" role="application" aria-label="${i ? 'Edited' : 'Original'} picture. Tap differences; drag to pan, pinch or scroll to zoom. Keyboard: arrows pan, plus or minus zoom, zero resets." style="aspect-ratio:${next.width}/${next.height}"><div class="image-world"><img src="${assetUrl(src)}" alt="${next.title} — ${i ? 'five small details have changed' : 'original illustration'}" draggable="false"><div class="markers"></div></div><div class="miss-marker"></div><span class="mirror-crosshair" aria-hidden="true" hidden></span></div></div>`).join('');
  document.querySelectorAll<HTMLElement>('.viewport').forEach(bindViewport);
  $('#completion').hidden = true; $('#load-state').hidden = false; $('#load-state').textContent = 'Getting your scene ready…';
  updateProgress(); updateTime(); renderSceneList(); setView(view); persist();
  try {
    await Promise.all([...board.querySelectorAll('img')].map(img => img.decode()));
    if (generation !== loadingGeneration) return;
    ready = true; $('#load-state').hidden = true;
    if (found.length === 5) finish(false);
  } catch {
    if (generation !== loadingGeneration) return;
    $('#load-state').innerHTML = 'This scene could not load. <button id="retry-image">Try again</button>';
    $('#retry-image').addEventListener('click', () => loadRound(next));
  }
}
function renderSceneList() {
  const scenes = rounds.filter(r => r.variant === 1);
  $('#scene-list').innerHTML = scenes.map((r, i) => `<button class="scene-item ${r.sceneId === round.sceneId ? 'selected' : ''}" data-scene="${r.sceneId}" ${r.sceneId === round.sceneId ? 'aria-current="true"' : ''}><img src="${assetUrl(r.thumbnail)}" alt="" loading="lazy"><span><b>${r.title}</b><small>SCENE ${String(i + 1).padStart(2, '0')}</small></span>${rounds.some(q => q.sceneId === r.sceneId && completed.includes(q.id)) ? `<span class="scene-status completed" role="img" aria-label="Completed">${icon('check')}</span>` : '<span class="scene-arrow">↗</span>'}</button>`).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-scene]').forEach(el => el.addEventListener('click', () => { const options = rounds.filter(r => r.sceneId === el.dataset.scene && r.id !== round.id); loadRound(options[Math.floor(Math.random() * options.length)] || rounds.find(r => r.sceneId === el.dataset.scene)!); }));
}
function updateTime() {
  $('#timer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
function setView(next: View) {
  view = constrain(next);
  // Keep markers mounted so camera gestures never restart their discovery animation.
  document.querySelectorAll<HTMLElement>('.image-world').forEach(el => {
    el.style.transform = `translate(${50 - view.x * view.zoom * 100}%, ${50 - view.y * view.zoom * 100}%) scale(${view.zoom})`;
    el.style.setProperty('--marker-scale', String(1 / view.zoom));
  });
  document.querySelectorAll<HTMLElement>('.viewport').forEach(el => el.classList.toggle('zoomed', view.zoom > 1));
  $('#zoom-level').textContent = `${Math.round(view.zoom * 100)}%`;
  $<HTMLButtonElement>('#zoom-out').disabled = view.zoom <= 1; $<HTMLButtonElement>('#zoom-in').disabled = view.zoom >= 5;
}
function renderMarkers() {
  document.querySelectorAll('.markers').forEach(el => {
    el.querySelectorAll('.hint-marker').forEach(marker => marker.remove());
    const renderedIds = new Set([...el.querySelectorAll<HTMLElement>('.found-marker')].map(marker => marker.dataset.differenceId));
    // Append only new discoveries; replacing existing nodes would replay their animation.
    round.differences.filter(d => found.includes(d.id) && !renderedIds.has(d.id)).forEach(d => {
      const marker = document.createElement('span');
      marker.className = 'found-marker';
      marker.dataset.differenceId = d.id;
      marker.style.cssText = `left:${d.x * 100}%;top:${d.y * 100}%;width:${Math.max(d.bounds.width, .034) * 112}%;aspect-ratio:${Math.max(d.bounds.width, .034) * round.width}/${Math.max(d.bounds.height, .034) * round.height}`;
      marker.innerHTML = `<span>${icon('check')}</span>`;
      el.append(marker);
    });
  });
}
function hideMirrorCursor() {
  document.querySelectorAll<HTMLElement>('.mirror-crosshair').forEach(marker => { marker.hidden = true; });
}
function updateMirrorCursor(source: HTMLElement, event: PointerEvent) {
  if (!ready || event.pointerType === 'touch') { hideMirrorCursor(); return; }
  const rect = source.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  document.querySelectorAll<HTMLElement>('.viewport').forEach(viewport => {
    const marker = viewport.querySelector<HTMLElement>('.mirror-crosshair')!;
    marker.hidden = viewport === source || x < 0 || x > 1 || y < 0 || y > 1;
    if (!marker.hidden) {
      // Both images share a camera, so viewport fractions identify the same image point.
      marker.style.left = `${x * 100}%`;
      marker.style.top = `${y * 100}%`;
    }
  });
}
function bindViewport(el: HTMLElement) {
  const pointers = new Map<number, { x: number; y: number }>();
  let start = { x: 0, y: 0 }, moved = false, pinched = false, gestureDistance = 0;
  let gestureView = view, gestureAnchor = { x: .5, y: .5 };
  const local = (x: number, y: number) => { const r = el.getBoundingClientRect(); return { x: x - r.left, y: y - r.top }; };
  const size = () => ({ width: el.clientWidth, height: el.clientHeight });
  el.addEventListener('pointerdown', e => {
    updateMirrorCursor(el, e);
    if (e.button !== 0 || !ready) return;
    el.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) { start = { x: e.clientX, y: e.clientY }; moved = false; pinched = false; }
    if (pointers.size === 2) {
      pinched = true;
      const [a, b] = [...pointers.values()];
      gestureDistance = Math.hypot(a.x - b.x, a.y - b.y); gestureView = { ...view };
      gestureAnchor = imagePoint(local((a.x + b.x) / 2, (a.y + b.y) / 2), size(), gestureView);
    }
    el.classList.add('dragging');
  });
  el.addEventListener('pointermove', e => {
    updateMirrorCursor(el, e);
    const prev = pointers.get(e.pointerId); if (!prev) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) moved = true;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const zoom = clamp(gestureView.zoom * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, gestureDistance), 1, 5);
      const midpoint = local((a.x + b.x) / 2, (a.y + b.y) / 2), s = size();
      setView({ zoom, x: gestureAnchor.x - (midpoint.x / s.width - .5) / zoom, y: gestureAnchor.y - (midpoint.y / s.height - .5) / zoom });
    } else if (moved) setView(panBy(view, { x: e.clientX - prev.x, y: e.clientY - prev.y }, size()));
  });
  el.addEventListener('pointerup', e => {
    if (!pointers.has(e.pointerId)) return;
    if (!moved && !pinched && pointers.size === 1 && Math.hypot(e.clientX - start.x, e.clientY - start.y) <= 6) checkPoint(el, local(e.clientX, e.clientY));
    pointers.delete(e.pointerId);
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    if (!pointers.size) el.classList.remove('dragging');
  });
  el.addEventListener('pointerenter', e => updateMirrorCursor(el, e));
  el.addEventListener('pointerleave', hideMirrorCursor);
  const cancel = (e: PointerEvent) => {
    pointers.delete(e.pointerId); moved = true; el.classList.remove('dragging');
    if (e.type === 'pointercancel') hideMirrorCursor();
  };
  el.addEventListener('pointercancel', cancel); el.addEventListener('lostpointercapture', cancel);
  el.addEventListener('wheel', e => {
    e.preventDefault(); if (!ready) return;
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1;
    if (e.shiftKey) setView(panBy(view, { x: -(e.deltaX || e.deltaY) * unit, y: -e.deltaX * unit }, size()));
    else setView(zoomAt(view, view.zoom * Math.exp(-e.deltaY * unit * .0015), local(e.clientX, e.clientY), size()));
  }, { passive: false });
  el.addEventListener('keydown', e => {
    if (!ready) return;
    const steps: Record<string, { x: number; y: number }> = { ArrowLeft: { x: 55, y: 0 }, ArrowRight: { x: -55, y: 0 }, ArrowUp: { x: 0, y: 55 }, ArrowDown: { x: 0, y: -55 } };
    if (steps[e.key]) { e.preventDefault(); setView(panBy(view, steps[e.key], size())); }
    if (['+', '=', '-', '0'].includes(e.key)) { e.preventDefault(); setView(e.key === '0' ? { x: .5, y: .5, zoom: 1 } : constrain({ ...view, zoom: view.zoom + (e.key === '-' ? -.5 : .5) })); }
  });
}
function checkPoint(el: HTMLElement, point: { x: number; y: number }) {
  if (!ready || found.length === 5) return;
  const size = { width: el.clientWidth, height: el.clientHeight }, normalized = imagePoint(point, size, view);
  const hit = hitDifference(normalized, round.differences, found, size, view.zoom);
  if (hit) {
    found.push(hit.id); updateProgress(); persist();
    $('#announcement').textContent = `Difference ${found.length} of 5 found. ${hit.label}.`;
    if (found.length === 5) finish();
  } else {
    if (hitDifference(normalized, round.differences.filter(d => found.includes(d.id)), [], size, view.zoom)) return;
    const miss = el.querySelector<HTMLElement>('.miss-marker')!;
    miss.style.left = `${point.x}px`; miss.style.top = `${point.y}px`;
    miss.classList.remove('show'); void miss.offsetWidth; miss.classList.add('show');
  }
}
function updateProgress() {
  $('#found-count').textContent = String(found.length);
  $('#progress-dots').innerHTML = Array.from({ length: 5 }, (_, i) => `<span class="progress-dot ${i < found.length ? 'is-found' : ''}">${i < found.length ? icon('check') : `<span>${i + 1}</span>`}</span>`).join('');
  $('#progress-dots').setAttribute('aria-label', `${found.length} of 5 differences found`);
  $<HTMLButtonElement>('#hint').disabled = found.length === 5;
  $('#collection-progress').textContent = `${completed.length} / ${rounds.length} moments completed`;
  renderMarkers();
}
function finish(announce = true) {
  if (!completed.includes(round.id)) completed.push(round.id);
  persist(); updateProgress(); renderSceneList();
  $('#completion').hidden = false;
  $('#completion').innerHTML = `<div><span class="complete-icon">${icon('check')}</span><div><h3>You noticed the little things.</h3><p>All five found in ${Math.floor(seconds / 60)}m ${seconds % 60}s${hints ? ` · ${hints} hint${hints === 1 ? '' : 's'}` : ' · A lovely eye for detail'}</p></div></div><button class="button primary" id="next-round">One more moment ${icon('arrow')}</button>`;
  $('#next-round').addEventListener('click', () => loadRound(pickNext()));
  if (announce) {
    $('#announcement').textContent = 'Well spotted! All five differences found. Choose One more moment to play again.';
    celebrate();
  }
}
function showHint() {
  if (!ready || found.length === 5) return;
  const target = round.differences.find(d => !found.includes(d.id))!;
  hints++; persist(); setView(constrain({ x: target.x, y: target.y, zoom: 2 }));
  toast(`Take a closer look at: ${target.label.toLowerCase()}.`);
  document.querySelectorAll('.markers').forEach(el => {
    const marker = document.createElement('span'); marker.className = 'hint-marker';
    marker.style.left = `${target.x * 100}%`; marker.style.top = `${target.y * 100}%`; marker.style.width = `${Math.max(target.bounds.width * 180, 8)}%`;
    el.append(marker); setTimeout(() => marker.remove(), 3500);
  });
}
function toast(message: string) {
  clearTimeout(liveTimer); $('#toast').textContent = message; $('#toast').classList.add('visible');
  liveTimer = window.setTimeout(() => $('#toast').classList.remove('visible'), 4500);
}
function showModal(content: string) {
  const modal = $<HTMLDialogElement>('#modal');
  modal.innerHTML = `<button class="icon-button modal-close" aria-label="Close dialog">${icon('close')}</button>${content}`;
  modal.querySelector('.modal-close')!.addEventListener('click', () => modal.close());
  modalOpen = true; modal.showModal();
}
function openHelp() {
  showModal(`<div class="eyebrow">A SMALL FIELD GUIDE</div><h2 id="modal-title">The joy is in the details.</h2><p>There are exactly five small differences between each pair of pictures. Find them at your own pace.</p><ol class="help-steps"><li><span>01</span><div><b>Spot something different?</b><p>Click or tap it in either picture. A green circle appears in both.</p></div></li><li><span>02</span><div><b>Get a little closer.</b><p>Scroll your mouse wheel or pinch with two fingers to zoom. Use the + and − buttons too.</p></div></li><li><span>03</span><div><b>Explore together.</b><p>Drag either picture to pan while zoomed in. Both views move together. Shift + scroll pans horizontally. The corner button resets the view.</p></div></li><li><span>04</span><div><b>A gentle nudge.</b><p>Use a hint if you need one. No penalties, no time limit. Your progress is saved on this device.</p></div></li></ol><p class="keyboard-note">Keyboard: focus a picture and use arrow keys to pan, + / − to zoom, and 0 to reset.</p>`);
}
function openCollection() {
  const scenes = rounds.filter(r => r.variant === 1);
  showModal(`<div class="eyebrow">NINE PLACES TO PAUSE</div><h2 id="modal-title">The little collection.</h2><p>Choose a scene, then discover a different kind of detail in each variation.</p><div class="collection-grid">${scenes.map(r => `<article class="collection-card"><img src="${assetUrl(r.thumbnail)}" alt="${r.title}" loading="lazy"><h3>${r.title}</h3><div>${rounds.filter(q => q.sceneId === r.sceneId).map(q => `<button class="variation-button ${completed.includes(q.id) ? 'done' : ''}" data-round="${q.id}">Variation ${q.variant === 1 ? 'A' : 'B'} ${completed.includes(q.id) ? icon('check') : icon('arrow')}</button>`).join('')}</div></article>`).join('')}</div>`);
  document.querySelectorAll<HTMLButtonElement>('[data-round]').forEach(button => button.addEventListener('click', () => { const next = rounds.find(r => r.id === button.dataset.round)!; $<HTMLDialogElement>('#modal').close(); loadRound(next); }));
}
init();
