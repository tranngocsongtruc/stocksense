import { useState, useCallback, useEffect } from 'react';

export interface LayoutSection {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  required?: boolean;
  category: 'main' | 'sidebar' | 'header' | 'footer';
  defaultPosition?: number;
}

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: Record<string, boolean>;
  targetUser: 'beginner' | 'intermediate' | 'advanced' | 'adhd' | 'minimal';
}

const DEFAULT_SECTIONS: LayoutSection[] = [
  // Header sections
  {
    id: 'search-bar',
    name: 'Search Bar',
    description: 'Search for stocks and financial terms',
    visible: true,
    required: true,
    category: 'header',
    defaultPosition: 1
  },
  {
    id: 'user-level-indicator',
    name: 'Experience Level',
    description: 'Shows current user expertise level',
    visible: true,
    category: 'header',
    defaultPosition: 2
  },
  {
    id: 'theme-selector',
    name: 'Theme Selector',
    description: 'Switch between different visual themes',
    visible: true,
    category: 'header',
    defaultPosition: 3
  },
  {
    id: 'adhd-features',
    name: 'ADHD Focus Tools',
    description: 'Focus timer, break reminders, and attention tracking',
    visible: true,
    category: 'header',
    defaultPosition: 4
  },

  // Main content sections
  {
    id: 'ai-insights',
    name: 'AI Knowledge Insights',
    description: 'AI analysis of your search patterns and recommendations',
    visible: true,
    category: 'main',
    defaultPosition: 1
  },
  {
    id: 'stock-cards',
    name: 'Stock Information Cards',
    description: 'Main stock data and sentiment analysis',
    visible: true,
    required: true,
    category: 'main',
    defaultPosition: 2
  },
  {
    id: 'quick-controls',
    name: 'Quick Action Controls',
    description: 'Randomize stocks and other quick actions',
    visible: true,
    category: 'main',
    defaultPosition: 3
  },

  // Sidebar sections
  {
    id: 'ai-agent-status',
    name: 'AI Assistant Status',
    description: 'Current AI agent activity and thoughts',
    visible: true,
    category: 'sidebar',
    defaultPosition: 1
  },
  {
    id: 'user-profile',
    name: 'User Profile',
    description: 'Your expertise level and preferences',
    visible: true,
    category: 'sidebar',
    defaultPosition: 2
  },
  {
    id: 'market-simulator',
    name: 'Market Simulator',
    description: 'Simulate different market conditions',
    visible: true,
    category: 'sidebar',
    defaultPosition: 3
  },
  {
    id: 'advanced-controls',
    name: 'Advanced Settings',
    description: 'Additional configuration options',
    visible: false,
    category: 'sidebar',
    defaultPosition: 4
  },
  {
    id: 'agent-activity-log',
    name: 'Agent Activity Log',
    description: 'Detailed log of AI agent actions',
    visible: false,
    category: 'sidebar',
    defaultPosition: 5
  }
];

const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'full',
    name: 'Full Experience',
    description: 'All features and information visible',
    icon: '🎛️',
    targetUser: 'advanced',
    sections: {
      'search-bar': true,
      'user-level-indicator': true,
      'theme-selector': true,
      'adhd-features': true,
      'ai-insights': true,
      'stock-cards': true,
      'quick-controls': true,
      'ai-agent-status': true,
      'user-profile': true,
      'market-simulator': true,
      'advanced-controls': true,
      'agent-activity-log': true
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Only essential elements for reduced clutter',
    icon: '⚪',
    targetUser: 'adhd',
    sections: {
      'search-bar': true,
      'user-level-indicator': false,
      'theme-selector': true,
      'adhd-features': true,
      'ai-insights': false,
      'stock-cards': true,
      'quick-controls': false,
      'ai-agent-status': true,
      'user-profile': false,
      'market-simulator': false,
      'advanced-controls': false,
      'agent-activity-log': false
    }
  },
  {
    id: 'beginner',
    name: 'Beginner Friendly',
    description: 'Simplified layout with helpful guidance',
    icon: '🌱',
    targetUser: 'beginner',
    sections: {
      'search-bar': true,
      'user-level-indicator': true,
      'theme-selector': false,
      'adhd-features': false,
      'ai-insights': true,
      'stock-cards': true,
      'quick-controls': true,
      'ai-agent-status': true,
      'user-profile': true,
      'market-simulator': false,
      'advanced-controls': false,
      'agent-activity-log': false
    }
  },
  {
    id: 'focus',
    name: 'Focus Mode',
    description: 'Distraction-free stock analysis',
    icon: '🎯',
    targetUser: 'adhd',
    sections: {
      'search-bar': true,
      'user-level-indicator': false,
      'theme-selector': false,
      'adhd-features': true,
      'ai-insights': false,
      'stock-cards': true,
      'quick-controls': false,
      'ai-agent-status': false,
      'user-profile': false,
      'market-simulator': false,
      'advanced-controls': false,
      'agent-activity-log': false
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean layout for serious analysis',
    icon: '💼',
    targetUser: 'intermediate',
    sections: {
      'search-bar': true,
      'user-level-indicator': true,
      'theme-selector': true,
      'adhd-features': true,
      'ai-insights': true,
      'stock-cards': true,
      'quick-controls': true,
      'ai-agent-status': true,
      'user-profile': true,
      'market-simulator': true,
      'advanced-controls': false,
      'agent-activity-log': false
    }
  }
];

