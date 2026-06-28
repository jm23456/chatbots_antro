import { useState, useEffect, useRef, useCallback } from 'react';
import { appConfig } from '../../config/appConfig';

// Bot-Farben zu Stimm-Eigenschaften zuordnen
export type BotColor = 'red' | 'yellow' | 'green' | 'gray' | 'blue';

interface VoiceConfig {
  pitch: number;
  rateEn: number;
  rateDe: number;
  voiceType: 'male' | 'female';
  preferredVoices: { en: string; de: string };
}

const voiceConfigs: Record<BotColor, VoiceConfig> = appConfig.audio.voiceProfiles as Record<BotColor, VoiceConfig>;

interface SpeakOptions {
  botColor?: BotColor;
  lang?: string;
  onWordSpoken?: (wordIndex: number) => void;
}

interface UseSpeechSynthesisReturn {
  isMuted: boolean;
  toggleMute: () => void;
  speak: (text: string, options?: SpeakOptions) => void;
  stopSpeaking: () => void;
  pauseSpeaking: () => void;
  resumeSpeaking: () => void;
  isSpeaking: boolean;
  getWordDuration: (text: string, botColor?: BotColor) => number;
}

export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  // Mute-Status aus sessionStorage laden (persistiert während der Debatte)
  const [isMuted, setIsMuted] = useState(() => {
    const stored = sessionStorage.getItem(appConfig.audio.mutedStorageKey);
    return stored === 'true' || appConfig.audio.defaultMute;
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpokenTextRef = useRef<string>('');

  // Lade Stimmen wenn verfügbar
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      // DEBUG: Zeige alle verfügbaren deutschen Stimmen in der Konsole
      console.log('=== ALLE VERFÜGBAREN STIMMEN ===');
      availableVoices
        .filter(v => v.lang.startsWith('de'))
        .forEach((v, i) => console.log(`DE ${i}: "${v.name}" (${v.lang})`));
      availableVoices
        .filter(v => v.lang.startsWith('en'))
        .forEach((v, i) => console.log(`EN ${i}: "${v.name}" (${v.lang})`));
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Finde passende Stimme basierend auf Konfiguration

 const getVoiceForBot = useCallback(
    (botColor: BotColor, lang: string): SpeechSynthesisVoice | null => {
      const isEnglish = lang.startsWith('en');
      const langVoices = voices.filter(v => 
        isEnglish ? v.lang.startsWith('en') : v.lang === 'de-DE'
      );
      if (langVoices.length === 0) return null;

      const targetName = isEnglish
        ? voiceConfigs[botColor].preferredVoices.en
        : voiceConfigs[botColor].preferredVoices.de;

      // Finde die Stimme mit dem passenden Namen
      const matchingVoice = langVoices.find(v => 
        v.name.toLowerCase().includes(targetName.toLowerCase())
      );
      
      return matchingVoice || langVoices[0];
  
    }, [voices]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev;
      // Mute-Status im sessionStorage speichern
      sessionStorage.setItem(appConfig.audio.mutedStorageKey, String(newValue));
      if (newValue) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return newValue;
    });
  }, []);



  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    lastSpokenTextRef.current = '';
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  // Berechne durchschnittliche Wort-Dauer basierend auf Sprechgeschwindigkeit
  const getWordDuration = useCallback((_text: string, botColor: BotColor = 'yellow'): number => {
    const config = voiceConfigs[botColor];
    
    // Basis: ~260ms pro Wort bei Rate 1.0, angepasst an Bot-Rate
    const baseWordDuration = appConfig.audio.baseWordDurationMs;
    const jitter = Math.random() * appConfig.audio.jitterMs;
    return Math.round((baseWordDuration + jitter) / config.rateDe);

  }, []);

  const speak = useCallback((text: string, options: SpeakOptions = {}) => {
    if (isMuted || !text.trim()) return;
    
    const botColor = options.botColor || 'yellow';
    const lang = options.lang === 'en' ? appConfig.audio.englishLang : (options.lang || appConfig.audio.defaultLang);
    
    // Nur sprechen wenn neuer Text
    if (text === lastSpokenTextRef.current) return;
    window.speechSynthesis.cancel();
    lastSpokenTextRef.current = text;
    
    const config = voiceConfigs[botColor];
    const humanizeText = (text: string) =>
      text
        .replace(/:/g, '- ')
        .replace(/\n+/g, '. ')
        .replace(/([.,!?;:])([A-ZÄÖÜ])/g, ' $1 $2 ');
    const utterance = new SpeechSynthesisUtterance(humanizeText(text));
    const vary = (base: number, delta = 0.04) =>
      base + (Math.random() * delta * 2 - delta);
    
    utterance.lang = lang;
    const isEnglish = lang.startsWith('en');
    const baseRate = isEnglish ? config.rateEn : config.rateDe;
    utterance.rate = vary(baseRate, 0.05);
    utterance.pitch = vary(config.pitch, 0.04);
    utterance.volume = 1;

    // Stimme für diesen Bot auswählen
    const voice = getVoiceForBot(botColor, utterance.lang);
    if (voice) {
      utterance.voice = voice;
      console.log(`Bot ${botColor}: Stimme "${voice.name}" (pitch: ${utterance.pitch.toFixed(2)})`);
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Word boundary events für Synchronisation
    if (options.onWordSpoken) {
      let wordIndex = 0;
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          options.onWordSpoken?.(wordIndex);
          wordIndex++;
        }
      };
    }

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isMuted, getVoiceForBot]);

  return {
    isMuted,
    toggleMute,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    isSpeaking,
    getWordDuration
  };
};

export default useSpeechSynthesis;
