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
    location: { lat: 34.0522, lng: -118.2437 },
    address: '123 Main St, Los Angeles, CA',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    description: 'Two-car collision at the intersection. Traffic is blocked.',
    severity: 'Critical',
    status: 'Verified',
    verificationCount: 5,
    user: { name: 'John Doe', avatarUrl: userAvatar1 },
  },
  {
    id: '2',
    type: 'Fire',
    location: { lat: 34.055, lng: -118.25 },
    address: '456 Oak Ave, Los Angeles, CA',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    description: 'Smoke reported from a residential building.',
    severity: 'Warning',
    status: 'Verifying',
    verificationCount: 2,
    user: { name: 'Jane Smith', avatarUrl: userAvatar2 },
  },
  {
    id: '3',
    type: 'Hazard',
    location: { lat: 34.05, lng: -118.24 },
    address: '789 Pine Ln, Los Angeles, CA',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    description: 'Fallen tree blocking the road.',
    severity: 'Info',
    status: 'Verified',
    verificationCount: 3,
    user: { name: 'Sam Wilson', avatarUrl: userAvatar3 },
  },
    {
    id: '4',
    type: 'Crime',
    location: { lat: 34.048, lng: -118.245 },
    address: 'Near Grand Park',
    timestamp: Date.now() - 1000 * 60 * 2, // 2 minutes ago
    description: 'Suspicious activity reported. Pending verification.',
    severity: 'Warning',
    status: 'Unverified',
    verificationCount: 0,
    user: { name: 'Anonymous', avatarUrl: userAvatar4 },
  },
  {
    id: '5',
    type: 'Medical',
    location: { lat: 34.053, lng: -118.245 },
    address: '2nd St & Hill St, Los Angeles, CA',
    timestamp: Date.now() - 1000 * 60 * 8, // 8 minutes ago
    description: 'Person collapsed on the sidewalk, needs medical attention.',
    severity: 'Critical',
    status: 'Verifying',
    verificationCount: 1,
    user: { name: 'Maria Garcia', avatarUrl: userAvatar5 },
  },
  {
    id: '6',
    type: 'Weather',
    location: { lat: 34.051, lng: -118.242 },
    address: 'Grand Ave & 1st St, Los Angeles, CA',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 minutes ago
    description: 'Localized flooding due to heavy rain. Use caution.',
    severity: 'Info',
    status: 'Verified',
    verificationCount: 7,
    user: { name: 'Chris Lee', avatarUrl: userAvatar6 },
  },
  {
    id: '7',
    type: 'Other',
    location: { lat: 34.056, lng: -118.248 },
    address: 'Hope St & Temple St, Los Angeles, CA',
    timestamp: Date.now() - 1000 * 60 * 22, // 22 minutes ago
    description: 'Power outage in the area. Several traffic lights are out.',
    severity: 'Warning',
    status: 'False',
    verificationCount: 4,
    user: { name: 'David Chen', avatarUrl: userAvatar1 },
  }
];
