import React from 'react';
import { MapContainer as LeafletMap, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { MapWorkOrder, RoadAsset, Crew, ScheduledJobItem } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { MapPin, Eye } from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapContainerProps {
  workOrders: MapWorkOrder[];
  assets?: RoadAsset[];
  crews?: Crew[];
  routeJobs?: ScheduledJobItem[];
  selectedWorkOrderId?: string | null;
  onSelectWorkOrder?: (workOrderId: string) => void;
  center?: [number, number];
  zoom?: number;
}

export const CommandMap: React.FC<MapContainerProps> = ({
  workOrders,
  assets = [],
  crews = [],
  routeJobs = [],
  selectedWorkOrderId,
  onSelectWorkOrder,
  center = [12.9716, 77.5946],
  zoom = 13,
}) => {
  const getMarkerColor = (band: string) => {
    switch (band) {
      case 'CRITICAL':
        return '#DC2626';
      case 'HIGH':
        return '#EA580C';
      case 'MEDIUM':
        return '#D97706';
      case 'LOW':
        return '#059669';
      default:
        return '#2563EB';
    }
  };

  // Route Polyline Coordinates if routeJobs provided
  const routePolylineCoords: [number, number][] = routeJobs.map((j) => [j.latitude, j.longitude]);

  return (
    <div className="w-full h-full relative rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <LeafletMap
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        {/* CartoDB Positron Light Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Route Line if Route Sequence active */}
        {routePolylineCoords.length > 1 && (
          <Polyline
            positions={routePolylineCoords}
            pathOptions={{ color: '#1D4ED8', weight: 4, dashArray: '6, 8', opacity: 0.8 }}
          />
        )}

        {/* Route Sequence Numbered Stop Markers */}
        {routeJobs.map((job) => (
          <CircleMarker
            key={`route-${job.workOrderId}`}
            center={[job.latitude, job.longitude]}
            radius={12}
            pathOptions={{
              fillColor: '#1E3A8A',
              fillOpacity: 0.95,
              color: '#FFFFFF',
              weight: 2,
            }}
          >
            <Popup>
              <div className="p-1 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-blue-700">STOP #{job.sequence}</span>
                  <PriorityBadge band={job.priorityBand} size="sm" />
                </div>
                <div className="text-slate-900 font-bold">{job.workOrderNumber}</div>
                <div className="text-slate-600 text-[11px]">{job.scheduledStart} - {job.scheduledEnd}</div>
                <div className="text-slate-500 line-clamp-1 italic">{job.description}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Work Order Location Circle Markers */}
        {routeJobs.length === 0 &&
          workOrders.map((wo) => {
            const color = getMarkerColor(wo.priorityBand);
            const isSelected = selectedWorkOrderId === wo.workOrderId;

            return (
              <CircleMarker
                key={wo.workOrderId}
                center={[wo.latitude, wo.longitude]}
                radius={isSelected ? 10 : 7}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: isSelected ? 0.95 : 0.85,
                  color: isSelected ? '#FFFFFF' : color,
                  weight: isSelected ? 3 : 1.5,
                }}
                eventHandlers={{
                  click: () => onSelectWorkOrder && onSelectWorkOrder(wo.workOrderId),
                }}
              >
                <Popup>
                  <div className="p-1 space-y-2 min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {wo.workOrderId}
                      </span>
                      <PriorityBadge band={wo.priorityBand} size="sm" />
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-600 font-mono">
                        <span>Priority Score:</span>
                        <span className="font-bold text-blue-700 text-sm">
                          {wo.priorityScore} / 100
                        </span>
                      </div>

                      <div className="flex items-center text-slate-500 text-[11px]">
                        <MapPin className="w-3 h-3 mr-1 text-blue-600 shrink-0" />
                        <span className="truncate">{wo.fullWardName}</span>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 italic pt-1 border-t border-slate-100">
                        "{wo.description}"
                      </p>
                    </div>

                    {onSelectWorkOrder && (
                      <button
                        onClick={() => onSelectWorkOrder(wo.workOrderId)}
                        className="w-full mt-2 py-1.5 bg-navy-900 hover:bg-navy-800 text-white font-mono text-xs font-bold rounded-md flex items-center justify-center space-x-1 transition-colors shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Decision Details</span>
                      </button>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* Road Asset Markers */}
        {assets.map((asset) => (
          <CircleMarker
            key={asset.id}
            center={[asset.latitude, asset.longitude]}
            radius={4}
            pathOptions={{
              fillColor: '#2563EB',
              fillOpacity: 0.6,
              color: '#1D4ED8',
              weight: 1,
            }}
          >
            <Popup>
              <div className="text-xs p-1 font-mono">
                <span className="font-bold text-blue-700 block">
                  [{asset.type}] {asset.name}
                </span>
                <span className="text-[10px] text-slate-500">Asset Importance: {asset.importance} / 100</span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </LeafletMap>
    </div>
  );
};
