import { useEffect, useRef } from 'react';
import { tracker } from '@/lib/tracking/event-tracker';

export function useTrackView(
  targetId: string,
  targetType: 'MOMENT' | 'PLACE' | 'TRIP' | 'USER',
  thresholdMs: number = 2000
) {
  const ref = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || tracked.current) return;

    let timer: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          timer = setTimeout(() => {
            tracker?.track('VIEW', targetId, targetType);
            tracked.current = true;
            observer.disconnect();
          }, thresholdMs);
        } else {
          clearTimeout(timer);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [targetId, targetType, thresholdMs]);

  return ref;
}
