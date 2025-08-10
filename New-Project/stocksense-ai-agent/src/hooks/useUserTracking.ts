import { useCallback, useEffect, useRef, useState } from 'react';
import type { UserProfile, ClickEvent } from '../types';
import { searchAnalysisService } from '../services/searchAnalysisService';

export const useUserTracking = () => {
  const startTimeRef = useRef<{ [key: string]: number }>({});
  const userProfileRef = useRef<UserProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load user profile from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('stocksense_user_profile');
    if (stored) {
      userProfileRef.current = JSON.parse(stored);
    } else {
      // Create new user profile
      userProfileRef.current = {
        id: `user_${Date.now()}`,
        expertiseLevel: 'beginner',
        searchHistory: [],
        clickPatterns: [],
        timeSpentOnSections: {},
        preferredSectors: [],
        lastActive: new Date()
      };
      saveUserProfile();
    }
  }, []);

  const saveUserProfile = useCallback(() => {
    if (userProfileRef.current) {
      localStorage.setItem('stocksense_user_profile', JSON.stringify(userProfileRef.current));
    }
  }, []);

  // Enhanced search tracking with AI analysis
  const trackSearch = useCallback(async (query: string) => {
    if (!userProfileRef.current) return;

    setIsAnalyzing(true);

    try {
      // Add to search history
      userProfileRef.current.searchHistory.push(query);

      // Keep only last 50 searches
      if (userProfileRef.current.searchHistory.length > 50) {
        userProfileRef.current.searchHistory = userProfileRef.current.searchHistory.slice(-50);
      }

      console.log('🔍 Analyzing search term:', query);

      // Analyze search term using AI service
      const analysisResult = await searchAnalysisService.analyzeSearchTerm(query);

      // Update expertise level based on AI analysis
      const knowledgeAssessment = searchAnalysisService.getUserKnowledgeAssessment();

      // Update user profile with AI insights
      userProfileRef.current.expertiseLevel = knowledgeAssessment.level;

      // Extract preferred sectors from search patterns
      updatePreferredSectors(query, analysisResult.relatedConcepts);

      saveUserProfile();

      console.log('🧠 AI Knowledge Assessment:', {
        level: knowledgeAssessment.level,
        confidence: knowledgeAssessment.confidence,
        pattern: knowledgeAssessment.searchPattern,
        recommendations: knowledgeAssessment.recommendations
      });

      // Return analysis for immediate use
      return {
        analysisResult,
        knowledgeAssessment
      };

    } catch (error) {
      console.error('Search analysis error:', error);

      // Fallback to basic analysis
      updateExpertiseLevelBasic(query);
      saveUserProfile();

    } finally {
      setIsAnalyzing(false);
    }
  }, [saveUserProfile]);

  // Update preferred sectors based on search analysis
  const updatePreferredSectors = useCallback((query: string, relatedConcepts: string[]) => {
    if (!userProfileRef.current) return;

    const sectorKeywords = {
      'Technology': ['tech', 'software', 'ai', 'artificial intelligence', 'cloud', 'saas', 'semiconductor', 'apple', 'microsoft', 'google', 'nvidia'],
      'Healthcare': ['pharma', 'biotech', 'medical', 'health', 'drug', 'vaccine', 'hospital'],
      'Finance': ['bank', 'insurance', 'financial services', 'fintech', 'payment', 'credit'],
      'Energy': ['oil', 'gas', 'renewable', 'solar', 'wind', 'energy', 'exxon', 'chevron'],
      'Consumer': ['retail', 'consumer goods', 'amazon', 'walmart', 'nike', 'coca cola'],
      'Real Estate': ['reit', 'real estate', 'property', 'housing', 'commercial real estate'],
      'Automotive': ['auto', 'car', 'electric vehicle', 'tesla', 'ford', 'gm']
    };

    const queryLower = query.toLowerCase();
    const allConcepts = [queryLower, ...relatedConcepts.map(c => c.toLowerCase())];

    Object.entries(sectorKeywords).forEach(([sector, keywords]) => {
      const hasMatch = keywords.some(keyword =>
        allConcepts.some(concept => concept.includes(keyword))
      );

      if (hasMatch && !userProfileRef.current!.preferredSectors.includes(sector)) {
        userProfileRef.current!.preferredSectors.push(sector);

        // Keep only top 5 sectors
        if (userProfileRef.current!.preferredSectors.length > 5) {
          userProfileRef.current!.preferredSectors = userProfileRef.current!.preferredSectors.slice(-5);
        }
      }
    });
  }, []);

  // Fallback basic expertise level update
  const updateExpertiseLevelBasic = useCallback((searchTerm: string) => {
    if (!userProfileRef.current) return;

    const advancedTerms = [
      'vix', 'volatility', 'beta', 'sharpe ratio', 'options', 'derivatives',
      'futures', 'margin', 'leverage', 'arbitrage', 'hedge', 'alpha',
      'correlation', 'standard deviation', 'technical analysis', 'fibonacci'
    ];

    const intermediateTerms = [
      'pe ratio', 'earnings', 'dividend', 'market cap', 'volume',
      'resistance', 'support', 'trend', 'bullish', 'bearish',
      'rsi', 'moving average', 'macd', 'candlestick'
    ];

    const beginnerTerms = [
      'stock price', 'buy', 'sell', 'profit', 'loss', 'share',
      'company', 'investment', 'portfolio', 'broker'
    ];

    const term = searchTerm.toLowerCase();
    let newLevel = userProfileRef.current.expertiseLevel;

    if (advancedTerms.some(t => term.includes(t))) {
      newLevel = 'advanced';
    } else if (intermediateTerms.some(t => term.includes(t)) && newLevel === 'beginner') {
      newLevel = 'intermediate';
    } else if (beginnerTerms.some(t => term.includes(t)) && newLevel === 'advanced') {
      // Don't downgrade from advanced to beginner for basic searches
      // They might be helping someone else or doing research
    }

    if (newLevel !== userProfileRef.current.expertiseLevel) {
      userProfileRef.current.expertiseLevel = newLevel;
      console.log('📈 Expertise level updated to:', newLevel);
    }
  }, []);

  // Track clicks and interactions
  const trackClick = useCallback((element: string, section: string) => {
    if (!userProfileRef.current) return;

    const clickEvent: ClickEvent = {
      timestamp: new Date(),
      element,
      section,
      duration: 0 // Will be updated when leaving the element
    };

    userProfileRef.current.clickPatterns.push(clickEvent);

    // Keep only last 100 clicks
    if (userProfileRef.current.clickPatterns.length > 100) {
      userProfileRef.current.clickPatterns = userProfileRef.current.clickPatterns.slice(-100);
    }

    saveUserProfile();
    console.log('👆 Click tracked:', element, 'in', section);
  }, [saveUserProfile]);

  // Track time spent on sections
  const trackSectionEnter = useCallback((section: string) => {
    startTimeRef.current[section] = Date.now();
    console.log('⏱️ Section entered:', section);
  }, []);

  const trackSectionLeave = useCallback((section: string) => {
    if (!userProfileRef.current) return;

    const startTime = startTimeRef.current[section];
    if (startTime) {
      const timeSpent = Date.now() - startTime;
      userProfileRef.current.timeSpentOnSections[section] =
        (userProfileRef.current.timeSpentOnSections[section] || 0) + timeSpent;

      delete startTimeRef.current[section];
      saveUserProfile();
      console.log('⏱️ Section left:', section, 'Time spent:', `${timeSpent}ms`);
    }
  }, [saveUserProfile]);

  // Get current user profile
  const getUserProfile = useCallback((): UserProfile | null => {
    return userProfileRef.current;
  }, []);

  // Get AI knowledge insights
  const getKnowledgeInsights = useCallback(() => {
    return searchAnalysisService.getUserKnowledgeAssessment();
  }, []);

  // Get search analysis history
  const getSearchAnalysisHistory = useCallback(() => {
    return searchAnalysisService.getSearchHistory();
  }, []);

  // Reset user profile (for demo purposes)
  const resetUserProfile = useCallback(() => {
    userProfileRef.current = {
      id: `user_${Date.now()}`,
      expertiseLevel: 'beginner',
      searchHistory: [],
      clickPatterns: [],
      timeSpentOnSections: {},
      preferredSectors: [],
      lastActive: new Date()
    };

    // Clear search analysis history
    searchAnalysisService.clearHistory();

    saveUserProfile();
    console.log('🔄 User profile and AI analysis reset');
  }, [saveUserProfile]);

  // Simulate different user types for demo with AI-enhanced data
  const simulateUser = useCallback(async (type: 'beginner' | 'intermediate' | 'advanced') => {
    if (!userProfileRef.current) return;

    const demoSearchHistory = {
      beginner: ['AAPL stock price', 'how to buy stocks', 'what is dividend', 'stock market basics', 'investment for beginners'],
      intermediate: ['AAPL PE ratio', 'moving averages', 'RSI indicator', 'earnings report', 'market cap analysis'],
      advanced: ['AAPL options volatility', 'VIX correlation analysis', 'beta coefficient', 'derivatives pricing models', 'quantitative hedge strategies']
    };

    userProfileRef.current.expertiseLevel = type;
    userProfileRef.current.searchHistory = demoSearchHistory[type];

    // Simulate AI analysis for demo searches
    console.log('🎭 Simulating user type:', type);
    setIsAnalyzing(true);

    try {
      // Analyze a few demo searches to build AI knowledge
      const searches = demoSearchHistory[type].slice(0, 3);
      for (const search of searches) {
        await searchAnalysisService.analyzeSearchTerm(search);
      }

      // Get updated assessment
      const assessment = searchAnalysisService.getUserKnowledgeAssessment();
      console.log('🤖 AI Assessment for simulated user:', assessment);

    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsAnalyzing(false);
    }

    saveUserProfile();
  }, [saveUserProfile]);

  return {
    trackSearch,
    trackClick,
    trackSectionEnter,
    trackSectionLeave,
    getUserProfile,
    getKnowledgeInsights,
    getSearchAnalysisHistory,
    resetUserProfile,
    simulateUser,
    isAnalyzing
  };
};
