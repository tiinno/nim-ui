import { test, expect, type Locator, type Page } from '@playwright/test';

/**
 * The half of NIMUI-47 a browser can answer.
 *
 * ## What this is evidence of, and what it is not
 *
 * Every assertion below says a node **exists with the right properties**. Not
 * one of them says anything was **announced**. Live-region behaviour differs
 * between NVDA, JAWS and VoiceOver, is not observable from the accessibility
 * tree, and is why NIMUI-47 was filed as a manual pass and stays open.
 *
 * What this buys is that the manual tester starts from a known-good structure:
 * anything they fail to hear is the reader's behaviour, not markup that was
 * broken before the reader ever saw it.
 *
 * ## Why it cannot be a jsdom test
 *
 * `packages/ui` already asserts the DOM shape of all three of these components,
 * in jsdom, and those tests pass. They cannot reach:
 *
 * - **Computed style.** `sr-only` has to hide a node visually *without* pruning
 *   it from the accessibility tree. `display: none` and `visibility: hidden`
 *   prune; `clip-path` does not. jsdom computes no cascade, so a class name is
 *   all it can check — and the class name is not the property that matters.
 * - **A real layout box.** The 1x1 footprint is what makes the technique safe
 *   next to `gap-*`; jsdom reports every box as zero.
 * - **Node identity across a React state change.** SkeletonGroup's whole
 *   contract is that the live region is the *same node* before and after the
 *   transition. Proving that needs a real reconciliation, which is done here by
 *   stamping the node and re-reading the stamp.
 * - **Focus after an interaction.** SC 4.1.3 exists because a status message
 *   must not move focus.
 *
 * ## Shape of the assertions
 *
 * Invariants with floors, never fixed counts. `12 dots on this page` breaks the
 * moment someone adds an example, and a maintainer edits the number rather than
 * the markup. `every bare dot carries exactly one accessible label, and there
 * are at least three of them` survives an edit and still fails on a regression.
 */

const DOT_PAGE = '/components/data-display/dot/';
const SKELETON_PAGE = '/components/feedback/skeleton/';

/**
 * Wait until React has attached to a node.
 *
 * Without this the suite races hydration: a click on server-rendered markup
 * lands on an element with no handler, nothing changes, and the assertion after
 * it fails for a reason that has nothing to do with accessibility. React marks
 * every DOM node it owns with a `__reactFiber$…` key, which is the earliest
 * per-element signal available and is checked on the exact node about to be
 * used rather than on a page-wide proxy like `networkidle`.
 */
async function waitForHydration(locator: Locator): Promise<void> {
  await locator.waitFor({ state: 'attached' });
  await expect
    .poll(
      () => locator.evaluate((el) => Object.keys(el).some((key) => key.startsWith('__reactFiber$'))),
      { message: 'React never attached to this element — the page did not hydrate.', timeout: 15_000 }
    )
    .toBe(true);
}

/** Every `sr-only` node on the page, with the properties that decide the technique. */
async function screenReaderOnlyProbes(page: Page) {
  return page.$$eval('.sr-only', (nodes) =>
    nodes.map((node) => {
      const style = getComputedStyle(node);
      const box = node.getBoundingClientRect();
      let hiddenAncestor: string | null = null;
      for (let el: Element | null = node.parentElement; el !== null; el = el.parentElement) {
        if (el.getAttribute('aria-hidden') === 'true') {
          hiddenAncestor = el.tagName.toLowerCase();
          break;
        }
      }
      return {
        text: (node.textContent ?? '').trim(),
        display: style.display,
        visibility: style.visibility,
        clipPath: style.clipPath,
        width: box.width,
        height: box.height,
        hiddenAncestor,
      };
    })
  );
}

// ---------------------------------------------------------------------------
// sr-only — hidden from the eye, present in the tree
// ---------------------------------------------------------------------------

for (const [name, url] of [
  ['the Dot page', DOT_PAGE],
  ['the Skeleton page', SKELETON_PAGE],
] as const) {
  test(`sr-only text stays in the accessibility tree on ${name}`, async ({ page }) => {
    await page.goto(url);
    const probes = await screenReaderOnlyProbes(page);

    expect(
      probes.length,
      'No sr-only nodes were found at all, so every assertion below would pass by measuring ' +
        'nothing. Either the page changed or the export did not render.'
    ).toBeGreaterThanOrEqual(3);

    for (const probe of probes) {
      const where = `sr-only ${JSON.stringify(probe.text)}`;

      // The two properties that would PRUNE the node from the accessibility
      // tree. This is the whole reason the kit hides with clip-path: a reader
      // cannot announce what the browser has removed.
      expect(probe.display, `${where} computes display:none — it is gone from the tree.`).not.toBe('none');
      expect(probe.visibility, `${where} is not visible to assistive tech.`).toBe('visible');
      expect(
        probe.hiddenAncestor,
        `${where} sits inside an aria-hidden <${probe.hiddenAncestor}>, which prunes the whole subtree.`
      ).toBeNull();

      // ...and the property that hides it from the eye, plus the footprint that
      // makes it safe to place next to a gap.
      expect(probe.clipPath, `${where} is not clipped, so it is visible on screen.`).toBe('inset(50%)');
      expect(probe.width, `${where} occupies ${probe.width}px of width.`).toBeLessThanOrEqual(1);
      expect(probe.height, `${where} occupies ${probe.height}px of height.`).toBeLessThanOrEqual(1);
    }
  });
}

