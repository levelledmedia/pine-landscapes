// Shared behavior for every <details>-based accordion (home FAQ, About's
// "Why Choose Us" reasons): only one item open per group, and a subtle
// height animation on open/close instead of the browser's instant native
// toggle. Native <details>/<summary> semantics (keyboard support, a11y)
// stay intact — this only intercepts the click to animate the height
// transition itself and to close any open sibling first.
const ANIMATION_MS = 220;

function animateTo(body, fromHeight, toHeight, onDone) {
  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    body.style.transition = '';
    body.style.height = '';
    body.style.overflow = '';
    body.removeEventListener('transitionend', onTransitionEnd);
    clearTimeout(fallback);
    onDone?.();
  };
  const onTransitionEnd = (e) => {
    if (e.target === body && e.propertyName === 'height') cleanup();
  };
  body.addEventListener('transitionend', onTransitionEnd);
  // Belt-and-braces: if the transition somehow never fires (e.g. from-height
  // and to-height end up identical), the accordion should still finish
  // settling rather than getting stuck with an inline height forever.
  const fallback = setTimeout(cleanup, ANIMATION_MS + 100);

  body.style.overflow = 'hidden';
  body.style.height = `${fromHeight}px`;
  // A single synchronous reflow read isn't reliably enough to make the
  // browser paint this starting height before the end height below lands —
  // both writes can get coalesced into the same frame, which skips the
  // transition entirely (confirmed: it jumped straight to the end value
  // with no transitionend firing at all). Two rAFs guarantee a real paint
  // of the start height has happened first.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      body.style.transition = `height ${ANIMATION_MS}ms ease`;
      body.style.height = `${toHeight}px`;
    });
  });
}

function closeItem(details, body) {
  animateTo(body, body.scrollHeight, 0, () => {
    details.open = false;
  });
}

function openItem(details, body) {
  details.open = true;
  animateTo(body, 0, body.scrollHeight);
}

document.querySelectorAll('[data-accordion-group]').forEach((group) => {
  const items = Array.from(group.querySelectorAll('details'))
    .map((details) => ({ details, body: details.querySelector('[data-accordion-body]') }))
    .filter((item) => item.body);

  items.forEach(({ details, body }) => {
    const summary = details.querySelector('summary');
    if (!summary) return;
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (details.open) {
        closeItem(details, body);
        return;
      }
      items.forEach((other) => {
        if (other.details !== details && other.details.open) closeItem(other.details, other.body);
      });
      openItem(details, body);
    });
  });
});
