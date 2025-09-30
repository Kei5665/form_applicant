import type { FormData } from '../types';

type NotifyPayload = Pick<FormData, 'fullName' | 'phoneNumber'>;

export async function notifyInvalidPhoneNumber(payload: NotifyPayload) {
  try {
    await fetch('/api/notify_invalid_phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Error notifying backend:', error);
  }
}

