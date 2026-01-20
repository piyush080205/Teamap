"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { useState } from "react";
import { incidents } from "@/lib/data";
import type { Incident } from "@/lib/types";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const markerColors = {
  Critical: "#F44336", // red
  Warning: "#FF9800", // orange
  Info: "#2196F3", // blue
  Unverified: "#9E9E9E", // grey
  Verified: "#4CAF50", // green (fallback)
  False: "#607D8B", // blue grey
};

const getPinColor = (incident: Incident) => {
  switch (incident.status) {
    case "Unverified":
      return markerColors.Unverified;
    case "Verifying":
      return markerColors.Warning;
    case "Verified":
      switch (incident.severity) {
        case "Critical":
          return markerColors.Critical;
        case "Warning":
          return markerColors.Warning;
        case "Info":
          return markerColors.Info;
        default:
          return markerColors.Verified;
      }
    case "False":
      return markerColors.False;
    default:
      return markerColors.Unverified;
  }
};

export function MapView() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/50 rounded-lg">
        <div className="text-center p-4">
          <h3 className="font-headline text-lg font-semibold">Map Unavailable</h3>
          <p className="text-muted-foreground text-sm">
            The Google Maps API Key is missing. Please configure it in your environment variables.
          </p>
        </div>
      </div>
    );
  }

  const position = { lat: 34.0522, lng: -118.2437 };

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={position}
        defaultZoom={13}
        mapId="teampaps-map-id"
        className="w-full h-full rounded-lg"
        gestureHandling={"greedy"}
        disableDefaultUI={true}
      >
        {incidents.map((incident) => (
          <AdvancedMarker
            key={incident.id}
            position={incident.location}
            onClick={() => setSelectedIncident(incident)}
          >
            <Pin
              background={getPinColor(incident)}
              borderColor={"white"}
              glyphColor={"white"}
            />
          </AdvancedMarker>
        ))}

        {selectedIncident && (
          <InfoWindow
            position={selectedIncident.location}
            onCloseClick={() => setSelectedIncident(null)}
          >
            <div className="p-2 w-64">
              <h3 className="font-headline text-md font-bold mb-1">{selectedIncident.type}</h3>
              <Badge variant={
                  selectedIncident.status === "Verified" ? "default" 
                  : selectedIncident.status === "Verifying" ? "secondary" 
                  : selectedIncident.status === "False" ? "destructive" 
                  : "outline"
                }>{selectedIncident.status}</Badge>
              <p className="text-sm text-muted-foreground mt-2">{selectedIncident.description}</p>
              <p className="text-xs text-muted-foreground mt-2">{selectedIncident.address}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Reported {formatDistanceToNow(new Date(selectedIncident.timestamp), { addSuffix: true })}
              </p>
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
