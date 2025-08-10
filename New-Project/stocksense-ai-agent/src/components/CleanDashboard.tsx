import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { stockSenseAgent } from '../services/agent';
import { useUserTracking } from '../hooks/useUserTracking';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useGuidedTour, TOURS } from '../hooks/useGuidedTour';
import { useCustomLayout } from '../hooks/useCustomLayout';
import { useADHDFeatures } from '../hooks/useADHDFeatures';
import { useTheme, THEMES, ThemeProvider } from '../contexts/ThemeContext';
import { ThemeSelector } from './ThemeSelector';
import { CleanStockCard } from './CleanStockCard';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { GuidedTourOverlay } from './GuidedTourOverlay';
import { LayoutCustomizer } from './LayoutCustomizer';
import { ADHDFeaturesPanel } from './ADHDFeaturesPanel';
import { QuickDemoPanel } from './QuickDemoPanel';
import { RealTimeClock } from './RealTimeClock';
import { IndustrySelector } from './IndustrySelector';
import { STOCK_DATABASE, searchStocks, getAllSectors } from '../data/stockData';
import {
  type AgentAction,
  type StockData,
  UIChangePayload,
  type ModeSwitchPayload,
  type NotificationPayload,
} from '../types';
import {
  Brain,
  Search,
  AlertTriangle,
  Zap,
  Settings,
  Eye,
  Activity,
  ChevronDown,
  ChevronUp,
  Shuffle,
  Filter,
  Users,
  Target,
  Keyboard,
  Layout,
  MapPin,
  Timer,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

interface DashboardState {
  mode: 'beginner' | 'intermediate' | 'advanced';
  alertMessage: string | null;
  stocks: StockData[];
  agentStatus: 'idle' | 'observing' | 'thinking' | 'acting';
  selectedSectors: string[];
  searchQuery: string;
  displayMode: 'featured' | 'search';
}

const CleanDashboardContent: React.FC = () => {
  const { theme } = useTheme();
  const themeClasses = THEMES[theme].classes;

  const [dashboardState, setDashboardState] = useState<DashboardState>({
    mode: 'intermediate',
    alertMessage: null,
    stocks: [],
    agentStatus: 'idle',
    selectedSectors: getAllSectors(),
    searchQuery: '',
    displayMode: 'featured'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [agentThoughts, setAgentThoughts] = useState<string[]>([]);
  const [knowledgeInsights, setKnowledgeInsights] = useState<any>(null);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    'user-profile': false,
    'market-simulator': true,
    'agent-activity-log': true,
    'advanced-controls': true
  });
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showLayoutCustomizer, setShowLayoutCustomizer] = useState(false);
  const [showADHDPanel, setShowADHDPanel] = useState(false);
  const [showQuickDemo, setShowQuickDemo] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState<string[]>(getAllSectors());

  const {
    trackSearch,
    trackClick,
    trackSectionEnter,
    trackSectionLeave,
    getUserProfile,
    getKnowledgeInsights,
    simulateUser,
    resetUserProfile,
    isAnalyzing
  } = useUserTracking();

  // Fixed simulateUser functions to provide visual feedback
  const handleSimulateUser = (level: 'beginner' | 'intermediate' | 'advanced') => {
    console.log(`🎭 Simulating ${level} user`);

    // Update dashboard state immediately
    setDashboardState(prev => ({ ...prev, mode: level }));

    // Add visual feedback
    setAgentThoughts(prev => [
      ...prev.slice(-2),
      `Switched to ${level} mode for demonstration`
    ]);

    // Show alert message
    setDashboardState(prev => ({
      ...prev,
      alertMessage: `Demo: Now showing ${level} user experience`
    }));

    // Call the original simulate function
    simulateUser(level);

    // Auto-clear alert after 3 seconds
    setTimeout(() => {
      setDashboardState(prev => ({ ...prev, alertMessage: null }));
    }, 3000);
  };

  // Layout customization - Fixed to force re-render immediately
  const { isSectionVisible, sections: layoutSections, currentPreset, rerenderTrigger, forceRerender } = useCustomLayout();

  // Force re-render when layout changes - immediate visual update
  const [layoutKey, setLayoutKey] = useState(0);
  useEffect(() => {
    console.log('🎛️ Layout changed:', { currentPreset, visibleSections: layoutSections.filter(s => s.visible).map(s => s.id) });
    setLayoutKey(prev => prev + 1); // Force immediate re-render
  }, [currentPreset, layoutSections, rerenderTrigger]);

  // Guided tour
  const {
    isPlaying: isTourActive,
    getCurrentStep,
    nextStep,
    previousStep,
    skipStep,
    endTour,
    startTour,
    isTourCompleted,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep
  } = useGuidedTour();

  // ADHD Features
  const {
    notifications: adhdNotifications,
    dismissNotification,
    isSessionActive: hasFocusSession
  } = useADHDFeatures();

  // Subscribe to agent actions
  useEffect(() => {
    const handleAgentAction = (action: AgentAction) => {
      console.log('🎬 Dashboard received action:', action);

      switch (action.type) {
        case 'mode_switch':
          if (action.target === 'interface') {
            const payload = action.payload as ModeSwitchPayload;
            setDashboardState((prev) => ({
              ...prev,
              mode: payload.mode,
            }));

            setAgentThoughts((prev) => [
              ...prev.slice(-2),
              `Switched to ${payload.mode} mode based on your expertise`,
            ]);
          }
          break;

        case 'notification':
          {
            const payload = action.payload as NotificationPayload;
            setDashboardState((prev) => ({
              ...prev,
              alertMessage: payload.message,
            }));
          }
          break;
      }
    };

    stockSenseAgent.subscribe(handleAgentAction);
  }, []);

  // Update knowledge insights
  useEffect(() => {
    const updateInsights = () => {
      const insights = getKnowledgeInsights();
      setKnowledgeInsights(insights);
    };

    updateInsights();
    const interval = setInterval(updateInsights, 10000); // Less frequent updates

    return () => clearInterval(interval);
  }, [getKnowledgeInsights]);

  // Auto-start tour for beginners (only once)
  useEffect(() => {
    if (isTourActive) return; // Don't start if tour is already active

    const userProfile = getUserProfile();
    const hasSeenTour = localStorage.getItem('stocksense_has_seen_welcome_tour');

    if (userProfile?.expertiseLevel === 'beginner' && !hasSeenTour && !isTourCompleted('beginner-onboarding')) {
      localStorage.setItem('stocksense_has_seen_welcome_tour', 'true');
      setTimeout(() => {
        if (!isTourActive) { // Double check tour isn't already running
          startTour(TOURS.beginner);
        }
      }, 1500); // Start tour after 1.5 seconds
    }
  }, [getUserProfile, isTourCompleted, startTour, isTourActive]);

  // Simulate agent status changes (simplified)
  useEffect(() => {
    if (!isAgentActive) return;

    const statusCycle = setInterval(() => {
      setDashboardState((prev) => {
        const statuses: typeof prev.agentStatus[] = ['observing', 'thinking', 'acting'];
        const currentIndex = statuses.indexOf(prev.agentStatus);
        const nextIndex = (currentIndex + 1) % statuses.length;
        return { ...prev, agentStatus: statuses[nextIndex] };
      });
    }, 3000); // Slower cycle

    return () => clearInterval(statusCycle);
  }, [isAgentActive]);

  // Load featured stocks with sector filtering
  useEffect(() => {
    const loadStocks = () => {
      let stocks: StockData[] = [];

      if (dashboardState.displayMode === 'search' && dashboardState.searchQuery) {
        stocks = searchStocks(dashboardState.searchQuery);
      } else {
        // Featured stocks: simpler selection
        stocks = [
          ...STOCK_DATABASE.filter(s => ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'AMZN'].includes(s.symbol)),
          ...STOCK_DATABASE.filter(s => ['JPM', 'JNJ', 'UNH'].includes(s.symbol)),
        ].slice(0, 9); // Show fewer stocks to reduce clutter
      }

      // Filter by selected sectors for intermediate/advanced users
      if ((dashboardState.mode === 'intermediate' || dashboardState.mode === 'advanced') && selectedSectors.length > 0 && selectedSectors.length < getAllSectors().length) {
        stocks = stocks.filter(stock => selectedSectors.includes(stock.sector));
        console.log('🏭 Filtered stocks by sectors:', selectedSectors, 'Result:', stocks.length, 'stocks');
      }

      setDashboardState(prev => ({ ...prev, stocks }));
    };

    loadStocks();
  }, [dashboardState.displayMode, dashboardState.searchQuery, selectedSectors, dashboardState.mode]);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (searchTerm.trim()) {
        trackClick('search', 'header');

        setDashboardState(prev => ({
          ...prev,
          searchQuery: searchTerm.trim(),
          displayMode: 'search'
        }));

        const analysisResult = await trackSearch(searchTerm.trim());

        if (isAgentActive && analysisResult) {
          setAgentThoughts((prev) => [
            ...prev.slice(-1),
            `Analyzed "${searchTerm}" - Level: ${analysisResult.knowledgeAssessment.level}`,
          ]);

          if (analysisResult.knowledgeAssessment.level !== dashboardState.mode) {
            setDashboardState(prev => ({
              ...prev,
              mode: analysisResult.knowledgeAssessment.level,
            }));
          }
        }

        setSearchTerm('');
      }
    },
    [searchTerm, trackSearch, trackClick, isAgentActive, dashboardState.mode]
  );

  const toggleAgent = useCallback(() => {
    if (isAgentActive) {
      stockSenseAgent.stop();
      setIsAgentActive(false);
      setDashboardState((prev) => ({ ...prev, agentStatus: 'idle' }));
      setAgentThoughts([]);
    } else {
      stockSenseAgent.start();
      setIsAgentActive(true);
      setAgentThoughts(['AI Agent activated']);
    }
  }, [isAgentActive]);

  const handleRandomizeStocks = useCallback(() => {
    const randomStocks = [...STOCK_DATABASE]
      .sort(() => 0.5 - Math.random())
      .slice(0, 9);

    setDashboardState(prev => ({
      ...prev,
      stocks: randomStocks,
      displayMode: 'featured'
    }));

    trackClick('randomize', 'controls');
  }, [trackClick]);

  const clearSearch = useCallback(() => {
    setDashboardState(prev => ({
      ...prev,
      searchQuery: '',
      displayMode: 'featured'
    }));
  }, []);

  const toggleSectionCollapse = useCallback((sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  // Keyboard navigation - defined after functions it references
  const {
    shortcuts,
    helpVisible,
    announceToScreenReader,
    focusSearchBar
  } = useKeyboardNavigation({
    onToggleHelp: () => setShowKeyboardHelp(!showKeyboardHelp),
    onToggleAgent: toggleAgent,
    onSearch: () => {
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    },
    onRandomize: handleRandomizeStocks,
    onEscape: () => {
      if (showKeyboardHelp) setShowKeyboardHelp(false);
      else if (showLayoutCustomizer) setShowLayoutCustomizer(false);
      else if (showADHDPanel) setShowADHDPanel(false);
      else if (showQuickDemo) setShowQuickDemo(false);
      else if (isTourActive) endTour();
      else clearSearch();
    },
    onSimulateBeginner: () => simulateUser('beginner'),
    onSimulateIntermediate: () => simulateUser('intermediate'),
    onSimulateAdvanced: () => simulateUser('advanced')
  });

  const getModeIndicator = () => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-blue-100 text-blue-800 border-blue-200',
      advanced: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[dashboardState.mode];
  };

  const getAgentStatusIcon = () => {
    switch (dashboardState.agentStatus) {
      case 'observing':
        return <Eye size={16} className="animate-pulse text-blue-600" />;
      case 'thinking':
        return <Brain size={16} className="animate-pulse text-purple-600" />;
      case 'acting':
        return <Zap size={16} className="animate-pulse text-green-600" />;
      default:
        return <Activity size={16} className="text-gray-400" />;
    }
  };

  return (
    <React.Fragment>
      <div className={`min-h-screen ${themeClasses.background} transition-colors duration-300`}>
        {/* Simplified Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            {/* Main Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <img
                    src="/stocksense-logo.svg"
                    alt="StockSense Logo"
                    className="w-12 h-12"
                  />
                  <div>
                    <h1 className={`text-4xl font-bold ${themeClasses.text}`}>StockSense</h1>
                    <p className={`text-lg ${themeClasses.textSecondary}`}>AI-Powered Stock Analysis</p>
                  </div>
                </div>

                {/* Real-time Clock - More prominent */}
                <div className="hidden lg:block">
                  <RealTimeClock
                    className={`p-4 ${themeClasses.card} rounded-xl shadow-sm border`}
                    format="12h"
                    showDate={true}
                    showTimezone={true}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Mobile Real-time Clock */}
                <div className="lg:hidden">
                  <RealTimeClock
                    className={`p-3 ${themeClasses.card} rounded-lg border`}
                    format="12h"
                    showDate={false}
                    showTimezone={false}
                  />
                </div>

                {/* Tools Section */}
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600 font-medium hidden sm:block">Tools:</span>

                  {/* ADHD Focus Timer */}
                  {isSectionVisible('adhd-features') && (
                    <button
                      onClick={() => setShowADHDPanel(true)}
                      data-tour="adhd-features"
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md border transition-colors text-sm ${
                        hasFocusSession
                          ? 'border-green-300 bg-green-50 text-green-700'
                          : `${themeClasses.border} hover:border-blue-300`
                      }`}
                      title="Focus Timer & Break Reminders"
                    >
                      <Timer size={14} />
                      <span className="hidden md:inline">Focus</span>
                      {hasFocusSession && <span className="text-xs">●</span>}
                    </button>
                  )}

                  {/* Layout Customizer */}
                  <button
                    onClick={() => setShowLayoutCustomizer(true)}
                    data-tour="layout-customizer"
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md border ${themeClasses.border} hover:border-blue-300 transition-colors text-sm`}
                    title="Customize Dashboard Layout"
                  >
                    <Layout size={14} />
                    <span className="hidden md:inline">Layout</span>
                  </button>

                  {/* Keyboard Shortcuts */}
                  <button
                    onClick={() => setShowKeyboardHelp(true)}
                    data-tour="keyboard-help"
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md border ${themeClasses.border} hover:border-blue-300 transition-colors text-sm`}
                    title="Keyboard Shortcuts (Press H)"
                  >
                    <Keyboard size={14} />
                    <span className="hidden md:inline">Keys</span>
                  </button>

                  {/* API Demo */}
                  <button
                    onClick={() => setShowQuickDemo(true)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md border ${themeClasses.border} hover:border-blue-300 transition-colors text-sm`}
                    title="Real Financial Data Demo"
                  >
                    <Zap size={14} />
                    <span className="hidden sm:inline">Demo</span>
                  </button>

                  {/* Guided Tour */}
                  {!isTourActive && (
                    <button
                      onClick={() => startTour(TOURS.beginner)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md border ${themeClasses.border} hover:border-blue-300 transition-colors text-sm`}
                      title="Interactive Tutorial"
                    >
                      <MapPin size={14} />
                      <span className="hidden md:inline">Tour</span>
                    </button>
                  )}
                </div>

                {/* Status Section */}
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600 font-medium hidden sm:block">Status:</span>

                  {/* User Level */}
                  {isSectionVisible('user-level-indicator') && (
                    <div
                      className={`px-3 py-1.5 rounded-md border ${getModeIndicator()} text-sm font-medium`}
                      data-tour="user-level"
                      title="Your experience level determines content complexity"
                    >
                      {dashboardState.mode.toUpperCase()}
                    </div>
                  )}

                  {/* Theme Selector */}
                  {isSectionVisible('theme-selector') && (
                    <div data-tour="theme-selector" title="Change visual theme">
                      <ThemeSelector />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Search Section */}
            {isSectionVisible('search-bar') && (
              <div className="mb-8" data-tour="search">
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={
                        dashboardState.mode === 'beginner'
                          ? "Search for companies like Apple or Tesla..."
                          : "Search stocks or financial terms..."
                      }
                      className={`w-full pl-12 pr-6 py-4 text-lg ${themeClasses.card} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      onFocus={() => trackSectionEnter('search')}
                      onBlur={() => trackSectionLeave('search')}
                    />
                    {isAnalyzing && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                      </div>
                    )}
                  </div>
                </form>

                {/* Beginner Quick Summary */}
                {dashboardState.mode === 'beginner' && !dashboardState.searchQuery && (
                  <div className="max-w-4xl mx-auto mt-6">
                    <div className={`${themeClasses.card} rounded-xl p-6 border-l-4 border-green-500`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Lightbulb size={20} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${themeClasses.text} mb-3`}>
                            🌟 New to Stock Investing? Here's What You Need to Know
                          </h3>
                          <div className="space-y-3 text-base">
                            <p className={themeClasses.text}>
                              <strong>Stock investing</strong> means buying small pieces of companies that you think will grow and become more valuable over time.
                              Our AI analyzes thousands of data points to help you make smarter decisions by showing you which companies have good potential.
                              Start by learning about a few companies you know and use in daily life - this makes investing less scary and more relatable.
                            </p>

                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <TrendingUp size={16} />
                                📊 Top 3 Beginner-Friendly Stocks to Focus On Right Now:
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🍎</span>
                                  <div>
                                    <span className="font-medium text-blue-900">Apple (AAPL)</span>
                                    <span className="text-blue-700 ml-2">- Makes iPhones, stable company with loyal customers</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🏥</span>
                                  <div>
                                    <span className="font-medium text-blue-900">Johnson & Johnson (JNJ)</span>
                                    <span className="text-blue-700 ml-2">- Healthcare giant, makes medicines people always need</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">💻</span>
                                  <div>
                                    <span className="font-medium text-blue-900">Microsoft (MSFT)</span>
                                    <span className="text-blue-700 ml-2">- Software leader, consistent profits and growth</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search Results Info */}
                {dashboardState.searchQuery && (
                  <div className="max-w-2xl mx-auto mt-4">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${themeClasses.textSecondary}`}>
                        Found {dashboardState.stocks.length} results for "{dashboardState.searchQuery}"
                      </p>
                      <button
                        onClick={clearSearch}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Clear search
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ADHD Notifications */}
            {adhdNotifications.length > 0 && (
              <div className="max-w-4xl mx-auto mb-6">
                {adhdNotifications.map((notification, index) => (
                  <div key={`adhd-${index}`} className="mb-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Timer size={16} className="text-blue-600" />
                        <span className="text-blue-800 font-medium text-sm">{notification}</span>
                      </div>
                      <button
                        onClick={() => dismissNotification(notification)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AI Knowledge Insights - Only show if available and not too cluttered */}
            {isSectionVisible('ai-insights') && knowledgeInsights && knowledgeInsights.confidence > 0.6 && (
              <div className="max-w-4xl mx-auto mb-8">
                <div className={`${themeClasses.card} rounded-xl p-6`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="text-blue-600" size={20} />
                    <span className={`font-semibold ${themeClasses.text}`}>AI Analysis</span>
                    <span className="text-sm text-blue-600">
                      {(knowledgeInsights.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <p className={`text-sm ${themeClasses.textSecondary} mb-3`}>
                    {knowledgeInsights.searchPattern}
                  </p>
                  {knowledgeInsights.recommendations && knowledgeInsights.recommendations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {knowledgeInsights.recommendations.slice(0, 2).map((rec: string, index: number) => (
                        <span key={`rec-${index}`} className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm">
                          {rec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Alert Message */}
            {dashboardState.alertMessage && (
              <div className="max-w-4xl mx-auto mb-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="text-yellow-600 mr-3" size={20} />
                    <span className="text-yellow-800 font-medium">{dashboardState.alertMessage}</span>
                    <button
                      onClick={() => setDashboardState((prev) => ({ ...prev, alertMessage: null }))}
                      className="ml-auto text-yellow-600 hover:text-yellow-800"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Stock Cards - Main Content */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className={`text-2xl font-semibold ${themeClasses.text}`} data-tour="stocks-header">
                      {dashboardState.displayMode === 'search' ? 'Search Results' : 'Featured Stocks'}
                    </h2>
                    {/* Sector filtering indicator */}
                    {(dashboardState.mode === 'intermediate' || dashboardState.mode === 'advanced') &&
                     selectedSectors.length > 0 && selectedSectors.length < getAllSectors().length && (
                      <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>
                        Filtered by {selectedSectors.length} selected sector{selectedSectors.length !== 1 ? 's' : ''}: {selectedSectors.slice(0, 3).join(', ')}{selectedSectors.length > 3 ? '...' : ''}
                      </p>
                    )}
                  </div>

                  {isSectionVisible('quick-controls') && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleRandomizeStocks}
                        data-tour="discover-button"
                        className={`flex items-center gap-2 px-4 py-2 ${themeClasses.button} rounded-lg transition-colors`}
                      >
                        <Shuffle size={16} />
                        <span>Discover</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Stock Grid - Cleaner spacing */}
                {dashboardState.stocks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" data-tour="stock-cards">
                    {dashboardState.stocks.map((stock, index) => (
                      <div key={stock.symbol} data-testid={`stock-card-${stock.symbol}`}>
                        <CleanStockCard
                          stock={stock}
                          userLevel={dashboardState.mode}
                          onClick={() => trackClick('stock-card', 'stocks')}
                          onMouseEnter={() => trackSectionEnter(`stock-${stock.symbol}`)}
                          onMouseLeave={() => trackSectionLeave(`stock-${stock.symbol}`)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Search size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className={`text-lg font-medium ${themeClasses.text} mb-2`}>
                      {dashboardState.displayMode === 'search' ? 'No stocks found' :
                       (selectedSectors.length > 0 && selectedSectors.length < getAllSectors().length) ?
                       'No stocks in selected sectors' : 'No stocks found'}
                    </h3>
                    <p className={`${themeClasses.textSecondary} mb-6`}>
                      {dashboardState.displayMode === 'search' ?
                       'Try searching for different keywords or companies.' :
                       (selectedSectors.length > 0 && selectedSectors.length < getAllSectors().length) ?
                       'The selected industry sectors don\'t have featured stocks. Try selecting more sectors or clear the filter.' :
                       'Try searching for different keywords or companies.'}
                    </p>
                    <div className="flex gap-3 justify-center">
                      {dashboardState.displayMode === 'search' ? (
                        <button
                          onClick={clearSearch}
                          className={`${themeClasses.button} px-6 py-3 rounded-lg transition-colors`}
                        >
                          Show Featured Stocks
                        </button>
                      ) : (selectedSectors.length > 0 && selectedSectors.length < getAllSectors().length) ? (
                        <button
                          onClick={() => setSelectedSectors(getAllSectors())}
                          className={`${themeClasses.button} px-6 py-3 rounded-lg transition-colors`}
                        >
                          Clear Sector Filter
                        </button>
                      ) : (
                        <button
                          onClick={clearSearch}
                          className={`${themeClasses.button} px-6 py-3 rounded-lg transition-colors`}
                        >
                          Show Featured Stocks
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Organized */}
              <div className="space-y-4">
                {/* AI Agent Control */}
                {isSectionVisible('ai-agent-status') && (
                  <div className={`${themeClasses.card} rounded-xl overflow-hidden`} data-tour="ai-agent" key={`agent-${layoutKey}`}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`text-lg font-semibold ${themeClasses.text}`}>🤖 AI Assistant</h3>
                        <button
                          onClick={toggleAgent}
                          data-testid="agent-toggle"
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                            isAgentActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {getAgentStatusIcon()}
                          <span>{isAgentActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </div>

                      {isAgentActive && (
                        <div data-tour="agent-status" className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              dashboardState.agentStatus === 'observing' ? 'bg-blue-500' :
                              dashboardState.agentStatus === 'thinking' ? 'bg-purple-500' :
                              dashboardState.agentStatus === 'acting' ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                            <p className={`text-sm ${themeClasses.textSecondary}`}>
                              {dashboardState.agentStatus.charAt(0).toUpperCase() + dashboardState.agentStatus.slice(1)}
                            </p>
                          </div>

                          {agentThoughts.length > 0 && (
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {agentThoughts.slice(-3).map((thought, index) => (
                                <div
                                  key={`thought-${index}-${thought.slice(0, 10)}`}
                                  className="text-xs bg-blue-50 text-blue-800 p-2 rounded border-l-2 border-blue-400"
                                >
                                  💭 {thought}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* User Profile - Simplified */}
                {isSectionVisible('user-profile') && (
                  <div className={`${themeClasses.card} rounded-xl overflow-hidden`} key={`profile-${layoutKey}`}>
                    <div className="p-4">
                      <button
                        onClick={() => toggleSectionCollapse('user-profile')}
                        className="flex items-center justify-between w-full mb-3"
                      >
                        <div className="flex items-center gap-2">
                          <Target size={18} className="text-blue-600" />
                          <h3 className={`text-lg font-semibold ${themeClasses.text}`}>👤 Your Profile</h3>
                        </div>
                        {collapsedSections['user-profile'] ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      </button>

                      {!collapsedSections['user-profile'] && (
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className={themeClasses.textSecondary}>Experience:</span>
                            <span className={`font-medium ${themeClasses.text}`}>{dashboardState.mode}</span>
                          </div>

                          {knowledgeInsights && (
                            <div className="flex justify-between">
                              <span className={themeClasses.textSecondary}>AI Confidence:</span>
                              <span className={`font-medium ${themeClasses.text}`}>
                                {(knowledgeInsights.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}

                          <div className="pt-3 border-t border-gray-100 space-y-3">
                            <div>
                              <p className={`text-xs ${themeClasses.textSecondary} mb-2`}>Quick demo:</p>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleSimulateUser('beginner')}
                                  className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                                  title="Experience StockSense as a beginner investor"
                                >
                                  Beginner
                                </button>
                                <button
                                  onClick={() => handleSimulateUser('intermediate')}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                                  title="Experience StockSense as an intermediate investor"
                                >
                                  Intermediate
                                </button>
                                <button
                                  onClick={() => handleSimulateUser('advanced')}
                                  className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors"
                                  title="Experience StockSense as an advanced investor"
                                >
                                  Advanced
                                </button>
                              </div>
                            </div>

                            {/* Industry Selector for Intermediate/Advanced Users - Enhanced */}
                            {(dashboardState.mode === 'intermediate' || dashboardState.mode === 'advanced') && (
                              <div className="pt-3 border-t border-gray-100">
                                <IndustrySelector
                                  selectedSectors={selectedSectors}
                                  onSectorChange={(sectors) => {
                                    setSelectedSectors(sectors);
                                    // Update dashboard state to filter stocks
                                    setDashboardState(prev => ({
                                      ...prev,
                                      selectedSectors: sectors
                                    }));
                                    console.log('🏭 Sectors updated:', sectors);
                                  }}
                                  userLevel={dashboardState.mode}
                                  className="text-xs"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Market Simulator */}
                {isSectionVisible('market-simulator') && (
                  <div className={`${themeClasses.card} rounded-xl overflow-hidden`} data-tour="market-simulator" key={`simulator-${layoutKey}`}>
                    <div className="p-4">
                      <button
                        onClick={() => toggleSectionCollapse('market-simulator')}
                        className="flex items-center justify-between w-full mb-3"
                      >
                        <div className="flex items-center gap-2">
                          <Activity size={18} className="text-green-600" />
                          <h3 className={`text-lg font-semibold ${themeClasses.text}`}>📊 Market Simulator</h3>
                        </div>
                        {collapsedSections['market-simulator'] ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      </button>

                      {!collapsedSections['market-simulator'] && (
                        <div className="space-y-4">
                          <p className={`text-sm ${themeClasses.textSecondary} mb-3`}>
                            Simulate different market conditions to see how the AI agent adapts its analysis and recommendations.
                          </p>

                          <div className="grid grid-cols-1 gap-3">
                            <button
                              onClick={() => {
                                console.log('🐂 Bull market simulation triggered');
                                handleSimulateUser('beginner');
                                setAgentThoughts(prev => [
                                  ...prev.slice(-1),
                                  'Bull Market: Optimistic sentiment detected. Focusing on growth opportunities and momentum indicators.',
                                ]);
                              }}
                              className="p-3 text-left bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                              title="Simulates rising market with positive sentiment"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">📈</span>
                                <span className="font-medium">Bull Market Scenario</span>
                              </div>
                              <p className="text-xs opacity-75">
                                Rising prices, high confidence, growth-focused analysis
                              </p>
                            </button>

                            <button
                              onClick={() => {
                                console.log('📊 Sideways market simulation triggered');
                                handleSimulateUser('intermediate');
                                setAgentThoughts(prev => [
                                  ...prev.slice(-1),
                                  'Sideways Market: Neutral sentiment. Emphasizing value plays and range-bound strategies.',
                                ]);
                              }}
                              className="p-3 text-left bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                              title="Simulates flat market with mixed signals"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">📊</span>
                                <span className="font-medium">Sideways Market</span>
                              </div>
                              <p className="text-xs opacity-75">
                                Range-bound trading, mixed signals, value-focused
                              </p>
                            </button>

                            <button
                              onClick={() => {
                                console.log('🐻 Bear market simulation triggered');
                                handleSimulateUser('advanced');
                                setAgentThoughts(prev => [
                                  ...prev.slice(-1),
                                  'Bear Market: Defensive mode activated. Prioritizing risk management and quality fundamentals.',
                                ]);
                              }}
                              className="p-3 text-left bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                              title="Simulates declining market with defensive focus"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">📉</span>
                                <span className="font-medium">Bear Market Scenario</span>
                              </div>
                              <p className="text-xs opacity-75">
                                Declining prices, risk-off sentiment, defensive strategies
                              </p>
                            </button>
                          </div>

                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className={`text-xs ${themeClasses.textSecondary}`}>
                              💡 Each scenario changes the AI's analysis style, risk assessment, and stock recommendations to match market conditions.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Agent Activity Log */}
                {isSectionVisible('agent-activity-log') && (
                  <div className={`${themeClasses.card} rounded-xl p-6`} data-tour="agent-activity-log" key={`activity-${layoutKey}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <Eye size={20} className="text-purple-600" />
                      <h3 className={`text-lg font-semibold ${themeClasses.text}`}>Agent Activity Log</h3>
                    </div>

                    <div className="space-y-2">
                      {agentThoughts.length > 0 ? (
                        agentThoughts.map((thought, index) => (
                          <div
                            key={`activity-${index}-${thought.slice(0, 10)}`}
                            className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-500"
                          >
                            <span className="text-gray-500">
                              {new Date().toLocaleTimeString()} -
                            </span>
                            <span className={`ml-1 ${themeClasses.text}`}>{thought}</span>
                          </div>
                        ))
                      ) : (
                        <p className={`text-sm ${themeClasses.textSecondary} italic`}>
                          No recent agent activity. Activate the AI agent to see logs.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Advanced Controls */}
                {isSectionVisible('advanced-controls') && (
                  <div className={`${themeClasses.card} rounded-xl p-6`} data-tour="advanced-controls" key={`controls-${layoutKey}`}>
                    <button
                      onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                      className={`flex items-center gap-2 text-sm ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
                    >
                      <Settings size={16} />
                      <span>Advanced Options</span>
                      {showAdvancedControls ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showAdvancedControls && (
                      <div className="mt-4 space-y-3">
                        <div className="text-xs space-y-2">
                          <div className="flex justify-between">
                            <span className={themeClasses.textSecondary}>Total Stocks:</span>
                            <span className={themeClasses.text}>{STOCK_DATABASE.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={themeClasses.textSecondary}>Sectors:</span>
                            <span className={themeClasses.text}>{getAllSectors().length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={themeClasses.textSecondary}>Agent Status:</span>
                            <span className={themeClasses.text}>{dashboardState.agentStatus}</span>
                          </div>
                        </div>

                        <button
                          onClick={resetUserProfile}
                          className="w-full text-xs text-red-600 hover:text-red-800 underline"
                        >
                          Reset All Data
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add main content ID for skip link */}
          <div id="main-content" />
        </div>
      </div>

      {/* Modal Components */}
      <KeyboardShortcutsHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
        shortcuts={shortcuts}
      />

      <GuidedTourOverlay
        currentStep={getCurrentStep()}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onNext={nextStep}
        onPrevious={previousStep}
        onSkip={skipStep}
        onEnd={endTour}
      />

      <LayoutCustomizer
        isOpen={showLayoutCustomizer}
        onClose={() => setShowLayoutCustomizer(false)}
      />

      <ADHDFeaturesPanel
        isOpen={showADHDPanel}
        onClose={() => setShowADHDPanel(false)}
      />

      <QuickDemoPanel
        isOpen={showQuickDemo}
        onClose={() => setShowQuickDemo(false)}
        userLevel={dashboardState.mode}
        onUserLevelChange={(level) => setDashboardState(prev => ({ ...prev, mode: level }))}
      />
    </React.Fragment>
  );
};

export const CleanDashboard: React.FC = () => {
  return (
    <ThemeProvider>
      <CleanDashboardContent />
    </ThemeProvider>
  );
};
