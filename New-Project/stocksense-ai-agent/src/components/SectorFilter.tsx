import type React from 'react';
import { SECTORS } from '../data/stockData';
import { Filter, Globe, TrendingUp } from 'lucide-react';

interface SectorFilterProps {
  selectedSectors: string[];
  onSectorChange: (sectors: string[]) => void;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
}

export const SectorFilter: React.FC<SectorFilterProps> = ({
  selectedSectors,
  onSectorChange,
  userLevel
}) => {
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

  const getSectorColorClass = (sector: string, isSelected: boolean) => {
    const sectorInfo = SECTORS[sector as keyof typeof SECTORS];
    const baseClasses = "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border-2";

    if (isSelected) {
      switch (sectorInfo.color) {
        case 'blue': return `${baseClasses} bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200`;
        case 'green': return `${baseClasses} bg-green-100 text-green-800 border-green-300 hover:bg-green-200`;
        case 'indigo': return `${baseClasses} bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200`;
        case 'yellow': return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200`;
        case 'pink': return `${baseClasses} bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200`;
        case 'gray': return `${baseClasses} bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200`;
        case 'purple': return `${baseClasses} bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200`;
        case 'orange': return `${baseClasses} bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200`;
        case 'teal': return `${baseClasses} bg-teal-100 text-teal-800 border-teal-300 hover:bg-teal-200`;
        case 'red': return `${baseClasses} bg-red-100 text-red-800 border-red-300 hover:bg-red-200`;
        default: return `${baseClasses} bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200`;
      }
    } else {
      return `${baseClasses} bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300`;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter size={20} />
          <h3 className="text-lg font-semibold">
            {userLevel === 'beginner' ? 'Industry Categories' : 'Sector Filter'}
          </h3>
        </div>
        <button
          onClick={handleSelectAll}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {selectedSectors.length === Object.keys(SECTORS).length ? 'Clear All' : 'Select All'}
        </button>
      </div>

      {/* Beginner Mode: Simple explanation */}
      {userLevel === 'beginner' && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Globe size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <strong>What are sectors?</strong> Companies are grouped by what they do.
              Click on categories below to see companies in those industries.
            </div>
          </div>
        </div>
      )}

      {/* Advanced Mode: Statistics */}
      {userLevel === 'advanced' && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {selectedSectors.length === 0
                ? `Showing all ${Object.keys(SECTORS).length} sectors`
                : `Filtered to ${selectedSectors.length} of ${Object.keys(SECTORS).length} sectors`
              }
            </span>
            <div className="flex items-center gap-1">
              <TrendingUp size={14} />
              <span>Global Coverage</span>
            </div>
          </div>
        </div>
      )}

      {/* Sector Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {Object.entries(SECTORS).map(([sectorKey, sectorInfo]) => {
          const isSelected = selectedSectors.includes(sectorKey);

          return (
            <div
              key={sectorKey}
              onClick={() => handleSectorToggle(sectorKey)}
              className={getSectorColorClass(sectorKey, isSelected)}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{sectorInfo.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {userLevel === 'beginner' ? sectorInfo.name.split(' ')[0] : sectorInfo.name}
                  </div>
                  {userLevel !== 'beginner' && (
                    <div className="text-xs opacity-75 truncate">
                      {sectorInfo.description.split(',')[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedSectors.length > 0 && selectedSectors.length < Object.keys(SECTORS).length && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <strong>Selected:</strong> {selectedSectors.map(s => SECTORS[s as keyof typeof SECTORS].name).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};
