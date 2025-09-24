type DataLayerEvent = Record<string, unknown> & {
  event: string;
};

export function trackEvent(event: string, payload: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    const data: DataLayerEvent = {
      event,
      ...payload,
    };
    window.dataLayer.push(data);
  }
}

