import React from 'react';
import type { Lang, SearchType, AppInputs } from '../types';
import { Icon } from './Icon';
import { translations } from '../utils/translations';
import { countryCodes } from '../data/countryCodes';
import { socialPlatforms } from '../data/socialPlatforms';
import { countries } from '../data/countries';


interface SearchFilterProps {
  lang: Lang;
  searchType: SearchType;
  setSearchType: (tab: SearchType) => void;
  inputs: AppInputs;
  setInputs: React.Dispatch<React.SetStateAction<AppInputs>>;
  onSearch: () => void;
  isLoading: boolean;
  cooldown: number;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ lang, searchType, setSearchType, inputs, setInputs, onSearch, isLoading, cooldown }) => {
  const t = translations[lang];
  const isDisabled = isLoading || cooldown > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isDisabled) {
      onSearch();
    }
  };

  const handlePlatformToggle = (platformId: string, key: 'platforms' | 'phonePlatforms') => {
    setInputs(prev => {
        const currentPlatforms = prev[key] || [];
        const newPlatforms = currentPlatforms.includes(platformId)
            ? currentPlatforms.filter(p => p !== platformId)
            : [...currentPlatforms, platformId];
        return { ...prev, [key]: newPlatforms };
    });
  };

  const SEARCH_TYPES: { id: SearchType; label: string; }[] = [
    { id: 'fullName', label: t.fullName },
    { id: 'nameParts', label: t.firstNameLastName },
    { id: 'nameToPhone', label: t.nameToPhone },
    { id: 'phone', label: t.phoneNumber },
    { id: 'truecaller', label: t.truecaller },
    { id: 'email', label: t.email },
    { id: 'username', label: t.username },
    { id: 'social', label: t.socialMedia },
    { id: 'urlAnalysis', label: t.urlAnalysis },
    { id: 'linkedin', label: t.linkedin },
  ];

  const renderInput = () => {
    const commonInputClass = "w-full ps-4 pe-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50";

    switch (searchType) {
        case 'fullName':
            return (
                <div className="space-y-4">
                    <input type="text" name="fullName" value={inputs.fullName} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder={t.fullNamePlaceholder} disabled={isDisabled} className={commonInputClass} title={t.tooltip_input_fullName} />
                    <div>
                         <label htmlFor="platform-filter" className="sr-only">{t.platformFilter}</label>
                         <input 
                            type="text" 
                            id="platform-filter"
                            name="platform" 
                            value={inputs.platform} 
                            onChange={handleInputChange} 
                            onKeyDown={handleKeyDown} 
                            placeholder={t.platformFilterPlaceholder} 
                            disabled={isDisabled} 
                            className={commonInputClass} 
                            title={t.tooltip_input_platform} 
                         />
                    </div>
                </div>
            );
        case 'nameParts':
            return (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input type="text" name="firstName" value={inputs.firstName} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder={t.firstNamePlaceholder} disabled={isDisabled} className={commonInputClass} title={t.tooltip_input_firstName} />
                        <input type="text" name="lastName" value={inputs.lastName} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder={t.lastNamePlaceholder} disabled={isDisabled} className={commonInputClass} title={t.tooltip_input_lastName} />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.platformFilterMulti}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2" title={t.tooltip_input_platforms}>
                            {socialPlatforms.map(platform => (
                                <button
                                    key={platform.id}
                                    type="button"
                                    onClick={() => handlePlatformToggle(platform.id, 'platforms')}
                                    disabled={isDisabled}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
                                        inputs.platforms.includes(platform.id)
                                            ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold'
                                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Icon name={platform.icon} className="h-4 w-4" />
                                    <span className="truncate">{platform.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="country-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.countryFilter}</label>
                        <select
                            id="country-filter"
                            name="country"
                            value={inputs.country}
                            onChange={handleInputChange}
                            disabled={isDisabled}
                            className={commonInputClass}
                            title={t.tooltip_input_country}
                        >
                            {countries.map(country => (
                                <option key={country.code} value={country.code}>
                                    {country.code === 'unknown' ? t[country.name as keyof typeof t] : country.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            );
        case 'nameToPhone':
            return (
                <div className="space-y-4">
                    <input type="text" name="fullName" value={inputs.fullName} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder={t.nameToPhonePlaceholder} disabled={isDisabled} className={commonInputClass} title={t.tooltip_input_fullName} />
                    <div>
                        <label htmlFor="country-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.countryFilter}</label>
                        <select
                            id="country-filter"
                            name="country"
                            value={inputs.country}
                            onChange={handleInputChange}
                            disabled={isDisabled}
                            className={commonInputClass}
                            title={t.tooltip_input_country}
                        >
                            {countries.map(country => (
                                <option key={country.code} value={country.code}>
                                    {country.code === 'unknown' ? t[country.name as keyof typeof t] : country.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            );
        case 'phone':
        case 'truecaller': {
             const placeholder = searchType === 'phone' ? t.phonePlaceholder : t.truecallerPlaceholder;
             return (
                <div className="space-y-4">
                    <div className="flex">
                        <select
                            name="countryCode"
                            value={inputs.countryCode}
                            onChange={handleInputChange}
                            disabled={isDisabled}
                            className="pe-8 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-s-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                            aria-label="Country Code"
                            title={t.tooltip_input_countryCode}
                        >
                            {countryCodes.map(c => <option key={`${c.name}-${c.code}`} value={c.code}>{c.name} ({c.code})</option>)}
                        </select>
                        <input type="tel" name="phone" value={inputs.phone} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder={placeholder} disabled={isDisabled} className={`${commonInputClass} rounded-s-none`} title={t.tooltip_input_phone}/>
                    </div>

                    <div>
                        <label htmlFor="phoneOwnerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.ownerNameOptional}</label>
                        <input
                            type="text"
                            id="phoneOwnerName"
                            name="phoneOwnerName"
                            value={inputs.phoneOwnerName}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={t.ownerNameOptionalPlaceholder}
                            disabled={isDisabled}
                            className={commonInputClass}
                            title={t.tooltip_input_phoneOwnerName}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.platformFilterMulti}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2" title={t.tooltip_input_phonePlatforms}>
                            {socialPlatforms.map(platform => (
                                <button
                                    key={platform.id}
                                    type="button"
                                    onClick={() => handlePlatformToggle(platform.id, 'phonePlatforms')}
                                    disabled={isDisabled}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
                                        (inputs.phonePlatforms || []).includes(platform.id)
                                            ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold'
                                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Icon name={platform.icon} className="h-4 w-4" />
                                    <span className="truncate">{platform.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
        case 'email':
            return <input type="email" name="email" value={inputs.email} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder={t.emailPlaceholder} disabled={isDisabled} className={commonInputClass} title={t.tooltip_input_email} />;
        case 'username':
            return <input type="text" name="username" value={inputs.username} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder={t.usernamePlaceholder} disabled={isDisabled} className={commonInputClass} title={t.tooltip_input_username} />;
        case 'social':
            return <input type="url" name="social" value={inputs.social} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder={t.socialMediaPlaceholder} disabled={isDisabled} className={commonInputClass} title={t.tooltip_input_social} />;
        case 'linkedin':
            return <input type="text" name="linkedin" value={inputs.linkedin} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder={t.linkedinPlaceholder} disabled={isDisabled} className={commonInputClass} title={t.tooltip_input_linkedin} />;
        case 'urlAnalysis':
            return <input type="url" name="url" value={inputs.url} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder={t.urlAnalysisPlaceholder} disabled={isDisabled} className={commonInputClass} title={t.tooltip_input_url} />;
        default:
            return null;
    }
  };

  return (
    <div className="space-y-6">
        <div>
            <label htmlFor="search-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.searchTypeLabel}</label>
            <select
                id="search-type"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as SearchType)}
                disabled={isDisabled}
                className="w-full ps-4 pe-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                title={t.tooltip_select_searchType}
            >
                {SEARCH_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                ))}
            </select>
        </div>
      
        <div className="relative">
            {renderInput()}
        </div>

        <button
            onClick={onSearch}
            disabled={isDisabled}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out disabled:bg-blue-400 disabled:cursor-not-allowed"
            title={t.tooltip_searchButton}
        >
            {cooldown > 0 ? (
                <span>{t.tryAgainIn.replace('{seconds}', cooldown.toString())}</span>
            ) : isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>{t.searching}</span>
                </>
            ) : (
                <>
                    <Icon name="search" className="h-5 w-5" />
                    <span>{t.search}</span>
                </>
            )}
        </button>
    </div>
  );
};