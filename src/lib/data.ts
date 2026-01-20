import type { Incident } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const userAvatar1 = PlaceHolderImages.find(p => p.id === 'user-avatar-1')?.imageUrl ?? "https://picsum.photos/seed/101/40/40";
const userAvatar2 = PlaceHolderImages.find(p => p.id === 'user-avatar-2')?.imageUrl ?? "https://picsum.photos/seed/102/40/40";
const userAvatar3 = PlaceHolderImages.find(p => p.id === 'user-avatar-3')?.imageUrl ?? "https://picsum.photos/seed/103/40/40";
const userAvatar4 = PlaceHolderImages.find(p => p.id === 'user-avatar-4')?.imageUrl ?? "https://picsum.photos/seed/104/40/40";
const userAvatar5 = PlaceHolderImages.find(p => p.id === 'user-avatar-5')?.imageUrl ?? "https://picsum.photos/seed/105/40/40";
const userAvatar6 = PlaceHolderImages.find(p => p.id === 'user-avatar-6')?.imageUrl ?? "https://picsum.photos/seed/106/40/40";

const incidentPhoto1 = PlaceHolderImages.find(p => p.id === 'incident-photo-1')?.imageUrl;
const incidentFire1 = PlaceHolderImages.find(p => p.id === 'incident-fire-1')?.imageUrl;
const incidentHazard1 = PlaceHolderImages.find(p => p.id === 'incident-hazard-1')?.imageUrl;
const incidentCrime1 = PlaceHolderImages.find(p => p.id === 'incident-crime-1')?.imageUrl;
const incidentMedical1 = PlaceHolderImages.find(p => p.id === 'incident-medical-1')?.imageUrl;
const incidentWeather1 = PlaceHolderImages.find(p => p.id === 'incident-weather-1')?.imageUrl;
const incidentOther1 = PlaceHolderImages.find(p => p.id === 'incident-other-1')?.imageUrl;


export const incidents: Incident[] = [
  {
    id: '1',
    type: 'Accident',
    location: { lat: 18.9440, lng: 72.8239 },
    address: 'Marine Drive, Mumbai, Maharashtra',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    description: 'Multi-car pile-up near the promenade. Expect heavy delays.',
    severity: 'Critical',
    status: 'Verified',
    verificationCount: 5,
    user: { name: 'Rohan Joshi', avatarUrl: userAvatar1 },
    imageUrl: incidentPhoto1,
  },
  {
    id: '2',
    type: 'Fire',
    location: { lat: 18.9398, lng: 72.8355 },
    address: 'Near Chhatrapati Shivaji Terminus, Mumbai',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    description: 'Minor fire in a food stall. Situation is under control.',
    severity: 'Warning',
    status: 'Verifying',
    verificationCount: 2,
    user: { name: 'Priya Kulkarni', avatarUrl: userAvatar2 },
    imageUrl: incidentFire1,
  },
  {
    id: '3',
    type: 'Hazard',
    location: { lat: 19.0309, lng: 72.8193 },
    address: 'Bandra-Worli Sea Link, Mumbai',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    description: 'Debris on the road from a truck. Drive with caution.',
    severity: 'Info',
    status: 'Verified',
    verificationCount: 3,
    user: { name: 'Sameer Patil', avatarUrl: userAvatar3 },
    imageUrl: incidentHazard1,
  },
    {
    id: '4',
    type: 'Crime',
    location: { lat: 18.9161, lng: 72.8318 },
    address: 'Colaba Causeway, Mumbai',
    timestamp: Date.now() - 1000 * 60 * 2, // 2 minutes ago
    description: 'Pickpocketing incident reported by a tourist. Unverified.',
    severity: 'Warning',
    status: 'Unverified',
    verificationCount: 0,
    user: { name: 'Anonymous', avatarUrl: userAvatar4 },
    imageUrl: incidentCrime1,
  },
  {
    id: '5',
    type: 'Medical',
    location: { lat: 19.1065, lng: 72.8265 },
    address: 'Juhu Beach, Mumbai',
    timestamp: Date.now() - 1000 * 60 * 8, // 8 minutes ago
    description: 'Person reported feeling unwell, needs medical check-up.',
    severity: 'Critical',
    status: 'Verifying',
    verificationCount: 1,
    user: { name: 'Anita Rao', avatarUrl: userAvatar5 },
    imageUrl: incidentMedical1,
  },
  {
    id: '6',
    type: 'Weather',
    location: { lat: 18.9220, lng: 72.8347 },
    address: 'Near Gateway of India, Mumbai',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 minutes ago
    description: 'High tide warning. Area is crowded, please be careful.',
    severity: 'Info',
    status: 'Verified',
    verificationCount: 7,
    user: { name: 'Vikram Deshmukh', avatarUrl: userAvatar6 },
    imageUrl: incidentWeather1,
  },
  {
    id: '7',
    type: 'Other',
    location: { lat: 19.0170, lng: 72.8302 },
    address: 'Siddhivinayak Temple, Mumbai',
    timestamp: Date.now() - 1000 * 60 * 22, // 22 minutes ago
    description: 'Large crowd causing network congestion in the area.',
    severity: 'Warning',
    status: 'False',
    verificationCount: 4,
    user: { name: 'Sanjay Pawar', avatarUrl: userAvatar1 },
    imageUrl: incidentOther1,
  }
];
