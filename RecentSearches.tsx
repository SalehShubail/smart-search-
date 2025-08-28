import React from 'react';
import { HistoryItem, Lang, SearchType } from '../types';
import { translations } from '../utils/translations';
import { Icon } from './Icon';

interface RecentSearchesProps {
  history: HistoryItem[];
  onItemClick: (item: HistoryItem) => void;
  onClear: () => void;
  lang: Lang;
}

const getIconForSearchType = (searchType: SearchType): React.ComponentProps<typeof Icon>['name'] => {
  switch (searchType) {
    case 'fullName':
    case 'nameParts':
    case 'nameToPhone':
      return 'user';
    case 'phone':
    case 'truecaller':
      return 'phone';
    case 'email':
      return 'email';
    case 'username':
      return 'users';
    case 'social':
    case 'urlAnalysis':
      return 'link';
    case 'linkedin':
      return 'linkedin';
    default:
      return 'search';
  }
};

export const RecentSearches: React.FC<RecentSearchesProps> = ({ history, onItemClick, onClear, lang }) => {
  const t = translations[lang];

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t.recentSearches}</h2>
        <button
          onClick={onClear}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          title={t.tooltip_clearHistory}
        >
          {t.clearHistory}
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        {history.length > 0 ? (
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onItemClick(item)}
                  className="w-full flex items-center text-start gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  title={t.tooltip_historyItem}
                >
                  <Icon name={getIconForSearchType(item.searchType)} className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span className="flex-grow text-gray-800 dark:text-gray-200 truncate">{item.displayQuery}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 uppercase flex-shrink-0">{t[item.searchType as keyof typeof t] || item.searchType}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t.noHistory}</p>
        )}
      </div>
    </div>
  );
};