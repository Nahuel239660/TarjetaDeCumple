"use client";

import Image from "next/image";

interface EventImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}

export function EventImage({ src, alt, priority = false, sizes, className }: EventImageProps) {
  if (!src) {
    return <div className="media-placeholder" role="img" aria-label={`${alt}: imagen no disponible`} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      unoptimized={src.startsWith("data:")}
    />
  );
}
