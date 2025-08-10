import type React from 'react';
import { useState } from 'react';
import { SECTORS } from '../data/stockData';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface SimpleSectorFilterProps {
  selectedSectors: string[];
  onSectorChange: (sectors: string[]) => void;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
}

export const SimpleSectorFilter: React.FC<SimpleSectorFilterProps> = ({
  selectedSectors,
  onSectorChange,
  userLevel
}) => {
  const { theme } = useTheme();
  const themeClasses = THEMES[theme].classes;
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSectorToggle = (sector: string) => {
    if (selectedSectors.includes(sector)) {
      onSectorChange(selectedSectors.filter(s => s !== sector));
    } else {
      onSectorChange([...selectedSectors, sector]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSectors.length === Object.keys(SECTORS).length) {
      onSectorChange([]);
    } else {
      onSectorChange(Object.keys(SECTORS));
    }
  };

  // Show most popular sectors first for beginners
  const sectorOrder = userLevel === 'beginner'
    ? ['Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy', 'Automotive', 'Real Estate', 'Aerospace', 'Telecom', 'Entertainment']
    : Object.keys(SECTORS);

  const visibleSectors = isExpanded ? sectorOrder : sectorOrder.slice(0, 5);

  return (
    <div className={`${themeClasses.card} rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-blue-600" />
          <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
            {userLevel === 'beginner' ? 'Industry Types' : 'Sector Filter'}
          </h3>
        </div>

        <button
          onClick={handleSelectAll}
          className={`text-sm ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
        >
          {selectedSectors.length === Object.keys(SECTORS).length ? 'Clear All' : 'Select All'}
        </button>
      </div>

      {/* Beginner explanation */}
      {userLevel === 'beginner' && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>What are sectors?</strong> Companies are grouped by what they do.
            Click to see companies in different industries.
          </p>
        </div>
      )}

      {/* Sector buttons - cleaner grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {visibleSectors.map((sectorKey) => {
          const sectorInfo = SECTORS[sectorKey as keyof typeof SECTORS];
          const isSelected = selectedSectors.includes(sectorKey);

          return (
            <button
              key={sectorKey}
              onClick={() => handleSectorToggle(sectorKey)}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-300 bg-blue-50 text-blue-800'
                  : `${themeClasses.border} hover:border-blue-200 ${themeClasses.text}`
              }`}
            >
              <span className="text-xl">{sectorInfo.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium">
                  {userLevel === 'beginner' ? sectorInfo.name.split(' ')[0] : sectorInfo.name}
                </div>
                {userLevel !== 'beginner' && (
                  <div className="text-xs opacity-75 truncate">
                    {sectorInfo.description.split(',')[0]}
                  </div>
                )}
              </div>
              {isSelected && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Show more/less button */}
      {sectorOrder.length > 5 && (
        <div className="text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 mx-auto px-4 py-2 text-sm ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
          >
            <span>{isExpanded ? 'Show Less' : `Show ${sectorOrder.length - 5} More`}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      )}

      {/* Selection summary - only show if filtered */}
      {selectedSectors.length > 0 && selectedSectors.length < Object.keys(SECTORS).length && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className={`text-sm ${themeClasses.textSecondary}`}>
            <strong>Selected:</strong> {selectedSectors.length} of {Object.keys(SECTORS).length} sectors
          </p>
        </div>
      )}
    </div>
  );
};
