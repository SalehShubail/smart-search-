import type { IconProps } from '../components/Icon';

export interface SocialPlatform {
  id: string;
  name: string;
  icon: IconProps['name'];
}

export const socialPlatforms: SocialPlatform[] = [
  { id: 'Facebook', name: 'Facebook', icon: 'facebook' },
  { id: 'Twitter', name: 'Twitter / X', icon: 'twitter' },
  { id: 'LinkedIn', name: 'LinkedIn', icon: 'linkedin' },
  { id: 'Instagram', name: 'Instagram', icon: 'instagram' },
  { id: 'TikTok', name: 'TikTok', icon: 'tiktok' },
  { id: 'YouTube', name: 'YouTube', icon: 'youtube' },
  { id: 'Telegram', name: 'Telegram', icon: 'telegram' },
  { id: 'Snapchat', name: 'Snapchat', icon: 'snapchat' },
];