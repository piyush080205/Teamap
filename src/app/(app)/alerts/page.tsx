'use client';

import { incidents as initialIncidents } from "@/lib/data";
import { IncidentCard } from "@/components/incident-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListFilter } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import type { Incident } from "@/lib/types";

// Combine the duplicated incidents into a single list
const incidentsData = [
  ...initialIncidents,
  ...initialIncidents.map((incident) => ({
    ...incident,
    id: `${incident.id}-duplicate`,
  })),
];

const severityOrder: Record<Incident['severity'], number> = {
  Critical: 3,
  Warning: 2,
  Info: 1,
};

function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  dist = dist * 1.609344; // convert to KM
  return dist;
}

export default function AlertsPage() {
  const [sortBy, setSortBy] = useState("distance");
  const [incidents, setIncidents] = useState<Incident[]>(incidentsData);
  const [userPosition, setUserPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location for sorting:", error);
          // Fallback to a default location if permission is denied
          setUserPosition({ latitude: 19.0760, longitude: 72.8777 }); // Mumbai
        }
      );
    } else {
        // Fallback for browsers that don't support geolocation
        setUserPosition({ latitude: 19.0760, longitude: 72.8777 }); // Mumbai
    }
  }, []);

  const handleRemoveIncident = (id: string) => {
    setIncidents(prevIncidents => prevIncidents.filter(incident => incident.id !== id));
  };

  const sortedIncidents = useMemo(() => {
    const newSortedIncidents = [...incidents];

    switch (sortBy) {
      case "time":
        newSortedIncidents.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case "severity":
        newSortedIncidents.sort(
          (a, b) => (severityOrder[b.severity] ?? 0) - (severityOrder[a.severity] ?? 0)
        );
        break;
      case "distance":
        if (userPosition) {
          newSortedIncidents.sort((a, b) => {
            const distA = getDistance(
              userPosition.latitude,
              userPosition.longitude,
              a.location.lat,
              a.location.lng
            );
            const distB = getDistance(
              userPosition.latitude,
              userPosition.longitude,
              b.location.lat,
              b.location.lng
            );
            return distA - distB;
          });
        }
        break;
      default:
        break;
    }
    return newSortedIncidents;
  }, [incidents, sortBy, userPosition]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold">Nearby Alerts</h1>
        <div className="flex items-center gap-2">
          <ListFilter className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="time">Most Recent</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedIncidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} onRemove={handleRemoveIncident} />
        ))}
      </div>
    </div>
  );
}
