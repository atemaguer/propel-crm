import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { MapPin, Home, DollarSign, Bed, Bath, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const statusColors = {
  available: 'bg-emerald-100 text-emerald-700',
  under_contract: 'bg-amber-100 text-amber-700',
  sold: 'bg-slate-100 text-slate-700',
  rented: 'bg-blue-100 text-blue-700',
  off_market: 'bg-rose-100 text-rose-700'
};

const STATUSES = ['all', 'available', 'under_contract', 'sold', 'rented', 'off_market'];
const LISTING_TYPES = ['all', 'sale', 'rent'];

export default function MapView() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [listingTypeFilter, setListingTypeFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState(null);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list()
  });

  const propertiesWithLocation = properties.filter(p => p.latitude && p.longitude);

  const filteredProperties = propertiesWithLocation.filter(property => {
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesListingType = listingTypeFilter === 'all' || property.listing_type === listingTypeFilter;
    return matchesStatus && matchesListingType;
  });

  // Calculate center based on properties
  const getCenter = () => {
    if (filteredProperties.length === 0) return [40.7128, -74.0060]; // Default NYC
    const lats = filteredProperties.map(p => p.latitude);
    const lngs = filteredProperties.map(p => p.longitude);
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2
    ];
  };

  const formatPrice = (price) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
    return `$${price}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Property Map</h1>
            <p className="text-slate-500 mt-1">{filteredProperties.length} properties with locations</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Filters:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => (
                  <SelectItem key={s} value={s}>
                    {s === 'all' ? 'All Statuses' : s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={listingTypeFilter} onValueChange={setListingTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {LISTING_TYPES.map(t => (
                  <SelectItem key={t} value={t}>
                    {t === 'all' ? 'All Types' : t === 'sale' ? 'For Sale' : 'For Rent'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100"
        >
          <div className="h-[600px]">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                <div className="animate-pulse text-slate-400">Loading map...</div>
              </div>
            ) : (
              <MapContainer
                center={getCenter()}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredProperties.map(property => (
                  <Marker
                    key={property.id}
                    position={[property.latitude, property.longitude]}
                    eventHandlers={{
                      click: () => setSelectedProperty(property)
                    }}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        {property.images && property.images.length > 0 && (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-24 object-cover rounded mb-2"
                          />
                        )}
                        <h3 className="font-semibold text-slate-900">{property.title}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {property.address}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-lg">{formatPrice(property.price)}</span>
                          <Badge className={statusColors[property.status]} size="sm">
                            {property.status?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex gap-3 mt-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Bed className="w-3 h-3" /> {property.bedrooms || '—'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="w-3 h-3" /> {property.bathrooms || '—'}
                          </span>
                        </div>
                        <Link
                          to={createPageUrl(`PropertyDetails?id=${property.id}`)}
                          className="block mt-3 text-center py-1.5 bg-slate-900 text-white rounded text-sm hover:bg-slate-800 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </motion.div>

        {/* No locations message */}
        {!isLoading && filteredProperties.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center py-8 bg-white rounded-2xl border border-slate-100"
          >
            <MapPin className="w-12 h-12 mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500">No properties with locations found</p>
            <p className="text-sm text-slate-400 mt-1">Add latitude and longitude to your properties to see them on the map</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}