import { calculateDistanceMeters } from '../algorithms/exposureEngine';

export interface RouteWayPoint {
  lat: number;
  lng: number;
}

export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  geometry: [number, number][];
  isFallback: boolean;
  provider: string;
}

/**
 * Calculates road network route between origin and destination.
 * Uses OSRM public API with Haversine fallback.
 */
export async function getRoadRoute(
  origin: RouteWayPoint,
  destination: RouteWayPoint
): Promise<RouteResult> {
  const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 sec timeout

    const res = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: any = await res.json();
      if (data && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
        const durationMinutes = Math.round(route.duration / 60);

        // OSRM returns coordinates in [lng, lat] format, convert to Leaflet [lat, lng]
        const geometry: [number, number][] = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );

        return {
          distanceKm,
          durationMinutes,
          geometry,
          isFallback: false,
          provider: 'OSRM Road Network Routing',
        };
      }
    }
  } catch (err) {
    // Fallback on network timeout or failure
  }

  // Fallback: Haversine distance
  const distMeters = calculateDistanceMeters(
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng
  );
  const distanceKm = Math.round((distMeters / 1000) * 10) / 10;
  const durationMinutes = Math.round(distanceKm * 3) + 5; // ~3 mins per km + 5 mins buffer

  const geometry: [number, number][] = [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng],
  ];

  return {
    distanceKm,
    durationMinutes,
    geometry,
    isFallback: true,
    provider: 'Geographic Distance Fallback Engine',
  };
}

export async function getRouteEstimate(originLat: number, originLon: number, destLat: number, destLon: number) {
  return getRoadRoute({ lat: originLat, lng: originLon }, { lat: destLat, lng: destLon });
}

export async function getDailyPlanRouteGeometry(stops: { lat: number; lon: number; name: string }[]) {
  if (stops.length < 2) {
    return {
      totalDistanceKm: 0,
      totalDurationMinutes: 0,
      geometries: [],
    };
  }

  let totalDistanceKm = 0;
  let totalDurationMinutes = 0;
  const geometries: [number, number][][] = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const route = await getRoadRoute(
      { lat: stops[i].lat, lng: stops[i].lon },
      { lat: stops[i + 1].lat, lng: stops[i + 1].lon }
    );
    totalDistanceKm += route.distanceKm;
    totalDurationMinutes += route.durationMinutes;
    geometries.push(route.geometry);
  }

  return {
    totalDistanceKm: parseFloat(totalDistanceKm.toFixed(1)),
    totalDurationMinutes,
    geometries,
  };
}
