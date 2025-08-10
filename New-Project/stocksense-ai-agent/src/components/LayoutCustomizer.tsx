import type React from 'react';
import { useState } from 'react';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import { useCustomLayout, type LayoutSection, type LayoutPreset } from '../hooks/useCustomLayout';
import {
  Settings,
  Eye,
  EyeOff,
  Layout,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  X,
  BarChart3
} from 'lucide-react';

interface LayoutCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LayoutCustomizer: React.FC<LayoutCustomizerProps> = ({
  isOpen,
  onClose
}) => {
  const { theme } = useTheme();
  const themeClasses = THEMES[theme].classes;
  const [activeTab, setActiveTab] = useState<'presets' | 'sections' | 'recommendations'>('presets');

  const {
    sections,
    currentPreset,
    presets,
    toggleSection,
    applyPreset,
    resetLayout,
    getCurrentPreset,
    getLayoutStats,
    getADHDRecommendations,
    exportLayout,
    importLayout
  } = useCustomLayout();

  if (!isOpen) return null;

  const stats = getLayoutStats();
  const currentPresetInfo = getCurrentPreset();
  const adhdRecommendations = getADHDRecommendations();

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const layoutConfig = JSON.parse(e.target?.result as string);
        if (importLayout(layoutConfig)) {
          alert('Layout imported successfully!');
        } else {
          alert('Error importing layout configuration');
        }
      } catch (error) {
        alert('Invalid layout file');
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const config = exportLayout();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stocksense-layout-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmitLayout = () => {
    // Save current layout
    const layoutData = {
      sections,
      preset: currentPreset,
      lastModified: new Date().toISOString()
    };
    localStorage.setItem('stocksense_custom_layout', JSON.stringify(layoutData));

    // Show confirmation and refresh page
    alert(`Layout "${getCurrentPreset()?.name || currentPreset}" applied successfully! Page will refresh to show your new layout.`);
    window.location.reload();
  };

  const renderPresets = () => (
    <div className="space-y-4">
      <div className="grid gap-3">
        {presets.map((preset: LayoutPreset) => {
          const isActive = currentPreset === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                isActive
                  ? 'border-blue-500 bg-blue-50'
                  : `${themeClasses.border} hover:border-blue-300`
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{preset.icon}</span>
                <div className="flex-1">
                  <h3 className={`font-semibold ${themeClasses.text} ${isActive ? 'text-blue-900' : ''}`}>
                    {preset.name}
                  </h3>
                  <p className={`text-sm ${isActive ? 'text-blue-700' : themeClasses.textSecondary}`}>
                    {preset.description}
                  </p>
                </div>
                {isActive && <CheckCircle size={20} className="text-blue-600" />}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>Target: {preset.targetUser}</span>
                <span>
                  {Object.values(preset.sections).filter(Boolean).length} sections visible
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {currentPreset === 'custom' && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={16} className="text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Custom Layout</span>
          </div>
          <p className="text-xs text-yellow-700">
            You've customized your layout. Choose a preset above to reset, or continue customizing in the Sections tab.
          </p>
        </div>
      )}
    </div>
  );

  const renderSections = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className={`p-4 ${themeClasses.card} rounded-lg`}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-blue-600" />
          <span className={`font-medium ${themeClasses.text}`}>Layout Statistics</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className={themeClasses.textSecondary}>Visible sections:</span>
            <span className={`ml-2 font-medium ${themeClasses.text}`}>{stats.visible}</span>
          </div>
          <div>
            <span className={themeClasses.textSecondary}>Hidden sections:</span>
            <span className={`ml-2 font-medium ${themeClasses.text}`}>{stats.hidden}</span>
          </div>
        </div>
      </div>

      {/* Sections by category */}
      {['header', 'main', 'sidebar'].map(category => {
        const categorySections = sections.filter(s => s.category === category);
        if (categorySections.length === 0) return null;

        return (
          <div key={category}>
            <h3 className={`font-semibold ${themeClasses.text} mb-3 capitalize`}>
              {category} Sections
            </h3>
            <div className="space-y-2">
              {categorySections.map((section: LayoutSection) => (
                <div
                  key={section.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    section.visible ? themeClasses.border : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${section.visible ? themeClasses.text : 'text-gray-400'}`}>
                        {section.name}
                      </h4>
                      {section.required && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${section.visible ? themeClasses.textSecondary : 'text-gray-400'}`}>
                      {section.description}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleSection(section.id)}
                    disabled={section.required}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      section.required
                        ? 'text-gray-400 cursor-not-allowed'
                        : section.visible
                        ? 'text-green-700 bg-green-100 hover:bg-green-200'
                        : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    {section.visible ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-4">
      {adhdRecommendations.length > 0 ? (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-yellow-500" />
            <span className={`font-medium ${themeClasses.text}`}>
              ADHD-Friendly Recommendations
            </span>
          </div>

          {adhdRecommendations.map((rec, index) => (
            <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm text-yellow-800 mb-2">{rec.message}</p>
                  <button
                    onClick={rec.action}
                    className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Apply Suggestion
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="text-center py-8">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className={`font-semibold ${themeClasses.text} mb-2`}>
            Great Layout!
          </h3>
          <p className={themeClasses.textSecondary}>
            Your current layout follows ADHD-friendly design principles.
          </p>
        </div>
      )}

      {/* General ADHD tips */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">ADHD-Friendly Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use minimal or focus mode to reduce distractions</li>
          <li>• Keep only essential sections visible</li>
          <li>• Enable break reminders (coming soon)</li>
          <li>• Use high contrast themes if needed</li>
          <li>• Try keyboard navigation to reduce mouse usage</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className={`relative w-full max-w-4xl mx-4 max-h-[90vh] ${themeClasses.card} rounded-xl shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Layout size={24} className="text-blue-600" />
            <div>
              <h2 className={`text-xl font-bold ${themeClasses.text}`}>
                Customize Layout
              </h2>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                Personalize your dashboard to reduce clutter and improve focus
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} rounded-lg`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'presets', label: 'Layout Presets', icon: Layout },
            { id: 'sections', label: 'Individual Sections', icon: Settings },
            { id: 'recommendations', label: 'ADHD Recommendations', icon: Lightbulb }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : `${themeClasses.textSecondary} hover:${themeClasses.text}`
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'presets' && renderPresets()}
          {activeTab === 'sections' && renderSections()}
          {activeTab === 'recommendations' && renderRecommendations()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <button
              onClick={resetLayout}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
              Reset to Default
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg cursor-pointer transition-colors">
              <Upload size={16} />
              Import Layout
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg transition-colors"
            >
              <Download size={16} />
              Export Layout
            </button>

            {/* Submit Button */}
            <button
              onClick={handleSubmitLayout}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <CheckCircle size={16} />
              Apply Layout & Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutCustomizer;
