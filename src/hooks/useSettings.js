"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useAuth } from "./useAuth";

// Define default settings values
const defaults = {
  deepgramApiKey: "",
  backendBaseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080",
  voiceName: "Aoede",
  sampleRate: 27000,
  systemInstructions: "You are a helpful assistant named Theta.",
  temperature: 1.8,
  top_p: 0.95,
  top_k: 65,
  fps: 1,
  resizeWidth: 640,
  quality: 0.3,
  harassmentThreshold: 3,
  dangerousContentThreshold: 3,
  sexuallyExplicitThreshold: 3,
  civicIntegrityThreshold: 3,
  transcribeModelsSpeech: true,
  transcribeUsersSpeech: false,
};

// Threshold mapping for safety settings
const thresholds = {
  0: "BLOCK_NONE",
  1: "BLOCK_ONLY_HIGH",
  2: "BLOCK_MEDIUM_AND_ABOVE",
  3: "BLOCK_LOW_AND_ABOVE",
};

// Hardcoded API Key
const HARDCODED_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

// Create Settings Context
const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(defaults);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme === "light" ? "light" : "dark";
    }
    return "dark";
  });

  // Load settings and apply theme from localStorage on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadedSettings = {};
    Object.keys(defaults).forEach((key) => {
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        if (key === "transcribeModelsSpeech" || key === "transcribeUsersSpeech") {
          loadedSettings[key] = storedValue === "true";
        } else if (key === "deepgramApiKey" || key === "voiceName" || key === "systemInstructions") {
          loadedSettings[key] = storedValue;
        } else if (key === "temperature" || key === "top_p" || key === "quality") {
          loadedSettings[key] = parseFloat(storedValue);
        } else {
          const parsedInt = parseInt(storedValue, 10);
          loadedSettings[key] = isNaN(parsedInt) ? defaults[key] : parsedInt;
        }
      } else {
        loadedSettings[key] = defaults[key];
      }
    });
    setSettings(loadedSettings);

    if (!HARDCODED_API_KEY) {
      console.warn("WARNING: Gemini API Key is not set in environment variables. Connection will fail.");
    }

    // Apply initial theme class
    if (theme === "light") {
      document.body.classList.add("theme-light");
    } else {
      document.body.classList.remove("theme-light");
    }
  }, [theme]);

  // Theme Management
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (theme === "light") {
      document.body.classList.add("theme-light");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("theme-light");
      localStorage.setItem("theme", "dark");
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  }, []);

  const saveSettings = useCallback((newSettings) => {
    if (typeof window === 'undefined') return;

    Object.entries(newSettings).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    setSettings(newSettings);
    setIsSettingsOpen(false);
    window.location.reload();
  }, []);

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  const getGeminiConfig = useCallback(
    (toolDeclarations = [], conversationContextSummary = '') => {
      const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;
      const baseInstructions = "You are a helpful assistant named Theta. ";
      
      const userPrefix = userName
        ? `The user you are speaking with is logged in as ${userName}. `
        : "The user is not logged in. ";

      const contextPrefix = conversationContextSummary
        ? `This is a continuing conversation. Here is the summary of the previous messages:\n---\n${conversationContextSummary}\n---\n\nPlease consider this context in your responses. The current date is ${new Date().toDateString()}.\n\n`
        : "";
      
      const finalInstructions = contextPrefix + userPrefix + baseInstructions;

      return {
        model: "models/gemini-2.0-flash-exp",
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        generationConfig: {
          temperature: settings.temperature,
          top_p: settings.top_p,
          top_k: settings.top_k,
          responseModalities: "audio",
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: settings.voiceName,
              },
            },
          },
        },
        systemInstruction: {
          parts: [{ text: finalInstructions }],
        },
        tools: { functionDeclarations: toolDeclarations },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: thresholds[settings.harassmentThreshold] ?? "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: thresholds[settings.dangerousContentThreshold] ?? "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: thresholds[settings.sexuallyExplicitThreshold] ?? "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: thresholds[settings.harassmentThreshold] ?? "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
          },
          {
            category: "HARM_CATEGORY_CIVIC_INTEGRITY",
            threshold: thresholds[settings.civicIntegrityThreshold] ?? "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
          },
        ],
      };
    },
    [settings, user],
  );

  const getWebsocketUrl = useCallback(() => {
    if (!HARDCODED_API_KEY) {
      console.error("API Key is not set in environment variables!");
      return null;
    }
    return `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${HARDCODED_API_KEY}`;
  }, []);

  const value = {
    settings,
    isSettingsOpen,
    saveSettings,
    openSettings,
    closeSettings,
    getGeminiConfig,
    getWebsocketUrl,
    thresholds,
    theme,
    toggleTheme,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};