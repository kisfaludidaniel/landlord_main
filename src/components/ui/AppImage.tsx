'use client';

import React, { useState } from 'react';

interface AppImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
  fallbackSrc?: string;
  fill?: boolean;
  sizes?: string;
  [key: string]: any;
}

function AppImage({
  src,
  alt,
  width,
  height,
  className = '',
  onClick,
  fallbackSrc = '/assets/images/no_image.png',
  fill = false,
  sizes,
  ...props
}: AppImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const baseClassName = [
    className,
    isLoading ? 'animate-pulse bg-gray-200' : '',
    onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const commonProps = {
    src: imageSrc,
    alt,
    onLoad: handleLoad,
    onError: handleError,
    onClick,
    ...props,
  };

  if (fill) {
    return (
      <div className={`relative ${className}`} style={{ width: width || '100%', height: height || '100%' }}>
        <img
          {...commonProps}
          className={`${baseClassName} absolute inset-0 w-full h-full object-cover`}
          sizes={sizes}
        />
      </div>
    );
  }

  return (
    <img
      {...commonProps}
      className={baseClassName}
      width={width}
      height={height}
    />
  );
}

export default AppImage;
