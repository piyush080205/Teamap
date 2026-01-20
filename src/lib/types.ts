export type IncidentStatus = 'Verified' | 'Verifying' | 'Unverified' | 'False';
export type IncidentSeverity = 'Critical' | 'Warning' | 'Info';
export type IncidentType = 'Fire' | 'Accident' | 'Medical' | 'Crime' | 'Hazard' | 'Weather' | 'Other';

export type Incident = {
  id: string;
  type: IncidentType;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  timestamp: number;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  verificationCount: number;
  user: {
    name: string;
    avatarUrl: string;
  };
  imageUrl?: string;
};

export type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
};
