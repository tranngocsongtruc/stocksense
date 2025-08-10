import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import type { TourStep } from '../hooks/useGuidedTour';
import {
  ChevronLeft,
  ChevronRight,
  X,
  SkipForward,
  MapPin,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface GuidedTourOverlayProps {
  currentStep: TourStep | null;
  currentStepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onEnd: () => void;
  tourProgress?: number;
}

export const GuidedTourOverlay: React.FC<GuidedTourOverlayProps> = ({
  currentStep,
  currentStepIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  onNext,
  onPrevious,
  onSkip,
  onEnd,
  tourProgress = 0
}) => {
  const { theme } = useTheme();
  const themeClasses = THEMES[theme].classes;
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [popoverPlacement, setPopoverPlacement] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Find and highlight target element
  useEffect(() => {
    if (!currentStep) {
      setHighlightedElement(null);
      return;
    }

    let retryCount = 0;
    const maxRetries = 10;

    const findElement = () => {
      // Try multiple selectors from the target string (comma-separated)
      const selectors = currentStep.target.split(',').map(s => s.trim());
      let element: HTMLElement | null = null;

      for (const selector of selectors) {
        try {
          element = document.querySelector(selector) as HTMLElement;
          if (element) break;
        } catch (error) {
          console.warn('Invalid selector:', selector);
          continue;
        }
      }

      if (element) {
        setHighlightedElement(element);
        calculatePopoverPosition(element);

        // Scroll element into view
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      } else {
        retryCount++;
        if (retryCount < maxRetries) {
          // Element not found, try again after a short delay
          setTimeout(findElement, 200);
        } else {
          console.warn('Could not find element for tour step:', currentStep.id, currentStep.target);
          // Continue anyway, just show popover without highlighting
          setHighlightedElement(null);
          setPopoverPosition({ top: 100, left: 100 });
        }
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(findElement, 100);
  }, [currentStep]);

  // Calculate popover position relative to highlighted element
  const calculatePopoverPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const popover = popoverRef.current;
    if (!popover) return;

    const popoverRect = popover.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16;

    let top = 0;
    let left = 0;
    let placement = currentStep?.position || 'bottom';

    // Calculate position based on preferred placement
    switch (placement) {
      case 'top':
        top = rect.top - popoverRect.height - padding;
        left = rect.left + (rect.width - popoverRect.width) / 2;
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + (rect.width - popoverRect.width) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - popoverRect.height) / 2;
        left = rect.left - popoverRect.width - padding;
        break;
      case 'right':
        top = rect.top + (rect.height - popoverRect.height) / 2;
        left = rect.right + padding;
        break;
    }

    // Adjust if popover would be outside viewport
    if (left < padding) {
      left = padding;
      if (placement === 'top' || placement === 'bottom') {
        placement = 'right';
        left = rect.right + padding;
        top = rect.top + (rect.height - popoverRect.height) / 2;
      }
    }

    if (left + popoverRect.width > viewportWidth - padding) {
      left = viewportWidth - popoverRect.width - padding;
      if (placement === 'top' || placement === 'bottom') {
        placement = 'left';
        left = rect.left - popoverRect.width - padding;
        top = rect.top + (rect.height - popoverRect.height) / 2;
      }
    }

    if (top < padding) {
      top = padding;
      if (placement === 'left' || placement === 'right') {
        placement = 'bottom';
        top = rect.bottom + padding;
        left = rect.left + (rect.width - popoverRect.width) / 2;
      }
    }

    if (top + popoverRect.height > viewportHeight - padding) {
      top = viewportHeight - popoverRect.height - padding;
      if (placement === 'left' || placement === 'right') {
        placement = 'top';
        top = rect.top - popoverRect.height - padding;
        left = rect.left + (rect.width - popoverRect.width) / 2;
      }
    }

    setPopoverPosition({ top, left });
    setPopoverPlacement(placement);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentStep) return;

      switch (event.key) {
        case 'Escape':
          onEnd();
          break;
        case 'ArrowRight':
        case ' ':
          event.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (!isFirstStep) onPrevious();
          break;
        case 's':
        case 'S':
          if (currentStep.skipable !== false) {
            onSkip();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, onNext, onPrevious, onSkip, onEnd, isFirstStep]);

  if (!currentStep) return null;

  const getHighlightStyle = () => {
    if (!highlightedElement) return {};

    const rect = highlightedElement.getBoundingClientRect();
    const padding = currentStep.highlightPadding || 8;

    return {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
  };

  const getArrowClasses = () => {
    const base = "absolute w-3 h-3 transform rotate-45";
    const bg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';

    switch (popoverPlacement) {
      case 'top':
        return `${base} ${bg} -bottom-1.5 left-1/2 -translate-x-1/2`;
      case 'bottom':
        return `${base} ${bg} -top-1.5 left-1/2 -translate-x-1/2`;
      case 'left':
        return `${base} ${bg} -right-1.5 top-1/2 -translate-y-1/2`;
      case 'right':
        return `${base} ${bg} -left-1.5 top-1/2 -translate-y-1/2`;
      default:
        return `${base} ${bg} -top-1.5 left-1/2 -translate-x-1/2`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop with cutout for highlighted element */}
      <div className="absolute inset-0 bg-black bg-opacity-40">
        {highlightedElement && (
          <div
            className="absolute border-4 border-blue-500 rounded-lg bg-transparent"
            style={getHighlightStyle()}
          />
        )}
      </div>

      {/* Tour popover */}
      <div
        ref={popoverRef}
        className={`absolute ${themeClasses.card} rounded-xl shadow-2xl pointer-events-auto max-w-sm z-50`}
        style={{
          top: popoverPosition.top,
          left: popoverPosition.left,
        }}
      >
        {/* Arrow pointing to element */}
        <div className={getArrowClasses()} />

        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className={`font-semibold ${themeClasses.text} text-sm`}>
                {currentStep.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs ${themeClasses.textSecondary}`}>
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
                {tourProgress > 0 && (
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-16">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${tourProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onEnd}
            className={`flex-shrink-0 p-1 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
            aria-label="End tour"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <div className="flex items-start gap-2 mb-4">
            <Lightbulb size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className={`text-sm ${themeClasses.text} leading-relaxed`}>
              {currentStep.content}
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onPrevious}
              disabled={isFirstStep}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isFirstStep
                  ? 'text-gray-400 cursor-not-allowed'
                  : `${themeClasses.textSecondary} hover:${themeClasses.text}`
              }`}
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {currentStep.skipable !== false && (
                <button
                  onClick={onSkip}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm ${themeClasses.textSecondary} hover:${themeClasses.text} rounded-lg transition-colors`}
                >
                  <SkipForward size={14} />
                  Skip
                </button>
              )}

              <button
                onClick={onNext}
                className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isLastStep ? 'Finish' : 'Next'}
                {isLastStep ? <ArrowRight size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>
          </div>

          {/* Keyboard hints */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Use <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">→</kbd> to continue,
              <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs ml-1">←</kbd> to go back,
              <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs ml-1">Esc</kbd> to exit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedTourOverlay;
