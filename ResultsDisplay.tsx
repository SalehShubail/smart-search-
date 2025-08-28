import React from 'react';
import type { SearchResult, GroundingChunk, Lang, PhoneInfo, SocialProfile, Contact, PlatformPresence } from '../types';
import { exportToCsv } from '../utils/csv';
import { Icon } from './Icon';
import { translations } from '../utils/translations';
import type { IconProps } from './Icon';

const ContactNetworkDisplay: React.FC<{ contacts: Contact[]; lang: Lang }> = ({ contacts, lang }) => {
    const t = translations[lang];

    if (!contacts || contacts.length === 0) {
        return null;
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Icon name="users" className="h-5 w-5" />
                {t.contactNetwork}
            </h3>
            <ul className="space-y-3">
                {contacts.map((contact, index) => (
                    <li key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <p className="font-medium text-gray-800 dark:text-gray-100">{contact.name}</p>
                        {contact.relationship && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-semibold">{t.relationship}:</span> {contact.relationship}
                            </p>
                        )}
                        {contact.source && (
                             <p className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">{t.source}:</span> {contact.source}
                            </p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface PresenceAnalysisDisplayProps {
    presence: PlatformPresence[];
    summary?: string;
    lang: Lang;
    query: string;
}

const PresenceAnalysisDisplay: React.FC<PresenceAnalysisDisplayProps> = ({ presence, summary, lang, query }) => {
    const t = translations[lang];

    if ((!presence || presence.length === 0) && !summary) {
        return null;
    }

    const getIconForPlatform = (platform: string): IconProps['name'] => {
        const p = platform.toLowerCase();
        if (p.includes('whatsapp')) return 'whatsapp';
        if (p.includes('telegram')) return 'telegram';
        if (p.includes('facebook')) return 'facebook';
        if (p.includes('signal')) return 'signal';
        return 'globe';
    };

    const getPresenceLink = (platform: string, phone: string): string | null => {
        const p = platform.toLowerCase();
        const numericPhoneWithPlus = `+${phone.replace(/\D/g, '')}`;

        if (!numericPhoneWithPlus || numericPhoneWithPlus.length < 2) return null;

        if (p.includes('whatsapp')) {
            return `https://wa.me/${numericPhoneWithPlus.substring(1)}`;
        }
        if (p.includes('telegram')) {
            return `https://t.me/${numericPhoneWithPlus}`;
        }
        return null;
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Icon name="sparkles" className="h-5 w-5" />
                {t.onlinePresenceAnalysis}
            </h3>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-md mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    {t.presenceDisclaimer}
                </p>
            </div>

            {summary && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                     <h4 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">{t.activitySummary}</h4>
                     <p className="text-sm text-gray-700 dark:text-gray-300">{summary}</p>
                </div>
            )}
            
            {presence && presence.length > 0 && (
                <ul className="space-y-3">
                    {presence.map((item, index) => {
                        const url = getPresenceLink(item.platform, query);
                        
                        const content = (
                            <>
                                <div className="flex items-center gap-3">
                                    <Icon name={getIconForPlatform(item.platform)} className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    <span className="font-medium flex-grow text-gray-800 dark:text-gray-100">{item.platform}</span>
                                    {item.isRegistered ? (
                                        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
                                            <Icon name="check-circle" className="h-3 w-3" />
                                            {t.likelyRegistered}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                                            <Icon name="x-circle" className="h-3 w-3" />
                                            {t.noPublicEvidence}
                                        </span>
                                    )}
                                    {url && <Icon name="link" className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors flex-shrink-0" />}
                                </div>
                                {item.lastSeen && (
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-semibold">{t.lastSeen}:</span> {item.lastSeen}
                                    </p>
                                )}
                                 <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold">{t.evidence}:</span> {item.source}
                                 </p>
                            </>
                        );

                        if (url) {
                            return (
                                <li key={index}>
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 group transition-colors"
                                        title={`${t.open} ${item.platform}`}
                                    >
                                        {content}
                                    </a>
                                </li>
                            );
                        }

                        return (
                            <li key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                               {content}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};


interface ResultsDisplayProps {
  result: SearchResult;
  query: string;
  lang: Lang;
}

const PhoneResultsDisplay: React.FC<{ phoneInfo: PhoneInfo; lang: Lang; query: string }> = ({ phoneInfo, lang, query }) => {
    const t = translations[lang];

    const getIconForPlatform = (platform: string): IconProps['name'] => {
        const p = platform.toLowerCase();
        if (p.includes('whatsapp')) return 'whatsapp';
        if (p.includes('telegram')) return 'telegram';
        if (p.includes('facebook')) return 'facebook';
        if (p.includes('signal')) return 'signal';
        if (p.includes('linkedin')) return 'linkedin';
        if (p.includes('youtube')) return 'youtube';
        if (p.includes('instagram')) return 'instagram';
        if (p.includes('tiktok')) return 'tiktok';
        if (p.includes('twitter') || p === 'x') return 'twitter';
        if (p.includes('snapchat')) return 'snapchat';
        return 'link';
    };

    const getPlatformTranslationKey = (platform: string): keyof (typeof translations)['en'] => {
        const p = platform.toLowerCase();
        if (p.includes('whatsapp')) return 'platform_whatsapp';
        if (p.includes('telegram')) return 'platform_telegram';
        if (p.includes('facebook')) return 'platform_facebook';
        if (p.includes('signal')) return 'platform_signal';
        if (p.includes('linkedin')) return 'platform_linkedin';
        if (p.includes('youtube')) return 'platform_youtube';
        if (p.includes('instagram')) return 'platform_instagram';
        if (p.includes('tiktok')) return 'platform_tiktok';
        if (p.includes('twitter') || p === 'x') return 'platform_twitter';
        if (p.includes('snapchat')) return 'platform_snapchat';
        return 'platform_unknown';
    };

    const getProfileUrl = (profile: SocialProfile): string | null => {
        const p = profile.platform.toLowerCase();
        const username = profile.username;

        if (p.includes('whatsapp')) {
            const numericPhone = query.replace(/\D/g, '');
            return `https://wa.me/${numericPhone}`;
        }

        if (username) {
            const sanitizedUsername = username.startsWith('@') ? username.substring(1) : username;
            if (p.includes('telegram')) return `https://t.me/${sanitizedUsername}`;
            if (p.includes('facebook')) return `https://www.facebook.com/${sanitizedUsername}`;
            if (p.includes('instagram')) return `https://www.instagram.com/${sanitizedUsername}`;
            if (p.includes('linkedin')) return `https://www.linkedin.com/in/${sanitizedUsername}`;
            if (p.includes('twitter') || p === 'x') return `https://x.com/${sanitizedUsername}`;
            if (p.includes('tiktok')) return `https://www.tiktok.com/@${sanitizedUsername}`;
            if (p.includes('snapchat')) return `https://www.snapchat.com/add/${sanitizedUsername}`;
        }
        
        return null;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.phoneDetails}</h2>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Icon name="info" className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ms-3">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            <strong>{t.phoneResultsDisclaimerTitle}:</strong> {t.phoneResultsDisclaimerText}
                        </p>
                    </div>
                </div>
            </div>

            {phoneInfo.ownerName && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t.ownerName}</p>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">{phoneInfo.ownerName}</p>
                        </div>
                        {phoneInfo.confidenceLevel && (
                             <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                phoneInfo.confidenceLevel.toLowerCase() === 'high' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                phoneInfo.confidenceLevel.toLowerCase() === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                                'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}>
                                {t[`confidence_${phoneInfo.confidenceLevel.toLowerCase()}` as keyof typeof t] || phoneInfo.confidenceLevel}
                            </span>
                        )}
                    </div>
            
                    {phoneInfo.nameVerificationSummary && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t.verificationSummary}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{phoneInfo.nameVerificationSummary}</p>
                        </div>
                    )}
                </div>
            )}

            <PresenceAnalysisDisplay 
                presence={phoneInfo.presenceAnalysis || []} 
                summary={phoneInfo.activitySummary}
                lang={lang} 
                query={query}
            />

            <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">{t.registeredServices}</h3>
                {phoneInfo.socialProfiles && phoneInfo.socialProfiles.length > 0 ? (
                    <ul className="space-y-3">
                        {phoneInfo.socialProfiles.map((profile, index) => {
                             const url = getProfileUrl(profile);
                             const platformNameKey = getPlatformTranslationKey(profile.platform);
                             const platformDisplayName = platformNameKey !== 'platform_unknown' ? t[platformNameKey] : profile.platform;
                             
                             const content = (
                                <>
                                    <Icon name={getIconForPlatform(profile.platform)} className="h-6 w-6 me-4 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                                    <div className="flex-grow">
                                        <p className="font-medium text-gray-800 dark:text-gray-100">{platformDisplayName}</p>
                                        {profile.nameOnPlatform && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{profile.nameOnPlatform}</p>
                                        )}
                                        {profile.username && profile.nameOnPlatform !== profile.username && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
                                        )}
                                    </div>
                                    {url && <Icon name="link" className="h-5 w-5 ms-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />}
                                </>
                             );

                             if (url) {
                                 return (
                                     <li key={index}>
                                         <a 
                                             href={url} 
                                             target="_blank" 
                                             rel="noopener noreferrer"
                                             className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 group transition-colors"
                                             title={`${platformDisplayName} - ${t.visitProfile}`}
                                         >
                                            {content}
                                         </a>
                                     </li>
                                 );
                             }

                             return (
                                  <li 
                                     key={index} 
                                     className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md"
                                     title={platformDisplayName}
                                  >
                                     {content}
                                 </li>
                             );
                        })}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">{t.noServicesFound}</p>
                )}
            </div>

            <ContactNetworkDisplay contacts={phoneInfo.contactNetwork || []} lang={lang} />
        </div>
    );
};


const ResultsTable: React.FC<{ sources: GroundingChunk[], lang: Lang }> = ({ sources, lang }) => {
    const t = translations[lang];
    const validSources = sources.filter(s => s.web && s.web.uri && s.web.title);

    if (validSources.length === 0) {
        return (
            <div className="text-center py-4 px-6 text-gray-500 dark:text-gray-400">
                <p>{t.noSources}</p>
            </div>
        );
    }
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {t.tableTitle}
                        </th>
                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {t.tableUrl}
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {validSources.map((source, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900 dark:text-white">
                                {source.web!.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                                <a href={source.web!.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {source.web!.uri}
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, query, lang }) => {
    const t = translations[lang];
    
    const handleExport = () => {
        const filename = query.replace(/\s+/g, '_').toLowerCase() || 'search_results';
        const headers = { title: t.tableTitle, url: t.tableUrl };
        exportToCsv(filename, result.sources, headers);
    };

    const hasSources = result.sources && result.sources.some(s => s.web && s.web.uri && s.web.title);

    return (
        <div className="animate-fade-in space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t.summary}</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{result.text}</p>
            </div>

            {result.phoneInfo && (
                <PhoneResultsDisplay phoneInfo={result.phoneInfo} lang={lang} query={query} />
            )}
            
            {hasSources && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">{t.sources}</h2>
                        <button
                            onClick={handleExport}
                            disabled={!hasSources}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
                            title={t.tooltip_exportButton}
                        >
                            <Icon name="download" className="h-5 w-5" />
                            <span>{t.exportCsv}</span>
                        </button>
                    </div>
                    <ResultsTable sources={result.sources} lang={lang} />
                </div>
            )}
        </div>
    );
};
