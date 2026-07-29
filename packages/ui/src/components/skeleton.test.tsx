import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Skeleton, SkeletonGroup } from './skeleton';

describe('Skeleton', () => {
  it('renders correctly', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies base animation classes', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('animate-pulse');
    expect(container.firstChild).toHaveClass('rounded-md');
    expect(container.firstChild).toHaveClass('bg-neutral-200');
  });

  it('merges custom className', () => {
    const { container } = render(<Skeleton className="h-8 w-32" />);
    expect(container.firstChild).toHaveClass('h-8');
    expect(container.firstChild).toHaveClass('w-32');
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes HTML attributes', () => {
    const { container } = render(<Skeleton data-testid="skeleton" />);
    expect(container.firstChild).toHaveAttribute('data-testid', 'skeleton');
  });

  describe('Accessibility', () => {
    it('hides the placeholder from assistive tech by default', () => {
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    });

    // This is the assertion that pins `aria-hidden` BEFORE the prop spread.
    // React only overwrites a key actually present in the spread, so moving the
    // attribute after `{...props}` makes the consumer's value unreachable and
    // this reads 'true'. Unlike Button's `aria-busy`, hiding a Skeleton is a
    // default rather than the semantic contract, so the escape hatch must work.
    it('lets a consumer opt out with aria-hidden={false}', () => {
      const { container } = render(<Skeleton aria-hidden={false} />);
      expect(container.firstChild).toHaveAttribute('aria-hidden', 'false');
    });
  });
});

describe('SkeletonGroup', () => {
  // The headline test. A live region inserted into the DOM together with its
  // text is announced inconsistently across screen readers, so the node has to
  // survive the transition and only its text may change.
  //
  // Verified against two mutations: `{loading && <span role="status">}` fails
  // this and three sibling tests, and a *remounting* region (`key={String(
  // loading)}`) — identical DOM, new node — fails this one and nothing else.
  // Node identity is the only assertion in this file that catches that.
  it('keeps the same live-region node across the loading transition', () => {
    const { rerender } = render(
      <SkeletonGroup loading={false} fallback={<Skeleton className="h-4 w-40" />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    const before = screen.getByRole('status');
    expect(before).toHaveTextContent('');

    rerender(
      <SkeletonGroup loading fallback={<Skeleton className="h-4 w-40" />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );

    const after = screen.getByRole('status');
    expect(after).toBe(before);
    expect(after).toHaveTextContent('Loading');

    // And back again: `true -> false` is the *completion* announcement, so it
    // needs the same node, not just the same text.
    rerender(
      <SkeletonGroup
        loading={false}
        loadedLabel="Loaded"
        fallback={<Skeleton className="h-4 w-40" />}
      >
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    const done = screen.getByRole('status');
    expect(done).toBe(before);
    expect(done).toHaveTextContent('Loaded');
  });

  // Catches the "collapse it onto one element" refactor: `aria-busy` tells
  // assistive tech to defer announcements for its own subtree, which is exactly
  // the window the live region needs to speak in. `closest` includes the element
  // itself, so a single `<div role="status" aria-busy>` fails here.
  it('never nests the live region inside the aria-busy host', () => {
    render(
      <SkeletonGroup loading fallback={<Skeleton className="h-4 w-40" />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    expect(screen.getByRole('status').closest('[aria-busy="true"]')).toBeNull();
  });

  it('marks the content host aria-busy only while loading', () => {
    const { container, rerender } = render(
      <SkeletonGroup loading fallback={<Skeleton data-testid="fallback" />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();

    rerender(
      <SkeletonGroup loading={false} fallback={<Skeleton data-testid="fallback" />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    expect(container.querySelector('[aria-busy]')).toBeNull();
  });

  it('renders the fallback and not the children while loading', () => {
    render(
      <SkeletonGroup loading fallback={<Skeleton data-testid="fallback" />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByText('Ada Lovelace')).toBeNull();
  });

  it('renders the children and drops the fallback once loaded', () => {
    render(
      <SkeletonGroup loading={false} fallback={<Skeleton data-testid="fallback" />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.queryByTestId('fallback')).toBeNull();
    // Region mounted and empty — the state the live announcement is made from.
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('uses a custom label while loading', () => {
    render(
      <SkeletonGroup loading label="Loading orders" fallback={<Skeleton />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading orders');
  });

  // loadedLabel is opt-in because a dashboard that refetches would otherwise
  // announce "Loaded" on every poll.
  it('stays silent after loading by default', () => {
    const { rerender } = render(
      <SkeletonGroup loading fallback={<Skeleton />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    rerender(
      <SkeletonGroup loading={false} fallback={<Skeleton />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('announces loadedLabel when one is given', () => {
    const { rerender } = render(
      <SkeletonGroup loading loadedLabel="Orders loaded" fallback={<Skeleton />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    rerender(
      <SkeletonGroup loading={false} loadedLabel="Orders loaded" fallback={<Skeleton />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    expect(screen.getByRole('status')).toHaveTextContent('Orders loaded');
  });

  // A default layout class would be locked into this file forever (tests here
  // assert literal class strings), and `space-y-*` on the root would space the
  // live region rather than the rows. Both wrapper divs stay class-less.
  it('ships no default layout classes', () => {
    const { container } = render(
      <SkeletonGroup loading fallback={<Skeleton />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    const root = container.firstChild as HTMLElement;
    expect(root).not.toHaveAttribute('class');
    // The inner host carries semantics, never styling.
    expect(root.lastElementChild).not.toHaveAttribute('class');
  });

  // Deliberately not a class the component could plausibly default to — the
  // earlier version of this test used `space-y-2` and stayed green when a
  // `cn('space-y-2', className)` default was injected, because tailwind-merge
  // collapsed the duplicate.
  it('merges className onto the root only', () => {
    const { container } = render(
      <SkeletonGroup loading className="mt-6" fallback={<Skeleton />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toBe('mt-6');
    expect(root.lastElementChild).not.toHaveAttribute('class');
  });

  // `toBeInstanceOf(HTMLDivElement)` would pass just as happily if the ref
  // landed on the inner aria-busy host — both are divs. Identity is the only
  // assertion that pins it to the root.
  it('forwards ref to the root', () => {
    const ref = { current: null };
    const { container } = render(
      <SkeletonGroup ref={ref} loading fallback={<Skeleton />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    expect(ref.current).toBe(container.firstChild);
  });

  it('passes HTML attributes to the root', () => {
    render(
      <SkeletonGroup data-testid="group" loading fallback={<Skeleton />}>
        <p>Ada Lovelace</p>
      </SkeletonGroup>
    );
    expect(screen.getByTestId('group')).toBeInTheDocument();
  });
});
