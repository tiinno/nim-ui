import { describe, it, expect } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardLink,
  cardVariants,
  cardLinkVariants,
} from './card';

/**
 * The reduced-motion counterpart on Card's base, assembled from parts rather
 * than written as one literal.
 *
 * Tailwind scans test files exactly like component files, so the literal form
 * would compile a real rule into `dist/styles.css` and keep it alive after
 * card.tsx stopped emitting the class — at which point the compiled-CSS half of
 * `src/motion-reduce.test.ts` would pass over a reverted fix, which is the one
 * thing it exists to catch. `motion-reduce.test.ts` and
 * `aria-disabled-hover.test.ts` derive their counterparts the same way, for the
 * same reason.
 */
const MOTION_REDUCE_VARIANT = 'motion-reduce';
const TRANSITION_UTILITY = 'transition';
const COUNTERPART_PROPERTIES = '[box-shadow,border-color,background-color]';
const MOTION_REDUCE_COUNTERPART = `${MOTION_REDUCE_VARIANT}:${TRANSITION_UTILITY}-${COUNTERPART_PROPERTIES}`;

describe('Card', () => {
  describe('Card - Rendering', () => {
    it('renders card element', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(<Card>Card content here</Card>);
      expect(screen.getByText('Card content here')).toBeInTheDocument();
    });

    it('applies default card styles', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('rounded-md');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('shadow-soft');
      // NIMUI-50: the positioned ancestor CardLink's overlay resolves against.
      expect(card).toHaveClass('relative');
    });

    it('applies dark mode styles', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('dark:bg-neutral-950');
      expect(card).toHaveClass('dark:border-neutral-800');
    });
  });

  // NIMUI-48. These assert the class strings only; that a browser actually
  // interpolates them is a different question, and one no test in this package
  // can answer — jsdom computes no styles and evaluates no media queries. The
  // property list is guarded against naming something nothing sets by
  // src/transition-property.test.ts, and the counterpart is guarded against
  // compiling to a dead rule by src/motion-reduce.test.ts. Both read the built
  // stylesheet, because that is the only place the answer lives.
  describe('Motion', () => {
    it('transitions the properties its variants actually change', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      // `translate`, not a transform: Tailwind v4 compiles the lift below to the
      // independent longhand, so a list naming the combined property would name
      // one nothing on this element sets and the lift would snap.
      expect(card).toHaveClass('transition-[box-shadow,translate,border-color,background-color]');
      expect(card).toHaveClass('duration-(--duration-fast)');
      expect(card).toHaveClass('ease-out');
    });

    it('narrows rather than disables the transition under reduced motion', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      // Suppresses the lift, keeps the shadow and colour crossfade — the kit
      // treats those as non-motion everywhere else.
      expect(card).toHaveClass(MOTION_REDUCE_COUNTERPART);
      expect(card.className).not.toContain(
        `${MOTION_REDUCE_VARIANT}:${TRANSITION_UTILITY}-none`
      );
    });

    it('lifts and deepens its shadow when hoverable', () => {
      render(
        <Card hoverable data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('hover:-translate-y-0.5');
      expect(card).toHaveClass('hover:shadow-panel');
    });

    // NIMUI-50. `hoverable` is a hover RESPONSE, not a claim of clickability:
    // the card is a plain container element, so a pointer cursor promised a
    // target that no keyboard or screen-reader user could reach. The target is
    // CardLink; the cursor comes from the anchor, where it is true.
    it('claims no pointer affordance when hoverable', () => {
      render(
        <Card hoverable data-testid="card">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).not.toHaveClass('cursor-pointer');
    });

    it('does not lift by default', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).not.toHaveClass('hover:-translate-y-0.5');
    });
  });

  // NIMUI-50. Class strings only — that the `:has()` rule COMPILES at all is
  // asserted against the built stylesheet by src/focus-ring-contrast.test.ts,
  // which is where an arbitrary variant with a typo (silently emitting nothing)
  // becomes visible. jsdom evaluates neither.
  describe('Card - focus treatment for a contained CardLink', () => {
    const HAS_LINK_FOCUS = 'has-[[data-card-link]:focus-visible]';

    it('draws the indicator around the whole card when the link takes focus', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass(`${HAS_LINK_FOCUS}:outline-2`);
      expect(card).toHaveClass(`${HAS_LINK_FOCUS}:outline-offset-2`);
    });

    // Deliberately not the contract's shadow ring: that paints its offset band
    // opaque white, which at a whole card's perimeter is a halo in dark mode.
    // An outline's offset gap is transparent. Judged on a rendered comparison in
    // both themes; the colour pair and its 3:1 measurement are unchanged, and
    // src/focus-ring-contrast.test.ts measures this one like every other.
    it('pairs the indicator colour across themes, dark prefix outermost', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass(`${HAS_LINK_FOCUS}:outline-primary-500`);
      expect(card).toHaveClass(`dark:${HAS_LINK_FOCUS}:outline-primary-400`);
    });

    it('gives focus the depth cue hover gets, but not the lift', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      // A card that moved under focus would drag the indicator drawn around it.
      expect(card).toHaveClass(`${HAS_LINK_FOCUS}:shadow-panel`);
      expect(card.className).not.toContain(`${HAS_LINK_FOCUS}:-translate-y-0.5`);
    });

    it('scopes the treatment to the card link, not to any focused anchor', () => {
      render(<Card data-testid="card">Content</Card>);
      // `has-[a:focus-visible]` would ring the whole card for an incidental
      // link in the body. Assembled so this assertion cannot mint the class it
      // is asserting the absence of.
      const anyAnchor = ['has-[a', 'focus-visible]'].join(':');
      expect(screen.getByTestId('card').className).not.toContain(anyAnchor);
    });
  });

  describe('CardHeader - Rendering', () => {
    it('renders header element', () => {
      render(
        <Card>
          <CardHeader data-testid="header">Header</CardHeader>
        </Card>
      );
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('renders header content', () => {
      render(
        <Card>
          <CardHeader>
            <h3>Card Title</h3>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('applies header styles', () => {
      render(
        <Card>
          <CardHeader data-testid="header">Header</CardHeader>
        </Card>
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');
      expect(header).toHaveClass('space-y-1.5');
      expect(header).toHaveClass('p-5');
    });

    it('supports complex header content', () => {
      render(
        <Card>
          <CardHeader>
            <h3>Title</h3>
            <p>Subtitle</p>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });
  });

  describe('CardContent - Rendering', () => {
    it('renders content element', () => {
      render(
        <Card>
          <CardContent data-testid="content">Content</CardContent>
        </Card>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('renders content text', () => {
      render(
        <Card>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
        </Card>
      );
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
    });

    it('applies content styles', () => {
      render(
        <Card>
          <CardContent data-testid="content">Content</CardContent>
        </Card>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('p-5');
      expect(content).toHaveClass('pt-0');
    });

    it('supports complex content', () => {
      render(
        <Card>
          <CardContent>
            <div>
              <p>Paragraph 1</p>
              <p>Paragraph 2</p>
            </div>
          </CardContent>
        </Card>
      );
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });
  });

  describe('CardFooter - Rendering', () => {
    it('renders footer element', () => {
      render(
        <Card>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      );
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders footer content', () => {
      render(
        <Card>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('applies footer styles', () => {
      render(
        <Card>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
      expect(footer).toHaveClass('p-5');
      expect(footer).toHaveClass('pt-0');
    });

    it('supports multiple actions in footer', () => {
      render(
        <Card>
          <CardFooter>
            <button>Cancel</button>
            <button>Save</button>
          </CardFooter>
        </Card>
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  // NIMUI-50. The nested-interactive contract, which is the part of this design
  // jsdom CAN judge: the overlay is layout, but the roles, the accessible names
  // and the tab order are not.
  describe('CardLink', () => {
    it('renders a real link, reachable and nameable', () => {
      render(
        <Card hoverable>
          <CardHeader>
            <h3>
              <CardLink href="/customers/acme">Acme Corporation</CardLink>
            </h3>
          </CardHeader>
        </Card>
      );

      const link = screen.getByRole('link', { name: 'Acme Corporation' });
      expect(link).toHaveAttribute('href', '/customers/acme');
      expect(link.tagName).toBe('A');
    });

    it('carries the data attribute the card focus treatment keys on', () => {
      render(<CardLink href="/orders/1042">Order #1042</CardLink>);
      expect(screen.getByRole('link')).toHaveAttribute('data-card-link');
    });

    it('stretches a generated box over the whole positioned card', () => {
      render(<CardLink href="/orders/1042">Order #1042</CardLink>);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('after:absolute');
      expect(link).toHaveClass('after:inset-0');
      expect(link).toHaveClass('after:rounded-md');
      expect(link).toHaveClass("after:content-['']");
    });

    it('suppresses the browser indicator that would frame only its text', () => {
      render(<CardLink href="/orders/1042">Order #1042</CardLink>);
      // The card draws the indicator instead; both at once frames the title
      // inside a ringed card.
      expect(screen.getByRole('link')).toHaveClass('focus-visible:outline-none');
      expect(screen.getByRole('link')).toHaveClass('rounded-sm');
    });

    it('merges a custom className', () => {
      render(
        <CardLink href="/orders/1042" className="font-medium">
          Order #1042
        </CardLink>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveClass('font-medium');
      expect(link).toHaveClass('after:absolute');
    });

    it('forwards ref to the anchor element', () => {
      const ref = { current: null };
      render(
        <CardLink href="/orders/1042" ref={ref}>
          Order #1042
        </CardLink>
      );
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });

    it('exports cardLinkVariants so a router link can compose', () => {
      expect(typeof cardLinkVariants).toBe('function');
      expect(cardLinkVariants()).toContain('after:absolute');
    });

    it('passes anchor attributes through', () => {
      render(
        <CardLink href="https://example.com" target="_blank" rel="noopener noreferrer">
          External
        </CardLink>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('leaves a nested control its own role and name', () => {
      render(
        <Card hoverable>
          <CardHeader>
            <h3>
              <CardLink href="/customers/acme">Acme Corporation</CardLink>
            </h3>
          </CardHeader>
          <CardFooter>
            <button className="relative z-10">Export</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByRole('link', { name: 'Acme Corporation' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });

    it('keeps tab order in document order: link, then the footer control', async () => {
      const user = userEvent.setup();
      render(
        <Card hoverable data-testid="card">
          <CardHeader>
            <h3>
              <CardLink href="/customers/acme">Acme Corporation</CardLink>
            </h3>
          </CardHeader>
          <CardFooter>
            <button className="relative z-10">Export</button>
          </CardFooter>
        </Card>
      );

      // The card itself is NOT a tab stop — it is not the control, the link is.
      expect(screen.getByTestId('card')).not.toHaveAttribute('tabindex');

      await user.tab();
      expect(screen.getByRole('link', { name: 'Acme Corporation' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Export' })).toHaveFocus();
    });
  });

  describe('Composition', () => {
    it('renders complete card with all sections', () => {
      render(
        <Card>
          <CardHeader>
            <h3>Title</h3>
          </CardHeader>
          <CardContent>
            <p>Content</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders card with only content', () => {
      render(
        <Card>
          <CardContent>Just content</CardContent>
        </Card>
      );

      expect(screen.getByText('Just content')).toBeInTheDocument();
    });

    it('renders card with header and content', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders card with content and footer', () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('maintains proper spacing between sections', () => {
      render(
        <Card data-testid="card">
          <CardHeader data-testid="header">Header</CardHeader>
          <CardContent data-testid="content">Content</CardContent>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      );

      const header = screen.getByTestId('header');
      const content = screen.getByTestId('content');
      const footer = screen.getByTestId('footer');

      expect(header).toHaveClass('p-5');
      expect(content).toHaveClass('p-5', 'pt-0');
      expect(footer).toHaveClass('p-5', 'pt-0');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to Card element', () => {
      const ref = { current: null };
      render(<Card ref={ref}>Content</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('forwards ref to CardHeader element', () => {
      const ref = { current: null };
      render(
        <Card>
          <CardHeader ref={ref}>Header</CardHeader>
        </Card>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('forwards ref to CardContent element', () => {
      const ref = { current: null };
      render(
        <Card>
          <CardContent ref={ref}>Content</CardContent>
        </Card>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('forwards ref to CardFooter element', () => {
      const ref = { current: null };
      render(
        <Card>
          <CardFooter ref={ref}>Footer</CardFooter>
        </Card>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports cardVariants function', () => {
      expect(typeof cardVariants).toBe('function');
    });

    it('generates correct classes from variants', () => {
      const classes = cardVariants();
      expect(classes).toContain('rounded-md');
      expect(classes).toContain('border');
      expect(classes).toContain('bg-white');
      expect(classes).toContain('shadow-soft');
    });
  });

  describe('Custom className', () => {
    it('merges custom className on Card', () => {
      render(<Card className="max-w-md" data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('max-w-md');
      expect(card).toHaveClass('rounded-md');
    });

    it('merges custom className on CardHeader', () => {
      render(
        <Card>
          <CardHeader className="border-b" data-testid="header">
            Header
          </CardHeader>
        </Card>
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('p-5');
    });

    it('merges custom className on CardContent', () => {
      render(
        <Card>
          <CardContent className="text-center" data-testid="content">
            Content
          </CardContent>
        </Card>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('text-center');
      expect(content).toHaveClass('p-5');
    });

    it('merges custom className on CardFooter', () => {
      render(
        <Card>
          <CardFooter className="justify-end" data-testid="footer">
            Footer
          </CardFooter>
        </Card>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('justify-end');
      expect(footer).toHaveClass('flex');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes on Card', () => {
      render(
        <Card data-testid="card" data-card-type="info">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveAttribute('data-card-type', 'info');
    });

    it('supports aria attributes on Card', () => {
      render(
        <Card aria-label="Information card" data-testid="card">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveAttribute('aria-label', 'Information card');
    });

    it('supports id attribute', () => {
      render(<Card id="main-card">Content</Card>);
      expect(document.getElementById('main-card')).toBeInTheDocument();
    });

    it('supports role attribute', () => {
      render(
        <Card role="article" data-testid="card">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveAttribute('role', 'article');
    });
  });

  describe('Complex Examples', () => {
    it('renders product card example', () => {
      render(
        <Card>
          <CardHeader>
            <h3>Product Name</h3>
            <p>$99.99</p>
          </CardHeader>
          <CardContent>
            <p>Product description goes here</p>
          </CardContent>
          <CardFooter>
            <button>Add to Cart</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Product Name')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
      expect(screen.getByText('Product description goes here')).toBeInTheDocument();
      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });

    it('renders profile card example', () => {
      render(
        <Card>
          <CardHeader>
            <h3>John Doe</h3>
            <p>Software Engineer</p>
          </CardHeader>
          <CardContent>
            <p>Email: john@example.com</p>
            <p>Location: San Francisco, CA</p>
          </CardContent>
          <CardFooter>
            <button>View Profile</button>
            <button>Message</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
      expect(screen.getByText('View Profile')).toBeInTheDocument();
      expect(screen.getByText('Message')).toBeInTheDocument();
    });

    it('renders notification card example', () => {
      render(
        <Card>
          <CardContent>
            <p>Your order has been shipped!</p>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Your order has been shipped!')).toBeInTheDocument();
    });
  });

  describe('Nested Content', () => {
    it('supports nested elements in header', () => {
      render(
        <Card>
          <CardHeader>
            <div>
              <h3>Title</h3>
              <span>Badge</span>
            </div>
            <p>Subtitle</p>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Badge')).toBeInTheDocument();
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });

    it('supports nested elements in content', () => {
      render(
        <Card>
          <CardContent>
            <div>
              <p>First paragraph</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('supports images in content', () => {
      render(
        <Card>
          <CardContent>
            <img src="/test.jpg" alt="Test" />
          </CardContent>
        </Card>
      );

      expect(screen.getByAltText('Test')).toBeInTheDocument();
    });
  });
});
