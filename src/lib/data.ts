import type { Incident } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const userAvatar1 = PlaceHolderImages.find(p => p.id === 'user-avatar-1')?.imageUrl ?? "https://picsum.photos/seed/101/40/40";
const userAvatar2 = PlaceHolderImages.find(p => p.id === 'user-avatar-2')?.imageUrl ?? "https://picsum.photos/seed/102/40/40";
const userAvatar3 = PlaceHolderImages.find(p => p.id === 'user-avatar-3')?.imageUrl ?? "https://picsum.photos/seed/103/40/40";
const userAvatar4 = PlaceHolderImages.find(p => p.id === 'user-avatar-4')?.imageUrl ?? "https://picsum.photos/seed/104/40/40";
const userAvatar5 = PlaceHolderImages.find(p => p.id === 'user-avatar-5')?.imageUrl ?? "https://picsum.photos/seed/105/40/40";
const userAvatar6 = PlaceHolderImages.find(p => p.id === 'user-avatar-6')?.imageUrl ?? "https://picsum.photos/seed/106/40/40";


export const incidents: Incident[] = [
  {
    id: '1',
    type: 'Accident',
    location: { lat: 28.6328, lng: 77.2197 },
    address: 'Connaught Place, New Delhi, Delhi',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    description: 'Collision between a car and a motorcycle. Heavy traffic congestion.',
    severity: 'Critical',
    status: 'Verified',
    verificationCount: 5,
    user: { name: 'Rohan Kumar', avatarUrl: userAvatar1 },
  },
  {
    id: '2',
    type: 'Fire',
    location: { lat: 28.6562, lng: 77.2410 },
    address: 'Chandni Chowk, Delhi',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    description: 'Smoke seen from a shop in the market area. Fire brigade alerted.',
    severity: 'Warning',
    status: 'Verifying',
    verificationCount: 2,
    user: { name: 'Priya Sharma', avatarUrl: userAvatar2 },
  },
  {
    id: '3',
    type: 'Hazard',
    location: { lat: 28.5495, lng: 77.2054 },
    address: 'Hauz Khas Village, New Delhi, Delhi',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    description: 'Large pothole causing issues for traffic.',
    severity: 'Info',
    status: 'Verified',
    verificationCount: 3,
    user: { name: 'Sameer Singh', avatarUrl: userAvatar3 },
  },
    {
    id: '4',
    type: 'Crime',
    location: { lat: 28.6525, lng: 77.1913 },
    address: 'Near Karol Bagh Market, New Delhi',
    timestamp: Date.now() - 1000 * 60 * 2, // 2 minutes ago
    description: 'Chain snatching reported. Pending verification.',
    severity: 'Warning',
    status: 'Unverified',
    verificationCount: 0,
    user: { name: 'Anonymous', avatarUrl: userAvatar4 },
  },
  {
    id: '5',
    type: 'Medical',
    location: { lat: 28.5671, lng: 77.2099 },
    address: 'Near AIIMS, New Delhi',
    timestamp: Date.now() - 1000 * 60 * 8, // 8 minutes ago
    description: 'Elderly person fainted, requires immediate medical assistance.',
    severity: 'Critical',
    status: 'Verifying',
    verificationCount: 1,
    user: { name: 'Anita Desai', avatarUrl: userAvatar5 },
  },
  {
    id: '6',
    type: 'Weather',
    location: { lat: 28.6129, lng: 77.2295 },
    address: 'Near India Gate, New Delhi',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 minutes ago
    description: 'Waterlogging due to heavy monsoon rain. Avoid the area.',
    severity: 'Info',
    status: 'Verified',
    verificationCount: 7,
    user: { name: 'Vikram Patel', avatarUrl: userAvatar6 },
  },
  {
    id: '7',
    type: 'Other',
    location: { lat: 28.5484, lng: 77.2520 },
    address: 'Nehru Place, New Delhi',
    timestamp: Date.now() - 1000 * 60 * 22, // 22 minutes ago
    description: 'Major power outage in the commercial complex.',
    severity: 'Warning',
    status: 'False',
    verificationCount: 4,
    user: { name: 'Sanjay Gupta', avatarUrl: userAvatar1 },
  }
];
