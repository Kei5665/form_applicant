'use client';

import { useEffect, useRef } from 'react';

import { assetPath } from '@/lib/basePath';

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
      // basePath 配下では /public 画像が `${BASE_PATH}/...` で配信されるため前置する。
      img.src = src.startsWith('/') ? assetPath(src) : src;
      img.onload = handleLoad;
      // 画像が見つからない場合もローディングが止まらないよう、エラーも「完了」扱いにする。
      img.onerror = handleLoad;
    });

    const fallbackTimer = setTimeout(onComplete, 5000);
    timers.push(fallbackTimer);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [enable, images, onComplete]);
}

