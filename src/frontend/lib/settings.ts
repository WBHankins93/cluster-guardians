/**
 * Game Settings - Easy Mode and other user preferences
 */

export interface GameSettings {
  easyMode: boolean;
  showTutorials: boolean;
  autoShowHints: boolean;
}

const SETTINGS_KEY = "cluster-guardians-settings";

const defaultSettings: GameSettings = {
  easyMode: false,
  showTutorials: true,
  autoShowHints: true,
};

export function getSettings(): GameSettings {
  if (typeof window === "undefined") return defaultSettings;

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }

  return defaultSettings;
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

export function updateSetting<K extends keyof GameSettings>(
  key: K,
  value: GameSettings[K]
): void {
  const settings = getSettings();
  settings[key] = value;
  saveSettings(settings);
}

