import type { Product } from '@/components/ui/ProductCard';

// The API returns Prisma records: numeric fields may arrive as Decimal strings
// and images as an array. Normalize them for the storefront cards.
export interface RawProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number | string;
  discount?: number | string | null;
  stock: number;
  rating?: number | string | null;
  reviewCount?: number;
  image?: string | null;
  images?: (string | { url: string })[] | null;
  category?: { name: string; slug?: string } | string | null;
  isNew?: boolean;
}

export interface RawProductDetails extends RawProduct {
  description?: string | null;
  specifications?: { key: string; value: string }[] | Record<string, string> | null;
  reviews?: unknown[] | null;
}

export interface ProductDetails {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  discount: number;
  stock: number;
  rating: number;
  reviewCount: number;
  image: string | null;
  images: string[];
  description: string;
  specifications: Record<string, string>;
  category?: { name: string; slug: string };
  reviews: any[];
}

const imageUrl = (image: string | { url: string } | null | undefined): string | null => {
  if (!image) return null;
  return typeof image === 'string' ? image : image.url;
};

export function toCardProduct(raw: RawProduct): Product {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    brand: raw.brand,
    price: Number(raw.price),
    discount: Number(raw.discount ?? 0),
    stock: raw.stock,
    rating: Number(raw.rating ?? 0),
    reviewCount: raw.reviewCount ?? 0,
    image: raw.image ?? imageUrl(raw.images?.[0]) ?? null,
    category: typeof raw.category === 'string' ? raw.category : raw.category?.name,
    isNew: raw.isNew,
  };
}

// The details endpoint returns image objects and a specification array; the
// page renders a string list and a key/value table.
export function toDetailsProduct(raw: RawProductDetails): ProductDetails {
  const images = (raw.images ?? []).map(imageUrl).filter((url): url is string => Boolean(url));

  const specifications: Record<string, string> = Array.isArray(raw.specifications)
    ? Object.fromEntries(raw.specifications.map((spec) => [spec.key, spec.value]))
    : (raw.specifications ?? {});

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    brand: raw.brand,
    price: Number(raw.price),
    discount: Number(raw.discount ?? 0),
    stock: raw.stock,
    rating: Number(raw.rating ?? 0),
    reviewCount: raw.reviewCount ?? 0,
    image: images[0] ?? imageUrl(raw.image) ?? null,
    images,
    description: raw.description ?? '',
    specifications,
    category:
      raw.category && typeof raw.category === 'object'
        ? { name: raw.category.name, slug: raw.category.slug ?? '' }
        : undefined,
    reviews: (raw.reviews as any[]) ?? [],
  };
}
