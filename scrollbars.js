/* Quarter-length handles over native scrolling. No content is moved or resized. */
(() => {
  const HANDLE_SCALE = 0.25;
  const WIDTH = 6;
  const selector = '.layer-tree, .tabs, .content-panel, .right-rail, .connection-panel, .entry-body pre';
  const root = document.scrollingElement;
  const overlay = document.createElement('div');
  overlay.className = 'scrollbar-overlay';
  document.body.append(overlay);
  const records = new Map();
  let frame = 0;
  let sequence = 0;

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  const resize = new ResizeObserver(schedule);

  function createBar(target, axis) {
    const vertical = axis === 'y';
    const track = document.createElement('div');
    track.className = `short-scrollbar ${vertical ? 'vertical' : 'horizontal'}`;
    track.hidden = true;
    const handle = document.createElement('div');
    handle.className = 'short-scrollbar-handle';
    handle.tabIndex = 0;
    handle.setAttribute('role', 'scrollbar');
    handle.setAttribute('aria-controls', target.id);
    handle.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
    handle.setAttribute('aria-label', `${vertical ? 'Vertical' : 'Horizontal'} scroll: ${target.getAttribute('aria-label') || target.id}`);
    handle.setAttribute('aria-valuemin', '0');
    track.append(handle);
    overlay.append(track);
    const bar = { track, handle, target, vertical, maximum: 0, travel: 0, length: 0 };
    const property = vertical ? 'scrollTop' : 'scrollLeft';
    const coordinate = (event) => vertical ? event.clientY : event.clientX;
    let drag = null;
    track.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || !bar.travel) return;
      event.preventDefault();
      handle.focus({ preventScroll: true });
      if (event.target !== handle) {
        const bounds = track.getBoundingClientRect();
        const offset = coordinate(event) - (vertical ? bounds.top : bounds.left) - bar.length / 2;
        target[property] = Math.max(0, Math.min(bar.maximum, offset / bar.travel * bar.maximum));
      }
      drag = { point: coordinate(event), scroll: target[property], pointer: event.pointerId };
      track.setPointerCapture(event.pointerId);
      schedule();
    });
    track.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.pointer) return;
      target[property] = drag.scroll + (coordinate(event) - drag.point) / bar.travel * bar.maximum;
      schedule();
    });
    track.addEventListener('lostpointercapture', () => { drag = null; });
    track.addEventListener('pointerup', () => { drag = null; });
    track.addEventListener('pointercancel', () => { drag = null; });
    handle.addEventListener('keydown', (event) => {
      const page = vertical ? target.clientHeight : target.clientWidth;
      const steps = { ArrowDown: 40, ArrowRight: 40, ArrowUp: -40, ArrowLeft: -40, PageDown: page * .9, PageUp: -page * .9 };
      if (event.key === 'Home') target[property] = 0;
      else if (event.key === 'End') target[property] = bar.maximum;
      else if (event.key in steps) target[property] += steps[event.key];
      else return;
      event.preventDefault();
      schedule();
    });
    // Wheel input over the overlay still scrolls its associated content.
    track.addEventListener('wheel', (event) => {
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? target.clientHeight : 1;
      target[property] += (vertical ? event.deltaY : event.deltaX || event.deltaY) * unit;
      event.preventDefault();
      schedule();
    }, { passive: false });
    return bar;
  }

  function discover() {
    const targets = new Set([root, ...document.querySelectorAll(selector)]);
    for (const [target, bars] of records) {
      if (targets.has(target)) continue;
      bars.forEach(({ track }) => track.remove());
      target.classList.remove('short-scrollbars');
      records.delete(target);
    }
    resize.disconnect();
    for (const target of targets) {
      if (!records.has(target)) {
        if (!target.id) target.id = `scroll-area-${++sequence}`;
        records.set(target, ['y', 'x'].map((axis) => createBar(target, axis)));
        target.classList.add('short-scrollbars');
      }
      resize.observe(target);
      // Entry feeds grow when media loads or content is appended.
      for (const child of target.children) {
        if (child !== overlay) resize.observe(child);
      }
    }
    schedule();
  }

  function update() {
    frame = 0;
    const viewport = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
    for (const [target, bars] of records) {
      const documentScroll = target === root;
      const bounds = documentScroll ? viewport : target.getBoundingClientRect();
      const style = getComputedStyle(target);
      const clip = { ...viewport };
      for (let parent = target.parentElement; parent && parent !== root; parent = parent.parentElement) {
        const css = getComputedStyle(parent);
        const rect = parent.getBoundingClientRect();
        if (css.overflowY !== 'visible') {
          clip.top = Math.max(clip.top, rect.top + parent.clientTop);
          clip.bottom = Math.min(clip.bottom, rect.top + parent.clientTop + parent.clientHeight);
        }
        if (css.overflowX !== 'visible') {
          clip.left = Math.max(clip.left, rect.left + parent.clientLeft);
          clip.right = Math.min(clip.right, rect.left + parent.clientLeft + parent.clientWidth);
        }
      }
      for (const bar of bars) {
        const { vertical, track, handle } = bar;
        const visible = vertical ? target.clientHeight : target.clientWidth;
        const total = vertical ? target.scrollHeight : target.scrollWidth;
        const overflow = vertical ? style.overflowY : style.overflowX;
        const allowed = documentScroll || /^(auto|scroll)$/.test(overflow);
        bar.maximum = Math.max(0, total - visible);
        track.hidden = !allowed || bar.maximum <= 1 || !visible || (!documentScroll && !target.getClientRects().length);
        if (track.hidden) continue;
        const left = bounds.left + (documentScroll ? 0 : target.clientLeft);
        const top = bounds.top + (documentScroll ? 0 : target.clientTop);
        const x = vertical ? left + target.clientWidth - WIDTH : left;
        const y = vertical ? top : top + target.clientHeight - WIDTH;
        const length = visible;
        bar.length = length * (visible / total) * HANDLE_SCALE;
        bar.travel = length - bar.length;
        const scroll = vertical ? target.scrollTop : target.scrollLeft;
        const offset = Math.max(0, Math.min(1, scroll / bar.maximum)) * bar.travel;
        track.style.cssText = `left:${x}px;top:${y}px;width:${vertical ? WIDTH : length}px;height:${vertical ? length : WIDTH}px;`;
        // Keep handles aligned with their full track when a mobile panel scrolls offscreen.
        const inset = vertical
          ? `${Math.max(0, clip.top - y)}px -24px ${Math.max(0, y + length - clip.bottom)}px -24px`
          : `-24px ${Math.max(0, x + length - clip.right)}px -24px ${Math.max(0, clip.left - x)}px`;
        track.style.clipPath = `inset(${inset})`;
        if (vertical ? x < clip.left || x >= clip.right : y < clip.top || y >= clip.bottom) track.hidden = true;
        handle.style.cssText = vertical
          ? `height:${bar.length}px;transform:translateY(${offset}px)`
          : `width:${bar.length}px;transform:translateX(${offset}px)`;
        handle.setAttribute('aria-valuemax', String(Math.round(bar.maximum)));
        handle.setAttribute('aria-valuenow', String(Math.round(Math.max(0, Math.min(bar.maximum, scroll)))));
      }
    }
  }
  document.addEventListener('scroll', schedule, { capture: true, passive: true });
  document.addEventListener('load', schedule, true);
  window.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  new MutationObserver(discover).observe(document.querySelector('.site-grid'), {
    childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'],
  });
  document.fonts.ready.then(schedule);
  discover();
})();
