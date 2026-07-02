export const audioConfig = {
  mutedStorageKey: 'debate-muted',
  defaultMute: false,
  defaultVolume: 1,
  defaultLang: 'de-DE',
  englishLang: 'en-US',
  baseWordDurationMs: 260,
  jitterMs: 40,
  baseSpeed: 1.2,
  femaleSpeakers: ['A', 'C'],
  voiceProfiles: {
    red: {
      pitch: 1.2,
      rateEn: 1.15,
      rateDe: 1.12,
      voiceType: 'female',
      preferredVoices: { en: 'google us english', de: 'google deutsch' },
    },
    yellow: {
      pitch: 0.8,
      rateEn: 0.75,
      rateDe: 0.85,
      voiceType: 'male',
      preferredVoices: { en: 'aaron', de: 'martin' },
    },
    blue: {
      pitch: 0.91,
      rateEn: 1.0,
      rateDe: 0.9,
      voiceType: 'male',
      preferredVoices: { en: 'google uk english male', de: 'martin' },
    },
    green: {
      pitch: 1.1,
      rateEn: 1.25,
      rateDe: 1.01,
      voiceType: 'male',
      preferredVoices: { en: 'aaron', de: 'martin' },
    },
    gray: {
      pitch: 1.25,
      rateEn: 0.85,
      rateDe: 0.99,
      voiceType: 'female',
      preferredVoices: { en: 'google uk english female', de: 'helena' },
    },
  },
};

export default audioConfig;
