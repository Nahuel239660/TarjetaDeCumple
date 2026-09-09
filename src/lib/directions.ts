import type { LocationSettings } from "@/lib/models";

export function hasCoordinates(location: LocationSettings): boolean {
  return Number.isFinite(Number(location.latitude)) && Number.isFinite(Number(location.longitude)) && location.latitude.trim() !== "" && location.longitude.trim() !== "";
}

export function getDirectionsUrl(location: LocationSettings): string {
  if (location.directionsProvider === "custom" && location.customDirectionsUrl.trim()) {
    return location.customDirectionsUrl.trim();
  }

  const destination = hasCoordinates(location)
    ? `${location.latitude},${location.longitude}`
    : location.address.trim();
  if (!destination) return "";

  if (location.directionsProvider === "waze") {
    return `https://www.waze.com/ul?q=${encodeURIComponent(destination)}&navigate=yes`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

export function getOpenStreetMapEmbedUrl(location: LocationSettings): string {
  if (!hasCoordinates(location)) return "";
  const lat = Number(location.latitude);
  const lng = Number(location.longitude);
  const delta = 0.008;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`;
}
