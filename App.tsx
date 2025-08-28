import React, { useState, useCallback, useEffect } from 'react';
import { SearchFilter } from './components/SearchTabs';
import { ResultsDisplay } from './components/ResultsDisplay';
import { performSearch } from './services/geminiService';
import type { SearchResult, Lang, SearchType, HistoryItem, AppInputs } from './types';
import { Icon } from './components/Icon';
import { translations } from './utils/translations';
import { RecentSearches } from './components/RecentSearches';

const initialInputs: AppInputs = {
    fullName: '',
    firstName: '',
    middleName: '',
    lastName: '',
    platform: '',
    platforms: [],
    country: 'unknown',
    phone: '',
    countryCode: '+1',
    email: '',
    username: '',
    social: '',
    linkedin: '',
    youtube: '',
    url: '',
    phonePlatforms: [],
    phoneOwnerName: '',
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>('en');
  const [searchType, setSearchType] = useState<SearchType>('fullName');
  const [inputs, setInputs] = useState<AppInputs>(initialInputs);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTrigger, setSearchTrigger] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('smartSearchHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load search history:", e);
      setHistory([]);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    let prompt = '';
    let queryForDisplay = '';

    const getQuery = (type: SearchType) => {
        switch(type) {
            case 'fullName': return inputs.fullName.trim();
            case 'nameParts': return `${inputs.firstName.trim()} ${inputs.lastName.trim()}`.trim();
            case 'nameToPhone': return inputs.fullName.trim();
            case 'phone': return inputs.phone.trim();
            case 'truecaller': return inputs.phone.trim();
            case 'email': return inputs.email.trim();
            case 'username': return inputs.username.trim();
            case 'social': return inputs.social.trim();
            case 'linkedin': return inputs.linkedin.trim();
            case 'urlAnalysis': return inputs.url.trim();
        }
    }
    
    if (searchType === 'nameToPhone') {
        const nameParts = inputs.fullName.trim().split(/\s+/);
        if (nameParts.length < 2) {
            setError(t.invalidNameToPhoneQuery);
            return;
        }
    }

    const currentInput = getQuery(searchType);

    if (!currentInput) {
      setError(t.pleaseEnterQuery);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResult(null);

    const fullPhoneNumber = `${inputs.countryCode}${inputs.phone}`;

    let platformDirective = '';
    if (inputs.platforms.length > 0) {
        platformDirective = `**Priority Platforms:** ${inputs.platforms.join(', ')}. Focus your investigation primarily on these platforms before conducting a broader search.\n`;
    }

    let countryDirective = '';
    if (inputs.country && inputs.country !== 'unknown') {
        countryDirective = `**Geographic Hint:** The target is likely associated with ${inputs.country}. Use this as a strong signal in your search.\n`;
    }
    
    const dossierPrompt = (target: string, directives: string) => `**OSINT Mission: Individual Digital Footprint Dossier**
**Primary Target:** ${target}
${directives}
**Primary Objective:**
Compile a comprehensive, actionable intelligence dossier on the primary target using publicly available information. Your highest priority is to uncover verifiable contact details and map their online presence.

**Methodology:**
*   Act as an expert Open-Source Intelligence (OSINT) analyst.
*   Conduct a deep-dive investigation across public search engines, social media networks (LinkedIn, Facebook, etc.), public records, professional networks, and forums.
*   Use all provided information (name, platform hints, country) as critical pivots to refine your search and verify findings.

**CRITICAL ENFORCEMENT:**
1.  **VERIFY ALL DATA:** Cross-reference information from at least two independent public sources before including it. State when data is uncorroborated.
2.  **NO FABRICATION:** You are forbidden from inventing, guessing, or hallucinating information. If data cannot be verified, omit it or clearly label it as low-confidence.
3.  **PRIORITIZE ACTIONABLE INTELLIGENCE:** Focus on delivering data that allows for further contact or analysis, not just general biographical facts.

**DELIVERABLES (Structured Report):**
1.  **Contact Information (Highest Priority):**
    *   **Phone Numbers:** List any publicly found phone numbers.
    *   **Email Addresses:** List any publicly found email addresses.
2.  **Online Presence:**
    *   **Social Media Profiles:** Provide direct URLs to verified profiles (LinkedIn, Facebook, Twitter/X, Instagram, etc.).
    *   **Professional Profiles:** Links to company bios, personal websites, or portfolio pages.
3.  **Professional Affiliations:**
    *   Current and past employers and job titles.
4.  **Kinship Network (Secondary Objective):**
    *   *Only if significant public evidence exists*, identify first-degree relatives (spouse, parents, siblings) and note the source of the connection (e.g., tagged in a public family photo). Do not pursue their contact details unless publicly listed alongside the primary target.
5.  **Sources:**
    *   List all key web sources used for verification.`;


    switch (searchType) {
      case 'fullName': {
        queryForDisplay = inputs.fullName;
        const platformDirectiveFullName = inputs.platform.trim() 
            ? `**Priority Platform:** ${inputs.platform.trim()}. Focus the investigation on finding the target's profile on this specific platform first before conducting a broader search.\n` 
            : '';
        prompt = dossierPrompt(inputs.fullName, platformDirectiveFullName);
        break;
      }
      case 'nameParts': {
        queryForDisplay = `${inputs.firstName} ${inputs.lastName}`;
        const directives = `${platformDirective}${countryDirective}`;
        prompt = dossierPrompt(`First Name: "${inputs.firstName}", Last Name: "${inputs.lastName}"`, directives);
        break;
      }
      case 'nameToPhone':
            queryForDisplay = inputs.fullName;
            const countryDirectiveNameToPhone = (inputs.country && inputs.country !== 'unknown')
                ? `**Geographic Hint:** ${inputs.country}. This is a critical filter; prioritize results from this country.`
                : `**Geographic Hint:** None provided. Search globally, but prioritize major Western and Middle Eastern countries.`;
                
            prompt = `**High-Priority OSINT Directive: Phone Number Acquisition from Full Name**
            **Target Full Name:** "${inputs.fullName}"
            
            **CRITICAL PRE-ANALYSIS:**
            1.  **Name Validation:** The provided name must be a plausible human name consisting of at least two parts (e.g., "Ahmed Ali" or "Ahmed Ali Ahmed"). You MUST REJECT and respond with "Invalid name provided for search." if the input is a single word, nonsensical, or appears to be offensive/abusive language.
            2.  **Geographic Hint:** ${countryDirectiveNameToPhone}
            
            **Sole Objective:** Locate the single most likely, publicly available mobile phone number for the validated target name.
            
            **Methodology:**
            *   Act as an expert OSINT analyst with a specialization in the Middle East and Western countries.
            *   Conduct a deep search across public directories, social media profiles (especially those that allow public phone number listing like Facebook), professional networks (LinkedIn), and public records.
            *   Use the geographic hint to narrow the search space effectively.
            
            **CRITICAL ENFORCEMENT:**
            1.  **PHONE NUMBER IS THE PRIORITY:** Your entire focus is on finding a phone number. All other information is secondary and should only be used to verify the number belongs to the target.
            2.  **NO FABRICATION:** You are forbidden from inventing, guessing, or hallucinating phone numbers. If no public number can be found and verified after a thorough search, you must explicitly state: "No public phone number found for this individual."
            3.  **VERIFY OWNERSHIP:** Cross-reference the found number with the target's full name from at least one independent public source.
            
            **DELIVERABLES:**
            *   If a validated name is processed, return ONLY the most probable phone number in international format (e.g., +1 555-123-4567).
            *   If no number is found, return the exact phrase "No public phone number found for this individual."
            *   If the name is rejected in pre-analysis, return the exact phrase "Invalid name provided for search."`;
            break;
      case 'phone':
      case 'truecaller':
        queryForDisplay = fullPhoneNumber;
        
        let phonePlatformDirective = '';
        if (inputs.phonePlatforms.length > 0) {
            phonePlatformDirective = `\n**Priority Platforms:** Prioritize your search on these platforms: ${inputs.phonePlatforms.join(', ')}.`;
        }
        
        let phoneOwnerNameDirective = '';
        if (inputs.phoneOwnerName.trim()) {
            phoneOwnerNameDirective = `\n**CRITICAL VERIFICATION TASK:** You are provided with a potential owner's name: "${inputs.phoneOwnerName.trim()}". Your primary objective is to verify if the phone number ${fullPhoneNumber} belongs to this specific person. All other findings are secondary to this verification.`;
        }

        prompt = `**High-Fidelity Forensic Reverse Phone Lookup & Public Activity Analysis Directive (Version 3.0):**
        **Target Number:** ${fullPhoneNumber}${phonePlatformDirective}${phoneOwnerNameDirective}

        **PRIMARY MISSION:** Your single most important mission is to conduct a meticulous, evidence-based investigation to identify the **CURRENT** owner of the provided phone number. You must actively combat outdated information due to number recycling. Accuracy, verification, and **RECENCY** are the absolute priorities.

        **ABSOLUTE DIRECTIVES & ETHICAL BOUNDARIES:**
        1.  **PUBLIC DATA ONLY:** You are an OSINT analyst AI. You are strictly limited to publicly available and indexable information. You CANNOT access private data, call logs, direct messages, real-time online status, or telecom records. Do not imply you can.
        2.  **AVOID HALLUCINATION AT ALL COSTS:** It is critically better to report "No public information found" than to provide incorrect or fabricated data. Every piece of information must be tied to a verifiable public source.
        3.  **MANDATORY RECYCLING ACKNOWLEDGEMENT:** Phone numbers are frequently recycled. You must explicitly state this as a potential source of error in your summary. If multiple names are associated with the number from different time periods, you MUST report this and use timestamps or other evidence to determine the most recent owner.

        **EXECUTION PROTOCOL:**
        1.  **Current Owner Identification & Verification (Top Priority):**
            *   Identify the most likely **current** owner of the number.
            *   For the name found, you MUST provide a **Verification Summary** explaining *why* you have linked this name to the number, citing the public evidence and its approximate date (e.g., "Name listed on a public Facebook profile with this number, profile last updated 2 months ago," "Linked on a public business directory from 2023").
            *   State a **Confidence Level** (High, Medium, Low) for the owner's identity based on the quality, quantity, and **recency** of the evidence.

        2.  **Public Activity & "Last Seen" Analysis:**
            *   Find the most recent, timestamped public activity associated with the number. This includes public posts, comments, profile updates, or being tagged in public content.
            *   Synthesize this into a precise "Last Seen" estimate for each platform (e.g., "Active in a public group on [Date]," "Last public post on [Date]"). If no timestamped activity is found, state "Public activity date undetermined."

        3.  **Public Contact Network Mapping:**
            *   Identify individuals publicly associated with the number, focusing on recent interactions.
            *   For each contact, you must specify the source and nature of the public connection.

        **CRITICAL ENFORCEMENT & OUTPUT FORMAT:**
        *   Provide a JSON object adhering to the specified schema.
        *   The main summary must start by stating the confidence level of the findings and explicitly reiterating that all data is from public sources and may not reflect the current owner due to number recycling.`;
        break;
      case 'email':
        queryForDisplay = inputs.email;
        prompt = `**Email Intelligence Mission Directive:**
        **Target Email:** ${inputs.email}
        **Objective:** Uncover the digital footprint, professional identity, and all associated names/aliases linked to the email address.
        **Methodology:** Act as a corporate intelligence analyst. Use OSINT techniques to probe for the target's full name and any variations or usernames used. Search public records, data breach repositories, and professional networking sites (especially LinkedIn). **Explicitly search for different names or profiles that are registered using this single email address.**
        **CRITICAL ENFORCEMENT:**
        1.  **VERIFY ALL DATA:** Corroborate findings from multiple sources.
        2.  **NO FABRICATION:** Do not invent job titles, social profiles, or aliases.
        3.  **DELIVERABLES:** Provide a concise report of the person's primary name, any other associated names/aliases, job title, company, and links to any verified public profiles.`;
        break;
      case 'username':
        queryForDisplay = inputs.username;
        prompt = `**Advanced Cross-Platform Username Footprinting Mission:**
        **Target Username:** "${inputs.username}"
        **Objective:** Conduct a deep and wide search to find every public profile associated with this username, including common variations.
        **Mandatory Search Protocol:**
        1.  **Prioritize Exact Match:** First, search for the exact username \`"${inputs.username}"\` across all platforms.
        2.  **Search for Common Variations:** Systematically search for variations of the username. Examples: \`"${inputs.username.replace(/[\._-]/g, '')}"\`, \`"${inputs.username}_"\`, \`"_${inputs.username}"\`, \`"${inputs.username.replace(/_/g, '.')}"\`.
        3.  **Extensive Platform Scan:** Use precise search engine queries for each platform. Examples: \`site:twitter.com ("${inputs.username}" OR "${inputs.username}_")\`, \`site:instagram.com "${inputs.username}"\`, \`site:github.com "${inputs.username}"\`.
        4.  **Minimum Scan List (Expanded):**
            *   **Major Social:** Twitter/X, Instagram, Facebook, TikTok, LinkedIn, Pinterest, Reddit.
            *   **Professional/Creative:** GitHub, Behance, Dribbble, DeviantArt, SoundCloud.
            *   **Gaming:** Steam, PSN Profiles (e.g., search on PSNProfiles.com), Xbox GamerTags (e.g., search on TrueAchievements).
            *   **Forums & Misc:** Search for the username in common forum software signatures or profiles.

        **CRITICAL ENFORCEMENT:**
        1.  **Categorize Findings:** Clearly distinguish between **"Exact Match"** and **"High-Confidence Variation"**. A variation is high-confidence if the profile picture, name, or bio content strongly correlates with other found profiles.
        2.  **VERIFY ACCESSIBILITY:** Ensure all links lead to active, public profiles. Do not include private or deleted accounts.
        3.  **NO LOW-CONFIDENCE GUESSES:** Do not include profiles with similar but unrelated usernames.

        **Deliverables:** A structured report listing all discovered profiles. For each profile, provide the direct URL, the platform, and categorize it as either an "Exact Match" or a "High-Confidence Variation," briefly noting the reason for the confidence (e.g., "Same profile picture as Instagram").`;
        break;
      case 'social':
        queryForDisplay = inputs.social;
        prompt = `**Social Profile Intelligence Analysis:**
        **Target URL:** ${inputs.social}
        **Mission:** Pivot from this single profile to map the target's entire public digital ecosystem.
        **Execution Plan:**
        1.  **Profile Deconstruction:** From the target URL, extract the full name, username, bio details, and any linked websites.
        2.  **Cross-Platform Search:** Use the extracted name and username to perform targeted searches on other major platforms (LinkedIn, Facebook, Twitter/X, Instagram, GitHub, etc.).
        3.  **Network Mapping:** Analyze the target's *public* friends/followers list and recent interactions (public comments, tags) to identify 3-5 key associates or frequently interacting public accounts.
        **CRITICAL ENFORCEMENT:**
        1.  **PUBLIC DATA ONLY:** The entire report must be based on publicly available data.
        2.  **VERIFY ALL FINDINGS:** Do not make assumptions. Confirm associations before reporting them.
        **Deliverables:** A detailed intelligence report including the verified full name, a list of other discovered social profiles with URLs, and a summary of their key public network associates.`;
        break;
      case 'linkedin':
        queryForDisplay = inputs.linkedin;
        prompt = `**LinkedIn Profile Acquisition:**
        **Target:** ${inputs.linkedin}
        **Objective:** Locate the official LinkedIn profile URL for the specified individual or company.
        **Methodology:** Use advanced search techniques within the LinkedIn ecosystem and public web to pinpoint the correct profile. Prioritize exact matches for name and current company if provided.
        **CRITICAL ENFORCEMENT:**
        1.  **ACCURACY IS PARAMOUNT:** Provide the single most likely, direct URL to the main profile page.
        2.  **NO AMBIGUITY:** If multiple profiles match, provide the one with the most connections or most detailed information that suggests it is the correct one.
        3.  **DELIVERABLES:** The direct URL to the LinkedIn profile.`;
        break;
      case 'urlAnalysis':
        queryForDisplay = inputs.url;
        prompt = `**Forensic URL & Associated Persons Analysis:**
        **Target URL:** ${inputs.url}
        **Mission:** Conduct a comprehensive forensic analysis of the target URL to identify all key individuals and entities associated with it. Your search is not limited to the legal owner.
        **Execution Protocol:**
        1.  **On-Site Data Extraction:** Scour the website's content (About Us, Team, Contact, blog authors, testimonials) for names, emails, and phone numbers.
        2.  **Reputation & Link Analysis:** Use advanced search operators (\`link:${inputs.url}\`, \`related:${inputs.url}\`) to see how other sites refer to this URL and who they associate with it. Analyze linked social media profiles for key personnel.
        3.  **Public Records & WHOIS:** Search for publicly accessible WHOIS information and analyze historical data from web archives to find past owners or contributors.
        4.  **Name Synthesis:** Synthesize all findings to create a list of primary and secondary associated individuals. **Include similar names or variations found during the investigation, noting the context.** For example, if a "Robert Smith" is listed as CEO but blog posts are by "Bob Smith", this connection must be noted.
        **CRITICAL ENFORCEMENT:**
        1.  **EVIDENCE-BASED REPORTING:** Only report information directly found or strongly inferred from public data. Note the source/context for each piece of information.
        2.  **NO INVENTIONS:** Do not invent connections or names.
        **Deliverables:** A structured summary identifying potential owners, key personnel, and other associated individuals, including any similar or alternative names discovered and the context of their association with the URL.`;
        break;
    }

    setCurrentQuery(queryForDisplay);

    try {
      const result = await performSearch(prompt, searchType);
      setSearchResult(result);

      // Add to history on successful search
      const getRelevantInputs = (): Partial<AppInputs> => {
        switch (searchType) {
          case 'fullName': return { fullName: inputs.fullName, platform: inputs.platform };
          case 'nameParts': return { firstName: inputs.firstName, lastName: inputs.lastName, platforms: inputs.platforms, country: inputs.country };
          case 'nameToPhone': return { fullName: inputs.fullName, country: inputs.country };
          case 'phone':
          case 'truecaller': return { phone: inputs.phone, countryCode: inputs.countryCode, phonePlatforms: inputs.phonePlatforms, phoneOwnerName: inputs.phoneOwnerName };
          case 'email': return { email: inputs.email };
          case 'username': return { username: inputs.username };
          case 'social': return { social: inputs.social };
          case 'linkedin': return { linkedin: inputs.linkedin };
          case 'urlAnalysis': return { url: inputs.url };
          default: return {};
        }
      };

      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        searchType,
        displayQuery: queryForDisplay,
        inputs: getRelevantInputs(),
      };

      setHistory(prevHistory => {
        const filteredHistory = prevHistory.filter(item => item.displayQuery !== queryForDisplay || item.searchType !== searchType);
        const updatedHistory = [newHistoryItem, ...filteredHistory].slice(0, 10);
        localStorage.setItem('smartSearchHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'RATE_LIMIT_EXCEEDED') {
          setError(t.rateLimitError);
          setCooldown(60);
        } else {
          setError(err.message);
        }
      } else {
        setError('An unknown error occurred.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchType, inputs, t]);

  useEffect(() => {
    if (searchTrigger) {
      handleSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTrigger, handleSearch]);

  const handleHistoryClick = useCallback((item: HistoryItem) => {
    setSearchType(item.searchType);
    setInputs({ ...initialInputs, ...item.inputs });
    setSearchTrigger(Date.now());
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('smartSearchHistory');
  }, []);

  const toggleLang = () => {
    setLang(current => current === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <main className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="text-start">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="search" className="h-10 w-10 text-blue-500" />
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                {t.title}
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t.subtitle}
            </p>
          </div>
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label={`Switch to ${lang === 'en' ? 'Arabic' : 'English'}`}
            title={t.tooltip_langButton}
          >
            <Icon name="language" className="h-5 w-5"/>
            <span>{lang === 'en' ? 'ع' : 'EN'}</span>
          </button>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <SearchFilter 
            lang={lang}
            searchType={searchType}
            setSearchType={setSearchType}
            inputs={inputs}
            setInputs={setInputs}
            onSearch={handleSearch}
            isLoading={isLoading}
            cooldown={cooldown}
          />
        </div>

        <RecentSearches
          history={history}
          onItemClick={handleHistoryClick}
          onClear={handleClearHistory}
          lang={lang}
        />

        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        )}

        {error && (
            <div className="mt-8 bg-red-100 border-s-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
                <p className="font-bold">{t.error}</p>
                <p>{error}</p>
            </div>
        )}

        {searchResult && !isLoading && (
          <div className="mt-8">
            <ResultsDisplay result={searchResult} query={currentQuery} lang={lang} />
          </div>
        )}

        {!isLoading && !error && !searchResult && history.length === 0 && (
            <div className="mt-8 text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <Icon name="sparkles" className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">{t.readyToSearch}</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">{t.getStarted}</p>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;