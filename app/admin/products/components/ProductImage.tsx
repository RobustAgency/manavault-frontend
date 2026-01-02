'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function ProductImage({ src, alt, width, height }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError) {
    return (
      <div className="w-full max-w-xs aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-xs aspect-square overflow-hidden rounded-lg border bg-gray-50 dark:bg-gray-900">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        width={width}
        height={height}
        unoptimized
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}

