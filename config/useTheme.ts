// hooks/useTheme.ts
import { useContext } from 'react';
import { SettingsContext } from './SettingsContext';
import { themes } from './colors';

const useTheme = () => {
  const settings = useContext(SettingsContext);
  return settings?.darkMode ? themes.dark : themes.light;
};

export default useTheme;