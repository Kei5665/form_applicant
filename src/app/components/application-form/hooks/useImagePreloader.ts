'use client';

import { useEffect, useRef } from 'react';

type UseImagePreloaderParams = {
  images: string[];
  onComplete: () => void;
  enable: boolean;
};

export function useImagePreloader({ images, onComplete, enable }: UseImagePreloaderParams) {
  const loadedCount = useRef(0);
  const totalImages = useRef(images.length);

  useEffect(() => {
    if (!enable) return;
    if (images.length === 0) {
      onComplete();
      return;
    }

    const timers: NodeJS.Timeout[] = [];

    const handleLoad = () => {
      loadedCount.current += 1;
      if (loadedCount.current >= totalImages.current) {
        timers.push(setTimeout(onComplete, 500));
      }
    };

    images.forEach((src) => {
      const img = document.createElement('img');
      img.src = src;
      img.onload = handleLoad;
    });

    const fallbackTimer = setTimeout(onComplete, 5000);
    timers.push(fallbackTimer);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [enable, images, onComplete]);
}

