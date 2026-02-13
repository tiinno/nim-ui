import { Avatar, AvatarImage, AvatarFallback } from '@tiinno-ui/components';

export function AvatarWithImage({ src, alt, fallback, size }: { src: string; alt: string; fallback: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  return (
    <Avatar size={size}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}

export function AvatarWithFallback({ fallback, size, className }: { fallback: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}
