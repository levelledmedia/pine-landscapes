// Every quote-form box that has an embed code set (Hero split form, the
// footer CTA's three layouts, the contact page form) renders a raw
// third-party <iframe> via set:html. Sizing that box in advance is
// genuinely hard: watched directly in this project's own embed (a
// GoHighLevel form_embed.js widget), the original <iframe> from the raw
// embed code never becomes the visible one at all — the widget's script
// hides it permanently (opacity:0, moved off-screen) and builds a *second*,
// separately-inserted iframe with the real form once it's ready. So neither
// "wait for the original iframe's 'load' event" nor "watch the original
// iframe's own height" tells us anything useful; both were tried and both
// silently measured the wrong element.
//
// What actually generalizes across embed scripts we don't control: poll the
// wrapper for *any* iframe that's actually visible (not display:none,
// hidden, zero-opacity, or shoved off-screen) and wait for that element's
// rendered height to stop changing. That's the one signal available
// regardless of how a given widget chooses to swap/resize its content.
// The settled height is remembered per embed location in localStorage, so
// the *next* visit sizes the box correctly from the very first paint
// instead of guessing — and the spinner only comes down once real content
// is actually there to replace it, not on an arbitrary timer.
const STORAGE_PREFIX = 'quoteEmbedHeight:';
const POLL_INTERVAL_MS = 200;
const STABLE_TICKS_REQUIRED = 3;
// Generous: this project's own embed (a GoHighLevel form) has been observed
// taking upwards of ten seconds to swap in its real, visible iframe on a
// slow connection — worth waiting out rather than giving up and falling
// back to a guess while the widget is still legitimately working.
const MAX_WAIT_MS = 15000;

function isVisible(el) {
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  // Off-screen positioning (the exact trick this project's own embed uses
  // for the iframe it never reveals) doesn't show up in display/visibility/
  // opacity — catch it separately.
  return rect.left > -1000 && rect.left < window.innerWidth + 1000;
}

function findVisibleIframe(wrap) {
  const frames = wrap.querySelectorAll('iframe');
  for (const frame of frames) {
    if (isVisible(frame)) return frame;
  }
  return null;
}

document.querySelectorAll('.quote-embed-wrap').forEach((wrap) => {
  const key = STORAGE_PREFIX + (wrap.dataset.quoteKey || 'default');
  const remembered = Number(localStorage.getItem(key));
  if (remembered > 0) wrap.style.minHeight = `${remembered}px`;

  if (!wrap.querySelector('iframe')) {
    wrap.classList.add('quote-embed-loaded');
    return;
  }

  const start = Date.now();
  let lastHeight = -1;
  let stableTicks = 0;

  function tick() {
    const frame = findVisibleIframe(wrap);
    const height = frame ? Math.round(frame.getBoundingClientRect().height) : 0;
    if (frame && height > 0 && height === lastHeight) {
      stableTicks += 1;
    } else {
      stableTicks = 0;
    }
    lastHeight = height;

    const settled = frame && stableTicks >= STABLE_TICKS_REQUIRED;
    const timedOut = Date.now() - start > MAX_WAIT_MS;
    if (!settled && !timedOut) {
      setTimeout(tick, POLL_INTERVAL_MS);
      return;
    }
    if (height > 0) {
      wrap.style.minHeight = `${height}px`;
      localStorage.setItem(key, String(height));
    }
    wrap.classList.add('quote-embed-loaded');
  }
  tick();
});
