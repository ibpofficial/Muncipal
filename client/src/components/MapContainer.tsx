import React from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { MapWorkOrder, RoadAsset, Crew } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { MapPin, Navigation, Eye } from 'lucide-react';

// Fix default leaflet icon paths
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
  selectedWorkOrderId?: string | null;
  onSelectWorkOrder?: (workOrderId: string) => void;
  center?: [number, number];
  zoom?: number;
}

export const CommandMap: React.FC<MapContainerProps> = ({
  workOrders,
  assets = [],
  crews = [],
  selectedWorkOrderId,
  onSelectWorkOrder,
  center = [12.9716, 77.5946],
  zoom = 13,
}) => {
  const getMarkerColor = (band: string) => {
    switch (band) {
      case 'CRITICAL':
        return '#EF4444';
      case 'HIGH':
        return '#F97316';
      case 'MEDIUM':
        return '#EAB308';
      case 'LOW':
        return '#22C55E';
      default:
        return '#3B82F6';
    }
  };

  return (
    <div className="w-full h-full relative rounded-lg border border-[#262D38] overflow-hidden shadow-inner">
      <LeafletMap
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        {/* CartoDB Dark Matter Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Work Order Location Circle Markers */}
        {workOrders.map((wo) => {
          const color = getMarkerColor(wo.priorityBand);
          const isSelected = selectedWorkOrderId === wo.workOrderId;

          return (
            <CircleMarker
              key={wo.workOrderId}
              center={[wo.latitude, wo.longitude]}
              radius={isSelected ? 10 : 7}
              pathOptions={{
                fillColor: color,
                fillOpacity: isSelected ? 0.95 : 0.8,
                color: isSelected ? '#FFFFFF' : color,
                weight: isSelected ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => onSelectWorkOrder && onSelectWorkOrder(wo.workOrderId),
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-[#262D38] pb-1.5">
                    <span className="font-mono text-xs font-bold text-[#F8FAFC]">
                      {wo.workOrderId}
                    </span>
                    <PriorityBadge band={wo.priorityBand} size="sm" />
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[#A8B0BE]">
                      <span>Priority Score:</span>
                      <span className="font-mono font-bold text-[#F5B800] text-sm">
                        {wo.priorityScore} / 100
                      </span>
                    </div>

                    <div className="flex items-center text-[#6B7280]">
                      <MapPin className="w-3 h-3 mr-1 text-[#F5B800] shrink-0" />
                      <span className="truncate">{wo.fullWardName}</span>
                    </div>

                    <p className="text-[11px] text-[#A8B0BE] line-clamp-2 italic pt-1 border-t border-[#262D38]/50">
                      "{wo.description}"
                    </p>
                  </div>

                  {onSelectWorkOrder && (
                    <button
                      onClick={() => onSelectWorkOrder(wo.workOrderId)}
                      className="w-full mt-2 py-1.5 bg-[#F5B800] hover:bg-[#E0A700] text-[#090B10] font-mono text-xs font-bold rounded flex items-center justify-center space-x-1 transition-colors"
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

        {/* Road Asset Markers (Schools, Hospitals, Bus Stops) */}
        {assets.map((asset) => (
          <CircleMarker
            key={asset.id}
            center={[asset.latitude, asset.longitude]}
            radius={4}
            pathOptions={{
              fillColor: '#3B82F6',
              fillOpacity: 0.6,
              color: '#60A5FA',
              weight: 1,
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <span className="font-mono font-semibold text-[#60A5FA] block">
                  [{asset.type}] {asset.name}
                </span>
                <span className="text-[10px] text-[#A8B0BE]">Asset Importance: {asset.importance} / 100</span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </LeafletMap>
    </div>
  );
};
