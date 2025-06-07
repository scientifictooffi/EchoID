import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import useThemeStore from '@/store/theme-store';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { theme, setTheme, toggleTheme } = useThemeStore();
  
  useEffect(() => {
    if (!theme && systemColorScheme) {
      setTheme(systemColorScheme);
    }
  }, [systemColorScheme, theme, setTheme]);
  
  const isDarkMode = theme === 'dark';
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};