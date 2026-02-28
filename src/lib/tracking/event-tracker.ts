type EventType = 'VIEW' | 'SAVE' | 'UNSAVE' | 'LIKE' | 'UNLIKE' | 'CLICK' | 'SEARCH' | 'FILTER_CHANGE' | 'SHARE';
type TargetType = 'MOMENT' | 'PLACE' | 'TRIP' | 'USER';

interface TrackingEvent {
  eventType: EventType;
  targetId?: string;
  targetType?: TargetType;
  metadata?: Record<string, unknown>;
}

const FLUSH_INTERVAL = 5000;
const MAX_BATCH_SIZE = 20;

class EventTracker {
  private buffer: TrackingEvent[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.timer = setInterval(() => this.flush(), FLUSH_INTERVAL);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') this.flush();
      });
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  track(eventType: EventType, targetId?: string, targetType?: TargetType, metadata?: Record<string, unknown>) {
    this.buffer.push({ eventType, targetId, targetType, metadata });
    if (this.buffer.length >= MAX_BATCH_SIZE) this.flush();
  }

  private flush() {
    if (this.buffer.length === 0) return;
    const events = this.buffer.slice(0, MAX_BATCH_SIZE); // clone, don't splice
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true,
    })
    .then((res) => {
      if (res.ok) {
        // Only remove sent events on success
        this.buffer.splice(0, events.length);
      }
    })
    .catch(() => {
      // Events stay in buffer for next flush
    });
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
    this.flush();
  }
}

export const tracker = typeof window !== 'undefined' ? new EventTracker() : null;
