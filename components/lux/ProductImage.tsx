/**
 * Product cutout with a phone-sized variant. `image` is the 1400px file in
 * /public/images; the -800 sibling is picked automatically on small screens.
 */
export default function ProductImage({
  image,
  alt,
  className = '',
  sizes = '(max-width: 640px) 92vw, 960px',
  priority = false,
  ...rest
}: { image: string; alt: string; className?: string; sizes?: string; priority?: boolean } & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'>) {
  const small = image.replace(/\.webp$/, '-800.webp');
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      srcSet={`${small} 800w, ${image} 1400w`}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={className}
      {...rest}
    />
  );
}
