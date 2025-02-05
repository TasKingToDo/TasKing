import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsContextType = {
  darkMode: boolean;
  fontSize: number;
  toggleDarkMode: () => void;
  setFontSize: (size: number) => void;
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(16);

  useEffect(() => {
    // Load settings from storage
    const loadSettings = async () => {
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      const savedFontSize = await AsyncStorage.getItem('fontSize');

      if (savedDarkMode !== null) setDarkMode(JSON.parse(savedDarkMode));
      if (savedFontSize !== null) setFontSize(Number(savedFontSize));
    };

    loadSettings();
  }, []);

  useEffect(() => {
    // Save settings whenever they change
    AsyncStorage.setItem('darkMode', JSON.stringify(darkMode));
    AsyncStorage.setItem('fontSize', fontSize.toString());
  }, [darkMode, fontSize]);

  return (
    <SettingsContext.Provider value={{ darkMode, fontSize, toggleDarkMode: () => setDarkMode(prev => !prev), setFontSize }}>
      {children}
    </SettingsContext.Provider>
  );
};
