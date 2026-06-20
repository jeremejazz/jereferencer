export interface ParsedCoordinates {
  lat: number;
  lon: number;
}

/**
 * Parses a coordinate string in the format "lat, lon" or "lat lon".
 * Returns an object with lat and lon, or null if parsing fails.
 */
export function parseCoordinates(input: string): ParsedCoordinates | null {
  if (!input) return null;

  const cleaned = input.trim();

  // Split by comma first, or fallback to whitespace
  let parts = cleaned.split(",").map((s) => s.trim());
  if (parts.length !== 2) {
    parts = cleaned.split(/\s+/).map((s) => s.trim());
  }

  if (parts.length !== 2) {
    return null;
  }

  const lat = parseFloat(parts[0]);
  const lon = parseFloat(parts[1]);

  if (isNaN(lat) || isNaN(lon)) {
    return null;
  }

  // Validate latitude range [-90, 90] and longitude range [-180, 180]
  if (lat < -90 || lat > 90) return null;
  if (lon < -180 || lon > 180) return null;

  return { lat, lon };
}
