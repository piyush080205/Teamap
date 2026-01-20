# **App Name**: TeaMaps

## Core Features:

- Incident Reporting: Report incidents with details like type, location, photo/video, and required help.
- AI-Assisted Verification: Leverage Genkit for AI-assisted image and metadata validation to assess incident authenticity.
- Crowd Verification: Enable nearby users to confirm or deny the incident, contributing to a trust score.
- Hyperlocal Alerts: Broadcast alerts to users within a 1 km radius of the incident, using location-aware delivery.
- Network-Resilient Notifications: Utilize cell-tower forwarding and Twilio SMS/call fallback to ensure alerts reach users in low-bandwidth zones.
- Real-Time Map Visualization: Display a live map with color-coded incident markers based on severity and verification status.
- Location awareness: Using cell-tower data from Unwired Labs to improve user location if GPS is unavailable

## Style Guidelines:

- Primary color: Saturated cyan (#46B4F4) to suggest calm focus and clarity, given the app's purpose of coordinating a safe response to incidents.
- Background color: Light cyan (#E5F5FC), visibly of the same hue as the primary, but heavily desaturated and light in order to create a bright and airy feel, which implies a more positive community sentiment rather than a fearful or concerned sentiment.
- Accent color: Analogous blue (#4680F4), significantly different from the primary in both brightness and saturation to create good contrast. This can be used to highlight urgent issues on the map, or important but low-priority notifications.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and short amounts of text, and 'Inter' (sans-serif) for body.
- Use clear and recognizable icons for incident types and severity levels.
- Map-centric design with floating action buttons for key functions like reporting incidents.
- Subtle animations for real-time updates and status changes.