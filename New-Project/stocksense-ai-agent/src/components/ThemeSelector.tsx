import type React from 'react';
import { useState } from 'react';
import { useTheme, THEMES, type Theme } from '../contexts/ThemeContext';
import { Palette, Check } from 'lucide-react';

export const ThemeSelector: React.FC = () => {
  const { theme: currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors bg-white"
        aria-label="Select theme"
      >
        <Palette size={16} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {THEMES[currentTheme].icon} {THEMES[currentTheme].name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Choose Theme</h3>
            <p className="text-xs text-gray-600 mt-1">Select a theme that works best for you</p>
          </div>

          <div className="p-2">
            {Object.entries(THEMES).map(([key, themeData]) => {
              const isSelected = currentTheme === key;

              return (
                <button
                  key={key}
                  onClick={() => {
                    setTheme(key as Theme);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    <span className="text-lg">{themeData.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{themeData.name}</span>
                      {isSelected && <Check size={14} className="text-blue-600" />}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{themeData.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-600">
              💡 <strong>Tip:</strong> Try "Minimal" or "Calm" themes for reduced visual distractions
            </p>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
