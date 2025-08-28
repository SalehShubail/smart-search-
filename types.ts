export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface SocialProfile {
  platform: string;
  nameOnPlatform?: string;
  username?: string;
}

export interface Contact {
  name: string;
  relationship?: string;
  source?: string;
}

export interface PlatformPresence {
  platform: string;
  isRegistered: boolean;
  lastSeen?: string;
  source: string;
}

export interface PhoneInfo {
  ownerName?: string;
  confidenceLevel?: string;
  nameVerificationSummary?: string;
  socialProfiles?: SocialProfile[];
  contactNetwork?: Contact[];
  presenceAnalysis?: PlatformPresence[];
  activitySummary?: string;
}

export interface SearchResult {
  text: string;
  sources: GroundingChunk[];
  phoneInfo?: PhoneInfo;
}

export type Lang = 'en' | 'ar';

export type SearchType = 'fullName' | 'nameParts' | 'phone' | 'email' | 'username' | 'social' | 'truecaller' | 'linkedin' | 'urlAnalysis' | 'nameToPhone';

export interface AppInputs {
  fullName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  platform: string;
  platforms: string[]; // For multi-select name search
  country: string; // For country filter
  phone: string;
  countryCode: string;
  email: string;
  username: string;
  social: string;
  linkedin: string;
  youtube: string;
  url: string;
  phonePlatforms: string[]; // For phone search platform multi-select
  phoneOwnerName: string; // For optional name verification in phone search
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  searchType: SearchType;
  inputs: Partial<AppInputs>;
  displayQuery: string;
}