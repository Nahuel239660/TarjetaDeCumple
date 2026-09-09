"use client";

import { getOpenStreetMapEmbedUrl, hasCoordinates } from "@/lib/directions";
import type { LocationSettings } from "@/lib/models";

export function MapPreview({ location, compact = false }: { location: LocationSettings; compact?: boolean }) {
  const src = getOpenStreetMapEmbedUrl(location);
  const valid = hasCoordinates(location);

  return (
    <div className={compact ? "map-preview map-preview--compact" : "map-preview"}>
      {valid ? (
        <iframe
          key={src}
          src={src}
          title={`Mapa de ${location.venue || "la ubicación"}`}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="map-placeholder">
          <span className="map-pin" aria-hidden="true" />
          <p>{location.address || "Completá la dirección o las coordenadas para ver el mapa."}</p>
        </div>
      )}
    </div>
  );
}
