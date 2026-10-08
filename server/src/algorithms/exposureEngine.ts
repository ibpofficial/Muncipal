export interface RoadAssetData {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  importance: number;
}

export interface ExposureResult {
  score: number;
  reasons: string[];
  nearbyAssets: { asset: RoadAssetData; distanceMeters: number }[];
}

/**
 * Calculate Haversine distance in meters between two lat/lng points
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function calculateExposure(
  complaintLat: number,
  complaintLng: number,
  assets: RoadAssetData[]
): ExposureResult {
  const reasons: string[] = [];
  const nearbyAssets: { asset: RoadAssetData; distanceMeters: number }[] = [];

  let accumulatedExposure = 15; // Base exposure score

  for (const asset of assets) {
    const dist = calculateDistanceMeters(
      complaintLat,
      complaintLng,
      asset.latitude,
      asset.longitude
    );

    if (dist <= 1000) {
      nearbyAssets.push({ asset, distanceMeters: dist });

      let multiplier = 0;
      let distLabel = '';

      if (dist <= 100) {
        multiplier = 1.0;
        distLabel = `${dist}m`;
      } else if (dist <= 300) {
        multiplier = 0.8;
        distLabel = `${dist}m`;
      } else if (dist <= 500) {
        multiplier = 0.5;
        distLabel = `${dist}m`;
      } else if (dist <= 1000) {
        multiplier = 0.2;
        distLabel = `${Math.round(dist / 100) / 10}km`;
      }

      const impactPoints = (asset.importance / 100) * 45 * multiplier;
      accumulatedExposure += impactPoints;

      if (dist <= 500) {
        const assetTypeName = asset.type.replace('_', ' ').toLowerCase();
        reasons.push(`${asset.name} (${assetTypeName}) within ${distLabel}`);
      }
    }
  }

  // Sort nearby assets by distance ascending
  nearbyAssets.sort((a, b) => a.distanceMeters - b.distanceMeters);

  const score = Math.min(100, Math.round(accumulatedExposure));

  if (reasons.length === 0) {
    reasons.push('Low immediate public asset density nearby');
  }

  return {
    score,
    reasons: reasons.slice(0, 3), // Top 3 reasons
    nearbyAssets: nearbyAssets.slice(0, 5), // Top 5 closest assets
  };
}
