import { ProductCard, Button } from '@nim-ui/components';

export function ProductCardWithAction() {
  return (
    <ProductCard
      image="https://picsum.photos/seed/product3/400/400"
      title="Cotton T-Shirt"
      price="$29.99"
      description="Comfortable everyday wear"
      action={<Button size="sm">Add to Cart</Button>}
    />
  );
}
