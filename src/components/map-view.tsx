"use client";

import Map, { Marker, Popup, type MapRef } from "react-map-gl/maplibre";
import { useState, useEffect, useRef } from "react";
import { incidents } from "@/lib/data";
import type { Incident } from "@/lib/types";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MapPin } from "lucide-react";

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
  const apiKey = process.env.NEXT_PUBLIC_STADIA_MAPS_API_KEY;
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [userPosition, setUserPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [hasFlownToLocation, setHasFlownToLocation] = useState(false);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting user location:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    if (userPosition && mapRef.current && !hasFlownToLocation) {
      mapRef.current.flyTo({
        center: [userPosition.longitude, userPosition.latitude],
        zoom: 14,
      });
      setHasFlownToLocation(true);
    }
  }, [userPosition, hasFlownToLocation]);

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/50 rounded-lg">
        <div className="text-center p-4">
          <h3 className="font-headline text-lg font-semibold">Map Unavailable</h3>
          <p className="text-muted-foreground text-sm">
            The Stadia Maps API Key is missing. Please configure it in your environment variables as NEXT_PUBLIC_STADIA_MAPS_API_KEY.
          </p>
        </div>
      </div>
    );
  }

  const initialPosition = { latitude: 34.0522, longitude: -118.2437 };

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        ...initialPosition,
        zoom: 12,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={`https://tiles.stadiamaps.com/styles/alidade_smooth.json?api_key=${apiKey}`}
      className="w-full h-full rounded-lg"
    >
      {incidents.map((incident) => (
        <Marker
          key={incident.id}
          longitude={incident.location.lng}
          latitude={incident.location.lat}
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setSelectedIncident(incident)
          }}
          anchor="bottom"
        >
          <MapPin
            className="h-8 w-8 cursor-pointer"
            fill={getPinColor(incident)}
            stroke="white"
          />
        </Marker>
      ))}

      {userPosition && (
        <Marker
          longitude={userPosition.longitude}
          latitude={userPosition.latitude}
        >
          <div className="h-4 w-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
        </Marker>
      )}

      {selectedIncident && (
        <Popup
          longitude={selectedIncident.location.lng}
          latitude={selectedIncident.location.lat}
          onClose={() => setSelectedIncident(null)}
          anchor="top"
          closeButton={true}
          closeOnClick={false}
          offset={30}
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
        </Popup>
      )}
    </Map>
  );
}
