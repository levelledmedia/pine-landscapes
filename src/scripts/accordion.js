// Shared behavior for every <details>-based accordion (home FAQ, About's
// "Why Choose Us" reasons): only one item open per group, with a subtle
// height animation on the active panel. When switching items, any currently
// open sibling closes immediately before the new item expands, which avoids
// the jumpy two-open-at-once phase that made the layout feel jittery.
const ANIMATION_MS = 180;

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
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      body.style.transition = `height ${ANIMATION_MS}ms cubic-bezier(.32,.72,0,1)`;
      body.style.height = `${toHeight}px`;
    });
  });
}

function resetBody(body) {
  body.style.transition = '';
  body.style.height = '';
  body.style.overflow = '';
}

function closeItemImmediately(details, body) {
  details.open = false;
  resetBody(body);
}

function closeItem(details, body) {
  return new Promise((resolve) => {
    animateTo(body, body.scrollHeight, 0, () => {
      details.open = false;
      resetBody(body);
      resolve();
    });
  });
}

function openItem(details, body) {
  details.open = true;
  return new Promise((resolve) => {
    animateTo(body, 0, body.scrollHeight, () => {
      resetBody(body);
      resolve();
    });
  });
}

document.querySelectorAll('[data-accordion-group]').forEach((group) => {
  const items = Array.from(group.querySelectorAll('details'))
    .map((details) => ({ details, body: details.querySelector('[data-accordion-body]') }))
    .filter((item) => item.body);
  let busy = false;

  items.forEach(({ details, body }) => {
    const summary = details.querySelector('summary');
    if (!summary) return;
    summary.addEventListener('click', async (e) => {
      e.preventDefault();
      if (busy) return;
      busy = true;
      if (details.open) {
        await closeItem(details, body);
        busy = false;
        return;
      }

      items.forEach((other) => {
        if (other.details !== details && other.details.open) closeItemImmediately(other.details, other.body);
      });

      await openItem(details, body);
      busy = false;
    });
  });
});