// ---------------------------------------------------------------------------
// Dot — one label per dot, and the marker silent
// ---------------------------------------------------------------------------

test('every Dot carries exactly one accessible label', async ({ page }) => {
  await page.goto(DOT_PAGE);

  const dots = await page.$$eval('[data-testid="dot-indicator"]', (markers) =>
    markers.map((marker) => {
      const wrapper = marker.parentElement as HTMLElement;
      const srLabel = wrapper.querySelector(':scope > .sr-only');
      const visibleLabel = wrapper.querySelector(':scope > .truncate');
      const label = (srLabel ?? visibleLabel)?.textContent?.trim() ?? null;
      const wrapperText = (wrapper.textContent ?? '').trim();
      return {
        markerHidden: marker.getAttribute('aria-hidden') === 'true',
        hasSrLabel: srLabel !== null,
        hasVisibleLabel: visibleLabel !== null,
        label,
        occurrences: label !== null && label !== '' ? wrapperText.split(label).length - 1 : 0,
      };
    })
  );

  expect(dots.length, 'No Dot rendered — the page or the preview wrapper changed.').toBeGreaterThanOrEqual(10);

  const bare = dots.filter((dot) => !dot.hasVisibleLabel);
  const labelled = dots.filter((dot) => dot.hasVisibleLabel);

  // Non-vacuity for BOTH shapes. Each half of the contract below is about one
  // of them, so a page that lost either would still go green.
  expect(bare.length, 'The srLabel example is gone, so the bare-dot half is untested.').toBeGreaterThanOrEqual(3);
  expect(labelled.length, 'No visibly-labelled Dot, so the no-double-label half is untested.').toBeGreaterThanOrEqual(8);

  const silentMarker = dots.filter((dot) => !dot.markerHidden);
  expect(
    silentMarker,
    'A Dot marker is exposed to assistive tech. It is a 6px coloured circle carrying no text; ' +
      'exposing it announces an anonymous node before the status it stands for.'
  ).toEqual([]);

  const unlabelled = bare.filter((dot) => dot.label === null || dot.label === '');
  expect(
    unlabelled,
    'A Dot with no visible children and no srLabel. That dot is colour-only: it reaches the ' +
      'accessibility tree as an empty generic span, and its status is unavailable to anyone not ' +
      'looking at it (WCAG 2.2 SC 1.4.1).'
  ).toEqual([]);

  const doubled = labelled.filter((dot) => dot.hasSrLabel);
  expect(
    doubled,
    'A Dot has BOTH a visible label and sr-only text. `srLabel` is documented as ignored when ' +
      'children are present, precisely so the status is never announced twice — this is that ' +
      'gate failing on a real render.'
  ).toEqual([]);

  const repeated = dots.filter((dot) => dot.occurrences !== 1);
  expect(
    repeated.map((dot) => `${JSON.stringify(dot.label)} appears ${dot.occurrences} time(s)`),
    'A Dot label does not appear exactly once in its wrapper text. Twice is a double ' +
      'announcement; zero means the label is not where this check thinks it is.'
  ).toEqual([]);
});

test('a bare Dot exposes its status as text in the accessibility tree', async ({ page }) => {
  await page.goto(DOT_PAGE);

  // The accessibility tree itself, not the DOM: `ariaSnapshot` renders what
  // assistive tech would traverse, so an aria-hidden marker is absent from it
  // by construction and the srLabel text is present only if it survived.
  const bareDots = page.locator(
    'span:has(> [data-testid="dot-indicator"]):not(:has(> .truncate))'
  );
  const count = await bareDots.count();
  expect(count, 'No bare Dot on the page.').toBeGreaterThanOrEqual(3);

  for (let i = 0; i < count; i++) {
    const snapshot = await bareDots.nth(i).ariaSnapshot();
    expect(
      snapshot.trim(),
      'A bare Dot contributes nothing to the accessibility tree. Its status is carried by colour ' +
        'alone for anyone using a screen reader.'
    ).not.toBe('');
  }
});

// ---------------------------------------------------------------------------
// SkeletonGroup — the live region, across a real transition
// ---------------------------------------------------------------------------

