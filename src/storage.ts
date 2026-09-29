import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, type Days, type Settings } from './logic';

const KEY = 'ho-tracker:v1';

export type AppData = { settings: Settings; days: Days };

export async function loadData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppData>;
      return { settings: { ...DEFAULT_SETTINGS, ...parsed.settings }, days: parsed.days ?? {} };
    }
  } catch {
    // Corrupt or unreadable data: start fresh rather than crash.
  }
  return { settings: DEFAULT_SETTINGS, days: {} };
}

export async function saveData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}
