import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'minimal' | 'high-contrast' | 'calm';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  getThemeClasses: () => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('stocksense-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('stocksense-theme', theme);

    // Apply theme to document body
    document.body.className = getThemeClasses();
  }, [theme]);

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'dark bg-gray-900 text-white';
      case 'minimal':
        return 'bg-gray-50 text-gray-900';
      case 'high-contrast':
        return 'bg-white text-black';
      case 'calm':
        return 'bg-blue-50 text-blue-900';
      default:
        return 'bg-white text-gray-900';
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, getThemeClasses }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme configurations
export const THEMES = {
  light: {
    name: 'Light',
    description: 'Clean and bright',
    icon: '☀️',
    classes: {
      background: 'bg-white',
      surface: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
      accent: 'bg-blue-600',
      card: 'bg-white border border-gray-200 shadow-sm',
      button: 'bg-blue-600 text-white hover:bg-blue-700'
    }
  },
  dark: {
    name: 'Dark',
    description: 'Easy on the eyes',
    icon: '🌙',
    classes: {
      background: 'bg-gray-900',
      surface: 'bg-gray-800',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      border: 'border-gray-700',
      accent: 'bg-blue-500',
      card: 'bg-gray-800 border border-gray-700 shadow-lg',
      button: 'bg-blue-500 text-white hover:bg-blue-600'
    }
  },
  minimal: {
    name: 'Minimal',
    description: 'Less distraction',
    icon: '⚪',
    classes: {
      background: 'bg-gray-50',
      surface: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-500',
      border: 'border-gray-100',
      accent: 'bg-gray-800',
      card: 'bg-white border border-gray-100 shadow-none',
      button: 'bg-gray-800 text-white hover:bg-gray-900'
    }
  },
  'high-contrast': {
    name: 'High Contrast',
    description: 'Maximum readability',
    icon: '⚫',
    classes: {
      background: 'bg-white',
      surface: 'bg-white',
      text: 'text-black',
      textSecondary: 'text-gray-800',
      border: 'border-black',
      accent: 'bg-black',
      card: 'bg-white border-2 border-black shadow-none',
      button: 'bg-black text-white hover:bg-gray-800'
    }
  },
  calm: {
    name: 'Calm',
    description: 'Soothing for focus',
    icon: '🌊',
    classes: {
      background: 'bg-blue-50',
      surface: 'bg-white',
      text: 'text-blue-900',
      textSecondary: 'text-blue-700',
      border: 'border-blue-200',
      accent: 'bg-blue-600',
      card: 'bg-white border border-blue-200 shadow-sm',
      button: 'bg-blue-600 text-white hover:bg-blue-700'
    }
  }
} as const;
