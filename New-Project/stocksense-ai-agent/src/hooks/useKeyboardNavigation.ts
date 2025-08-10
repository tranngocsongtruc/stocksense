import { useEffect, useCallback, useRef, useState } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
  section?: string;
}

interface UseKeyboardNavigationProps {
  onToggleHelp?: () => void;
  onToggleAgent?: () => void;
  onSearch?: () => void;
  onRandomize?: () => void;
  onClearSearch?: () => void;
  onToggleTheme?: () => void;
  onSimulateBeginner?: () => void;
  onSimulateIntermediate?: () => void;
  onSimulateAdvanced?: () => void;
  onEscape?: () => void;
}

export const useKeyboardNavigation = (props: UseKeyboardNavigationProps) => {
  const [helpVisible, setHelpVisible] = useState(false);
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const focusedElementRef = useRef<HTMLElement | null>(null);

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // Basic Navigation
    { key: '/', description: 'Focus search bar', action: () => props.onSearch?.(), section: 'Navigation' },
    { key: 'Escape', description: 'Clear search / Close modals', action: () => props.onEscape?.(), section: 'Navigation' },
    { key: 'h', description: 'Show keyboard shortcuts help', action: () => toggleHelp(), section: 'Navigation' },

    // Agent Controls
    { key: 'a', description: 'Toggle AI Agent', action: () => props.onToggleAgent?.(), section: 'Agent' },
    { key: 'r', description: 'Randomize stocks', action: () => props.onRandomize?.(), section: 'Agent' },

    // Theme & Display
    { key: 't', description: 'Cycle themes', action: () => props.onToggleTheme?.(), section: 'Display' },

    // User Simulation (for demo)
    { key: '1', description: 'Simulate beginner user', action: () => props.onSimulateBeginner?.(), section: 'Demo' },
    { key: '2', description: 'Simulate intermediate user', action: () => props.onSimulateIntermediate?.(), section: 'Demo' },
    { key: '3', description: 'Simulate advanced user', action: () => props.onSimulateAdvanced?.(), section: 'Demo' },

    // Advanced shortcuts with modifiers
    { key: 'k', ctrlKey: true, description: 'Open command palette', action: () => toggleHelp(), section: 'Advanced' },
    { key: 'Enter', ctrlKey: true, description: 'Toggle AI Agent', action: () => props.onToggleAgent?.(), section: 'Advanced' },
  ];

  const toggleHelp = useCallback(() => {
    setHelpVisible(!helpVisible);
    props.onToggleHelp?.();
  }, [helpVisible, props]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      // Allow Escape to work in input fields
      if (event.key === 'Escape') {
        target.blur();
        props.onEscape?.();
      }
      return;
    }

    // Find matching shortcut
    const shortcut = shortcuts.find(s =>
      s.key.toLowerCase() === event.key.toLowerCase() &&
      !!s.ctrlKey === event.ctrlKey &&
      !!s.shiftKey === event.shiftKey &&
      !!s.altKey === event.altKey
    );

    if (shortcut) {
      event.preventDefault();
      shortcut.action();

      // Provide visual feedback
      setFocusedElement(shortcut.description);
      setTimeout(() => setFocusedElement(null), 1000);
    }
  }, [shortcuts, props]);

  // Tab navigation enhancement
  const enhanceTabNavigation = useCallback(() => {
    // Add tab index to all interactive elements
    const interactiveElements = document.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );

    interactiveElements.forEach((el, index) => {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }
    });

    // Add focus indicators via CSS
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced focus indicators for accessibility */
      *:focus {
        outline: 2px solid #2563eb !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1) !important;
      }

      /* Skip to main content link */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #2563eb;
        color: white;
        padding: 8px;
        border-radius: 4px;
        text-decoration: none;
        z-index: 1000;
        transition: top 0.3s;
      }

      .skip-link:focus {
        top: 6px;
      }

      /* Keyboard navigation indicators */
      .keyboard-focused {
        animation: keyboardPulse 0.6s ease-in-out;
      }

      @keyframes keyboardPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
      }
    `;

    if (!document.getElementById('keyboard-nav-styles')) {
      style.id = 'keyboard-nav-styles';
      document.head.appendChild(style);
    }
  }, []);

  // Focus management functions
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.classList.add('keyboard-focused');
      setTimeout(() => element.classList.remove('keyboard-focused'), 600);
      focusedElementRef.current = element;
    }
  }, []);

  const focusFirstStockCard = useCallback(() => {
    focusElement('[data-testid="stock-card"]:first-child, .stock-card:first-child');
  }, [focusElement]);

  const focusSearchBar = useCallback(() => {
    focusElement('input[type="text"], input[placeholder*="Search"]');
  }, [focusElement]);

  const focusAgentToggle = useCallback(() => {
    focusElement('[data-testid="agent-toggle"], button:contains("Agent")');
  }, [focusElement]);

  // Initialize keyboard navigation
  useEffect(() => {
    enhanceTabNavigation();

    // Add skip link for screen readers
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const mainContent = document.getElementById('main-content') || document.querySelector('main');
      if (mainContent) {
        mainContent.focus();
      }
    });

    if (!document.querySelector('.skip-link')) {
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enhanceTabNavigation]);

  // ARIA announcements for screen readers
  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }, []);

  return {
    shortcuts,
    helpVisible,
    setHelpVisible,
    focusedElement,
    focusElement,
    focusFirstStockCard,
    focusSearchBar,
    focusAgentToggle,
    announceToScreenReader,
    toggleHelp
  };
};

export default useKeyboardNavigation;
