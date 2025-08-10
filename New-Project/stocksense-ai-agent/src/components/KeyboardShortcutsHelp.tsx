import type React from 'react';
import { useEffect } from 'react';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import { X, Keyboard, Zap, Eye, Palette, Users } from 'lucide-react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  section?: string;
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose,
  shortcuts
}) => {
  const { theme } = useTheme();
  const themeClasses = THEMES[theme].classes;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus the modal when it opens
      const modal = document.getElementById('shortcuts-modal');
      if (modal) {
        modal.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Group shortcuts by section
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const section = shortcut.section || 'General';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'Agent':
        return <Zap size={16} className="text-blue-600" />;
      case 'Display':
        return <Palette size={16} className="text-purple-600" />;
      case 'Demo':
        return <Users size={16} className="text-green-600" />;
      case 'Advanced':
        return <Eye size={16} className="text-orange-600" />;
      default:
        return <Keyboard size={16} className="text-gray-600" />;
    }
  };

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const keys = [];

    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.altKey) keys.push('Alt');
    keys.push(shortcut.key.toUpperCase());

    return keys;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        id="shortcuts-modal"
        className={`relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto ${themeClasses.card} rounded-xl shadow-2xl`}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="shortcuts-title"
        aria-describedby="shortcuts-description"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Keyboard size={24} className="text-blue-600" />
            <div>
              <h2 id="shortcuts-title" className={`text-xl font-bold ${themeClasses.text}`}>
                Keyboard Shortcuts
              </h2>
              <p id="shortcuts-description" className={`text-sm ${themeClasses.textSecondary}`}>
                Navigate StockSense without using your mouse
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} rounded-lg transition-colors`}
            aria-label="Close shortcuts help"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Quick tip */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                💡
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Pro Tip</h3>
                <p className="text-sm text-blue-800">
                  Press <kbd className="px-2 py-1 bg-blue-200 rounded text-xs font-mono">H</kbd> anytime to open this help.
                  Use <kbd className="px-2 py-1 bg-blue-200 rounded text-xs font-mono">Tab</kbd> to navigate between elements.
                </p>
              </div>
            </div>
          </div>

          {/* Shortcuts by section */}
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([section, sectionShortcuts]) => (
              <div key={section}>
                <div className="flex items-center gap-2 mb-3">
                  {getSectionIcon(section)}
                  <h3 className={`font-semibold ${themeClasses.text}`}>{section}</h3>
                </div>

                <div className="grid gap-2">
                  {sectionShortcuts.map((shortcut, index) => (
                    <div
                      key={`${section}-${index}`}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className={`text-sm ${themeClasses.text}`}>
                        {shortcut.description}
                      </span>

                      <div className="flex items-center gap-1">
                        {formatShortcut(shortcut).map((key, keyIndex) => (
                          <kbd
                            key={keyIndex}
                            className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono shadow-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Accessibility note */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Accessibility Features</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Screen reader announcements for important actions</li>
              <li>• High contrast focus indicators</li>
              <li>• Logical tab order navigation</li>
              <li>• ARIA labels and descriptions</li>
              <li>• Reduced motion options respected</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs font-mono">Esc</kbd> to close
            </p>
            <p className="text-xs text-gray-600">
              StockSense • Accessibility First
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
