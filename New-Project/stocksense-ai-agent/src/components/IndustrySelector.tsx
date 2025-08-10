import type React from 'react';
import { useState, useEffect } from 'react';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import { SECTORS } from '../data/stockData';
import {
  Building2,
  Cpu,
  Heart,
  Zap,
  Car,
  Home,
  Plane,
  Smartphone,
  Gamepad2,
  TrendingUp,
  CheckCircle,
  Circle
} from 'lucide-react';

interface IndustrySelectorProps {
  selectedSectors: string[];
  onSectorChange: (sectors: string[]) => void;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  className?: string;
}

const SECTOR_ICONS: Record<string, any> = {
  'Technology': Cpu,
  'Healthcare': Heart,
  'Finance': Building2,
  'Energy': Zap,
  'Automotive': Car,
  'Real Estate': Home,
  'Aerospace': Plane,
  'Telecom': Smartphone,
  'Entertainment': Gamepad2,
  'Consumer': TrendingUp
};

const SECTOR_COLORS: Record<string, string> = {
  'Technology': 'bg-blue-100 text-blue-800 border-blue-200',
  'Healthcare': 'bg-red-100 text-red-800 border-red-200',
  'Finance': 'bg-green-100 text-green-800 border-green-200',
  'Energy': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Automotive': 'bg-purple-100 text-purple-800 border-purple-200',
  'Real Estate': 'bg-orange-100 text-orange-800 border-orange-200',
  'Aerospace': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Telecom': 'bg-pink-100 text-pink-800 border-pink-200',
  'Entertainment': 'bg-teal-100 text-teal-800 border-teal-200',
  'Consumer': 'bg-cyan-100 text-cyan-800 border-cyan-200'
};

export const IndustrySelector: React.FC<IndustrySelectorProps> = ({
  selectedSectors,
  onSectorChange,
  userLevel,
  className = ''
}) => {
  const { theme } = useTheme();
  const themeClasses = THEMES[theme].classes;
  const [localSelections, setLocalSelections] = useState<string[]>(selectedSectors);

  useEffect(() => {
    setLocalSelections(selectedSectors);
  }, [selectedSectors]);

  const availableSectors = Object.keys(SECTORS);

  const toggleSector = (sector: string) => {
    const newSelections = localSelections.includes(sector)
      ? localSelections.filter(s => s !== sector)
      : [...localSelections, sector];

    setLocalSelections(newSelections);
    onSectorChange(newSelections);
  };

  const selectAll = () => {
    setLocalSelections(availableSectors);
    onSectorChange(availableSectors);
  };

  const clearAll = () => {
    setLocalSelections([]);
    onSectorChange([]);
  };

  const getSectorDescription = (sector: string) => {
    if (userLevel === 'beginner') {
      const descriptions: Record<string, string> = {
        'Technology': 'Companies making computers, phones, and software',
        'Healthcare': 'Hospitals, drug companies, and medical devices',
        'Finance': 'Banks, insurance companies, and investment firms',
        'Energy': 'Oil, gas, solar, and electric power companies',
        'Automotive': 'Car manufacturers and auto parts companies',
        'Real Estate': 'Property developers and real estate companies',
        'Aerospace': 'Airplane manufacturers and defense contractors',
        'Telecom': 'Phone companies and internet service providers',
        'Entertainment': 'Movie studios, gaming, and media companies',
        'Consumer': 'Retail stores and consumer product companies'
      };
      return descriptions[sector] || 'Companies in this industry';
    }
    return '';
  };

  const getSectorIcon = (sector: string) => {
    const IconComponent = SECTOR_ICONS[sector] || Building2;
    return <IconComponent size={16} />;
  };

  const renderSectorCard = (sector: string) => {
    const isSelected = localSelections.includes(sector);
    const colorClasses = SECTOR_COLORS[sector] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <button
        key={sector}
        onClick={() => toggleSector(sector)}
        className={`relative p-3 rounded-lg border-2 transition-all text-left hover:shadow-md ${
          isSelected
            ? colorClasses
            : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          {getSectorIcon(sector)}
          <span className="font-medium text-sm">{sector}</span>
          <div className="ml-auto">
            {isSelected ? (
              <CheckCircle size={16} className="text-current" />
            ) : (
              <Circle size={16} className="text-gray-400" />
            )}
          </div>
        </div>

        {userLevel === 'beginner' && (
          <p className="text-xs opacity-75 mt-1">
            {getSectorDescription(sector)}
          </p>
        )}

        {userLevel !== 'beginner' && (
          <div className="text-xs opacity-75">
            {Object.values(SECTORS[sector as keyof typeof SECTORS] || {}).length} companies
          </div>
        )}
      </button>
    );
  };

  if (userLevel === 'beginner') {
    return null; // Don't show for beginners
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className={`font-medium ${themeClasses.text} text-sm`}>
            Industry Focus
          </h4>
          <p className={`text-xs ${themeClasses.textSecondary}`}>
            Choose sectors to focus on
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Select All
          </button>
          <button
            onClick={clearAll}
            className="text-xs text-gray-600 hover:text-gray-800 underline"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {availableSectors.map(renderSectorCard)}
      </div>

      {localSelections.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Selected:</strong> {localSelections.length} sectors
            {userLevel === 'advanced' && (
              <span className="ml-2">
                • {localSelections.map(s => Object.values(SECTORS[s as keyof typeof SECTORS] || {}).length).reduce((a, b) => a + b, 0)} companies
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustrySelector;
