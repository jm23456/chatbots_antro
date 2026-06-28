import { audioConfig } from './audioConfig.js';
import { debateConfig } from './debateConfig.js';

export const appConfig = {
  app: {
    defaultLanguage: 'de',
    supportedLanguages: ['de', 'en'],
    title: 'Chatbot-Debattenarena',
    introText: 'Verschiedene KI-Persönlichkeiten. Eine Debatte.',
  },
  audio: audioConfig,
  debate: debateConfig,
};

export default appConfig;