export const useCustomLayout = () => {
  const [sections, setSections] = useState<LayoutSection[]>(DEFAULT_SECTIONS);
  const [currentPreset, setCurrentPreset] = useState<string>('professional');
  const [customizations, setCustomizations] = useState<Record<string, any>>({});

  // Load saved layout from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem('stocksense_custom_layout');
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        setSections(parsed.sections || DEFAULT_SECTIONS);
        setCurrentPreset(parsed.preset || 'professional');
        setCustomizations(parsed.customizations || {});
      } catch (error) {
        console.error('Error loading saved layout:', error);
      }
    }
  }, []);

  // Save layout to localStorage
  const saveLayout = useCallback(() => {
    const layoutData = {
      sections,
      preset: currentPreset,
      customizations,
      lastModified: new Date().toISOString()
    };
    localStorage.setItem('stocksense_custom_layout', JSON.stringify(layoutData));
  }, [sections, currentPreset, customizations]);

  // Auto-save when layout changes
  useEffect(() => {
    const timeoutId = setTimeout(saveLayout, 500); // Debounce saves
    return () => clearTimeout(timeoutId);
  }, [sections, currentPreset, customizations, saveLayout]);

  // Force re-render trigger
  const [rerenderTrigger, setRerenderTrigger] = useState(0);
  const forceRerender = useCallback(() => {
    setRerenderTrigger(prev => prev + 1);
  }, []);

  // Toggle section visibility
  const toggleSection = useCallback((sectionId: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId && !section.required
        ? { ...section, visible: !section.visible }
        : section
    ));
    setCurrentPreset('custom');
  }, []);

  // Set section visibility
  const setSectionVisible = useCallback((sectionId: string, visible: boolean) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId && !section.required
        ? { ...section, visible }
        : section
    ));
    setCurrentPreset('custom');
  }, []);

  // Apply layout preset
  const applyPreset = useCallback((presetId: string) => {
    console.log('🎛️ Applying preset:', presetId);
    const preset = LAYOUT_PRESETS.find(p => p.id === presetId);
    if (!preset) {
      console.error('❌ Preset not found:', presetId);
      return;
    }

    console.log('📋 Preset sections:', preset.sections);

    setSections(prev => {
      const newSections = prev.map(section => ({
        ...section,
        visible: preset.sections[section.id] !== false && (section.required || preset.sections[section.id])
      }));
      console.log('📦 New sections state:', newSections.map(s => ({ id: s.id, visible: s.visible })));
      return newSections;
    });
    setCurrentPreset(presetId);
    forceRerender(); // Force component re-render
    console.log('✅ Preset applied:', presetId);
  }, [forceRerender]);

  // Get visible sections by category
  const getVisibleSectionsByCategory = useCallback((category: LayoutSection['category']) => {
    return sections
      .filter(section => section.category === category && section.visible)
      .sort((a, b) => (a.defaultPosition || 0) - (b.defaultPosition || 0));
  }, [sections]);

  // Check if section is visible
  const isSectionVisible = useCallback((sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section?.visible ?? false;
  }, [sections]);

  // Get section by ID
  const getSection = useCallback((sectionId: string) => {
    return sections.find(s => s.id === sectionId);
  }, [sections]);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    setSections(DEFAULT_SECTIONS);
    setCurrentPreset('professional');
    setCustomizations({});
  }, []);

  // Get current preset info
  const getCurrentPreset = useCallback(() => {
    return LAYOUT_PRESETS.find(p => p.id === currentPreset);
  }, [currentPreset]);

  // Get layout stats
  const getLayoutStats = useCallback(() => {
    const total = sections.length;
    const visible = sections.filter(s => s.visible).length;
    const hidden = total - visible;
    const required = sections.filter(s => s.required).length;

    return { total, visible, hidden, required };
  }, [sections]);

  // Get ADHD-friendly recommendations
  const getADHDRecommendations = useCallback(() => {
    const recommendations = [];
    const visibleCount = sections.filter(s => s.visible).length;

    if (visibleCount > 6) {
      recommendations.push({
        type: 'reduce',
        message: 'Consider hiding some sections to reduce visual clutter',
        action: () => applyPreset('minimal')
      });
    }

    if (isSectionVisible('agent-activity-log')) {
      recommendations.push({
        type: 'distraction',
        message: 'Activity log can be distracting. Try focus mode?',
        action: () => applyPreset('focus')
      });
    }

    if (!isSectionVisible('ai-agent-status')) {
      recommendations.push({
        type: 'helpful',
        message: 'AI Assistant can help you stay focused',
        action: () => setSectionVisible('ai-agent-status', true)
      });
    }

    return recommendations;
  }, [sections, isSectionVisible, applyPreset, setSectionVisible]);

  // Export/Import layout configuration
  const exportLayout = useCallback(() => {
    return {
      sections: sections.map(s => ({ id: s.id, visible: s.visible })),
      preset: currentPreset,
      customizations,
      exportedAt: new Date().toISOString()
    };
  }, [sections, currentPreset, customizations]);

  const importLayout = useCallback((layoutConfig: any) => {
    try {
      if (layoutConfig.sections) {
        setSections(prev => prev.map(section => {
          const imported = layoutConfig.sections.find((s: any) => s.id === section.id);
          return imported ? { ...section, visible: imported.visible } : section;
        }));
      }
      if (layoutConfig.preset) {
        setCurrentPreset(layoutConfig.preset);
      }
      if (layoutConfig.customizations) {
        setCustomizations(layoutConfig.customizations);
      }
      return true;
    } catch (error) {
      console.error('Error importing layout:', error);
      return false;
    }
  }, []);

  return {
    sections,
    currentPreset,
    customizations,
    presets: LAYOUT_PRESETS,
    toggleSection,
    setSectionVisible,
    applyPreset,
    getVisibleSectionsByCategory,
    isSectionVisible,
    getSection,
    resetLayout,
    getCurrentPreset,
    getLayoutStats,
    getADHDRecommendations,
    exportLayout,
    importLayout,
    saveLayout,
    rerenderTrigger,
    forceRerender
  };
};

export default useCustomLayout;
