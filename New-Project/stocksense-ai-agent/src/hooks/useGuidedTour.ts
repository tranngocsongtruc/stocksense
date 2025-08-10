import { useState, useCallback, useEffect } from 'react';

export interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
  skipable?: boolean;
  highlightPadding?: number;
}

interface TourConfig {
  id: string;
  name: string;
  steps: TourStep[];
  autoStart?: boolean;
  showProgress?: boolean;
}

export const useGuidedTour = () => {
  const [activeTour, setActiveTour] = useState<TourConfig | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [tourProgress, setTourProgress] = useState<Record<string, number>>({});

  // Load completed tours from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('stocksense_completed_tours');
    if (stored) {
      setCompletedTours(JSON.parse(stored));
    }

    const progress = localStorage.getItem('stocksense_tour_progress');
    if (progress) {
      setTourProgress(JSON.parse(progress));
    }
  }, []);

  // Save tour completion status
  const saveTourCompletion = useCallback((tourId: string) => {
    const updated = [...completedTours, tourId];
    setCompletedTours(updated);
    localStorage.setItem('stocksense_completed_tours', JSON.stringify(updated));

    // Update progress
    const updatedProgress = { ...tourProgress, [tourId]: 100 };
    setTourProgress(updatedProgress);
    localStorage.setItem('stocksense_tour_progress', JSON.stringify(updatedProgress));
  }, [completedTours, tourProgress]);

  // Save tour progress
  const saveTourProgress = useCallback((tourId: string, stepIndex: number, totalSteps: number) => {
    const progress = Math.round((stepIndex / totalSteps) * 100);
    const updatedProgress = { ...tourProgress, [tourId]: progress };
    setTourProgress(updatedProgress);
    localStorage.setItem('stocksense_tour_progress', JSON.stringify(updatedProgress));
  }, [tourProgress]);

  // Start a tour
  const startTour = useCallback((tour: TourConfig) => {
    setActiveTour(tour);
    setCurrentStepIndex(0);
    setIsPlaying(true);

    // Save initial progress
    saveTourProgress(tour.id, 0, tour.steps.length);
  }, [saveTourProgress]);

  // Go to next step
  const nextStep = useCallback(() => {
    if (!activeTour) return;

    const currentStep = activeTour.steps[currentStepIndex];
    if (currentStep.action) {
      currentStep.action();
    }

    if (currentStepIndex < activeTour.steps.length - 1) {
      const newIndex = currentStepIndex + 1;
      // Add a small delay to prevent rapid cycling
      setTimeout(() => {
        setCurrentStepIndex(newIndex);
        saveTourProgress(activeTour.id, newIndex, activeTour.steps.length);
      }, 100);
    } else {
      // Tour completed - complete inline to avoid dependency cycle
      if (activeTour) {
        saveTourCompletion(activeTour.id);
      }
      setActiveTour(null);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  }, [activeTour, currentStepIndex, saveTourProgress, saveTourCompletion]);

  // Go to previous step
  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      if (activeTour) {
        saveTourProgress(activeTour.id, newIndex, activeTour.steps.length);
      }
    }
  }, [currentStepIndex, activeTour, saveTourProgress]);

  // Skip current step
  const skipStep = useCallback(() => {
    const currentStep = activeTour?.steps[currentStepIndex];
    if (currentStep?.skipable !== false) {
      nextStep();
    }
  }, [activeTour, currentStepIndex, nextStep]);

  // Complete tour
  const completeTour = useCallback(() => {
    if (activeTour) {
      saveTourCompletion(activeTour.id);
    }
    setActiveTour(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [activeTour, saveTourCompletion]);

  // End tour early
  const endTour = useCallback(() => {
    setActiveTour(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  // Get current step
  const getCurrentStep = useCallback((): TourStep | null => {
    if (!activeTour || !isPlaying) return null;
    return activeTour.steps[currentStepIndex] || null;
  }, [activeTour, currentStepIndex, isPlaying]);

  // Check if tour is completed
  const isTourCompleted = useCallback((tourId: string): boolean => {
    return completedTours.includes(tourId);
  }, [completedTours]);

  // Get tour progress percentage
  const getTourProgress = useCallback((tourId: string): number => {
    return tourProgress[tourId] || 0;
  }, [tourProgress]);

  // Reset tour completion (for testing)
  const resetTourCompletion = useCallback((tourId?: string) => {
    if (tourId) {
      const updated = completedTours.filter(id => id !== tourId);
      setCompletedTours(updated);
      localStorage.setItem('stocksense_completed_tours', JSON.stringify(updated));

      const updatedProgress = { ...tourProgress };
      delete updatedProgress[tourId];
      setTourProgress(updatedProgress);
      localStorage.setItem('stocksense_tour_progress', JSON.stringify(updatedProgress));
    } else {
      setCompletedTours([]);
      setTourProgress({});
      localStorage.removeItem('stocksense_completed_tours');
      localStorage.removeItem('stocksense_tour_progress');
    }
  }, [completedTours, tourProgress]);

  return {
    activeTour,
    currentStepIndex,
    isPlaying,
    completedTours,
    startTour,
    nextStep,
    previousStep,
    skipStep,
    completeTour,
    endTour,
    getCurrentStep,
    isTourCompleted,
    getTourProgress,
    resetTourCompletion,
    totalSteps: activeTour?.steps.length || 0,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === (activeTour?.steps.length || 0) - 1
  };
};

// Predefined tours
export const TOURS: Record<string, TourConfig> = {
  beginner: {
    id: 'beginner-onboarding',
    name: 'Getting Started with StockSense',
    autoStart: true,
    showProgress: true,
    steps: [
      {
        id: 'welcome',
        target: 'body',
        title: 'Welcome to StockSense! 🎉',
        content: 'Welcome to the most intelligent stock analysis platform! Let me show you around. This tour will take about 2 minutes.',
        position: 'top'
      },
      {
        id: 'search',
        target: 'input[type="text"]',
        title: 'Smart Search 🔍',
        content: 'Search for any stock or financial term. Our AI analyzes your searches to understand your expertise level and adapt the interface.',
        position: 'bottom'
      },
      {
        id: 'stocks',
        target: '[data-tour="stocks-header"], h2',
        title: 'Stock Information 📈',
        content: 'These cards show real-time stock information. The content adapts based on your experience level - beginners see simple explanations, experts see detailed metrics.',
        position: 'top'
      },
      {
        id: 'controls',
        target: '[data-tour="discover-button"], button:contains("Discover")',
        title: 'Discover New Stocks 🎲',
        content: 'Click "Discover" to see random stocks from different sectors and markets around the world.',
        position: 'left'
      },
      {
        id: 'ai-features',
        target: '.lg\\:col-span-1, .space-y-6',
        title: 'AI Assistant Panel 🤖',
        content: 'The sidebar contains your AI assistant, user profile, and advanced controls. The AI watches your behavior and adapts the interface.',
        position: 'left'
      },
      {
        id: 'accessibility',
        target: 'header',
        title: 'Accessibility Features ♿',
        content: 'StockSense is fully accessible! Use keyboard shortcuts (press H), customize layouts, and enable focus timers for ADHD support.',
        position: 'bottom'
      },
      {
        id: 'complete',
        target: 'body',
        title: 'You\'re All Set! 🚀',
        content: 'That\'s it! You now know the basics of StockSense. Try pressing "H" for keyboard shortcuts, or start searching for stocks. Happy investing!',
        position: 'top'
      }
    ]
  },

  advanced: {
    id: 'advanced-features',
    name: 'Advanced StockSense Features',
    showProgress: true,
    steps: [
      {
        id: 'agent-details',
        target: '[data-tour="agent-status"]',
        title: 'AI Agent Deep Dive 🧠',
        content: 'The AI agent follows an observe-think-act loop, constantly analyzing market sentiment and your behavior patterns to provide intelligent recommendations.',
        position: 'left'
      },
      {
        id: 'sentiment-analysis',
        target: '[data-tour="sentiment"]',
        title: 'Sentiment Analysis 📊',
        content: 'Each stock shows real-time sentiment analysis from multiple sources, including confidence scores and trending keywords.',
        position: 'top'
      },
      {
        id: 'market-simulator',
        target: '[data-tour="market-simulator"]',
        title: 'Market Simulator 🎮',
        content: 'Use the market simulator to see how the AI agent responds to different market conditions in real-time.',
        position: 'right'
      },
      {
        id: 'customization',
        target: '[data-tour="advanced-controls"]',
        title: 'Advanced Customization ⚙️',
        content: 'Access advanced settings to customize your dashboard layout, data preferences, and AI sensitivity.',
        position: 'left'
      }
    ]
  }
};

export default useGuidedTour;
