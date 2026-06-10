import AsyncStorage from './storage';

const SESSION_KEY = '@guest_session_id';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getGuestSessionId(): Promise<string> {
  try {
    let sessionId = await AsyncStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = generateUUID();
      await AsyncStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return generateUUID();
  }
}
