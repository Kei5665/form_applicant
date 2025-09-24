'use client';

import { useCallback, useEffect, useRef } from 'react';

type KuroshiroInstance = import('kuroshiro').default | null;

export function useHiraganaConverter() {
  const kuroshiroRef = useRef<KuroshiroInstance>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const Kuroshiro = (await import('kuroshiro')).default;
        const KuromojiAnalyzer = (await import('kuroshiro-analyzer-kuromoji')).default;
        const kuroshiro = new Kuroshiro();
        await kuroshiro.init(new KuromojiAnalyzer({ dictPath: '/dict' }));
        kuroshiroRef.current = kuroshiro;
      } catch (error) {
        console.error('Failed to initialize Kuroshiro:', error);
      }
    };
    void init();
  }, []);

  return useCallback(async (text: string) => {
    if (!kuroshiroRef.current || !text.trim()) return '';
    try {
      return await kuroshiroRef.current.convert(text, { to: 'hiragana', mode: 'spaced' });
    } catch (error) {
      console.error('Failed to convert to hiragana:', error);
      return '';
    }
  }, []);
}