test('every SkeletonGroup live region is a sibling of the busy host, never inside it', async ({ page }) => {
  await page.goto(SKELETON_PAGE);

  const regions = await page.$$eval('[role="status"]', (nodes) =>
    nodes.map((node) => ({
      insideBusy: node.closest('[aria-busy]') !== null,
      hasBusySibling: node.parentElement?.querySelector(':scope > [aria-busy]') !== null,
    }))
  );

  expect(regions.length, 'No live region rendered — the demos did not mount.').toBeGreaterThanOrEqual(2);

  const nested = regions.filter((region) => region.insideBusy);
  expect(
    nested,
    'A live region sits INSIDE an aria-busy subtree. aria-busy tells assistive tech to defer ' +
      'announcements for that subtree — which is exactly the window the region exists to ' +
      'announce in, so the announcement is suppressed. This is the one structural regression ' +
      "SkeletonGroup's shape exists to prevent."
  ).toEqual([]);

  const orphaned = regions.filter((region) => !region.hasBusySibling);
  expect(orphaned, 'A live region has no aria-busy sibling, so it is not paired with a content host.').toEqual([]);
});

test('the busy subtree leaks no text while loading', async ({ page }) => {
  await page.goto(SKELETON_PAGE);

  const hosts = await page.$$eval('[aria-busy="true"]', (nodes) =>
    nodes.map((node) => ({
      text: (node.textContent ?? '').trim(),
      descendants: node.querySelectorAll('*').length,
      exposedDescendants: [...node.querySelectorAll('*')].filter(
        (el) => el.getAttribute('aria-hidden') !== 'true'
      ).length,
    }))
  );

  expect(hosts.length, 'Nothing is marked busy, so the demos are not in their loading state.').toBeGreaterThanOrEqual(2);

  for (const host of hosts) {
    expect(host.descendants, 'A busy host is empty, so this measures nothing.').toBeGreaterThan(0);
    expect(
      host.text,
      'A loading skeleton contributes text to the accessibility tree. Placeholders are ' +
        'aria-hidden precisely so a surface built from 2-5 of them stays silent and the group ' +
        'announces once; text here means a reader gets the noise instead.'
    ).toBe('');
  }
});

test('the live region survives the transition as the same node, and never takes focus', async ({ page }) => {
  await page.goto(SKELETON_PAGE);

  const regions = page.locator('[role="status"]');
  const count = await regions.count();
  expect(count, 'No live region to toggle.').toBeGreaterThanOrEqual(2);

  const afterLoading: string[] = [];

  for (let i = 0; i < count; i++) {
    const region = regions.nth(i);
    // The SkeletonGroup root is the region's parent; the demo's toggle is that
    // root's next sibling.
    const toggle = region.locator('xpath=../following-sibling::button[1]');
    await waitForHydration(toggle);

    await expect(region, 'The region does not hold its loading label before the toggle.').toHaveText(
      'Loading operator'
    );

    // Stamp the node. If React replaces it rather than updating it in place,
    // the re-queried element has no stamp and the read below fails — which is
    // the entire contract: the announcement is a text CHANGE in a mounted
    // region, not the insertion of a new one.
    await region.evaluate((el) => {
      (el as HTMLElement & { dataset: DOMStringMap }).dataset.nimIdentityProbe = 'before';
    });

    // Keyboard, not mouse: SC 4.1.3 is about the keyboard user who cannot see
    // the surface change, and a mouse click would prove nothing about where
    // focus lands for them.
    await toggle.focus();
    await page.keyboard.press('Enter');

    await expect(toggle, 'The toggle did not flip, so nothing below was measured mid-transition.').toHaveText(
      'Load again'
    );

    const stampSurvived = await region.evaluate(
      (el) => (el as HTMLElement).dataset.nimIdentityProbe === 'before'
    );
    expect(
      stampSurvived,
      'The live region was REPLACED across the transition, not updated. A region inserted ' +
        'together with its content is announced inconsistently by screen readers; staying mounted ' +
        'and changing text is what makes this a status message.'
    ).toBe(true);

    const focusStayed = await toggle.evaluate((el) => document.activeElement === el);
    expect(
      focusStayed,
      'Focus moved off the toggle when loading finished. A status message must not steal focus ' +
        '(WCAG 2.2 SC 4.1.3) — the keyboard user loses their place for a message they did not ' +
        'ask to be moved to.'
    ).toBe(true);

    afterLoading.push(((await region.textContent()) ?? '').trim());
  }

  // The documented difference between the two demos, and the only way to
  // observe it: unset stays silent so a refetching dashboard does not announce
  // on every poll; set announces completion once.
  expect(
    afterLoading.sort(),
    'The two SkeletonGroup demos no longer differ in their post-load region text. That pair is ' +
      'what documents `loadedLabel`, and it is the scenario NIMUI-47 has to compare by ear.'
  ).toEqual(['', 'Operator loaded']);
});
