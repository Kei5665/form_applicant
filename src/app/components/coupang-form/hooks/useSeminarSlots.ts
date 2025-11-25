import { useEffect, useState } from 'react';
import type { SeminarSlot } from '../types';

type SeminarSlotsResponse = {
  events: SeminarSlot[];
};

export function useSeminarSlots() {
  const [slots, setSlots] = useState<SeminarSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/coupang/seminar-slots');

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API error:', errorData);
          throw new Error('セミナー枠の取得に失敗しました');
        }

        const data = (await response.json()) as SeminarSlotsResponse;
        console.log('Received slots data:', data);

        if (data.events && Array.isArray(data.events)) {
          setSlots(data.events);
          console.log('Set slots:', data.events);
        } else {
          console.warn('No events in response or invalid format:', data);
          setSlots([]);
        }
        setError('');
      } catch (err) {
        console.error('Error fetching seminar slots:', err);
        setError('セミナー枠の取得に失敗しました');
        setSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, []);

  return { slots, isLoading, error };
}
