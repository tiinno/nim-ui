import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Container component for responsive max-width constraints
 *
 * @example
 * // Default container
 * <Container>Content here</Container>
 *
 * @example
 * // Large container without padding
 * <Container maxWidth="lg" padding={false}>Full width content</Container>
 *
 * @example
 * // Small centered container
 * <Container maxWidth="sm">Narrow content</Container>
 */

const containerVariants = cva(
  'mx-auto w-full',
  {
    variants: {
      maxWidth: {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl',
        full: 'max-w-full',
      },
      padding: {
        true: 'px-4 sm:px-6 lg:px-8',
        false: '',
      },
    },
    defaultVariants: {
      maxWidth: 'xl',
      padding: true,
    },
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(containerVariants({ maxWidth, padding }), className)}
      {...props}
    />
  )
);
Container.displayName = 'Container';

export { Container, containerVariants };
