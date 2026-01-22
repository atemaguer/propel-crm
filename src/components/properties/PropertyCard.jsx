import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Square, DollarSign, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const statusColors = {
  available: 'bg-emerald-100 text-emerald-700',
  under_contract: 'bg-amber-100 text-amber-700',
  sold: 'bg-slate-100 text-slate-700',
  rented: 'bg-blue-100 text-blue-700',
  off_market: 'bg-rose-100 text-rose-700'
};

const typeLabels = {
  apartment: 'Apartment',
  house: 'House',
  condo: 'Condo',
  townhouse: 'Townhouse',
  land: 'Land',
  commercial: 'Commercial',
  other: 'Other'
};

export default function PropertyCard({ property, index = 0 }) {
  const formatPrice = (price) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
    return `$${price}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={createPageUrl(`PropertyDetails?id=${property.id}`)}>
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300 group cursor-pointer">
          <div className="relative h-48 bg-slate-100 overflow-hidden">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <Square className="w-12 h-12 text-slate-300" />
              </div>
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className={statusColors[property.status]}>
                {property.status?.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" className="bg-white/90 text-slate-700">
                {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
              </Badge>
            </div>
            {property.portal_listings && property.portal_listings.length > 0 && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-indigo-600 text-white">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {property.portal_listings.length} Portal{property.portal_listings.length > 1 ? 's' : ''}
                </Badge>
              </div>
            )}
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {property.title}
                </h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {property.address}, {property.city}
                </p>
              </div>
              <p className="text-xl font-bold text-slate-900">
                {formatPrice(property.price)}
                {property.listing_type === 'rent' && <span className="text-sm font-normal text-slate-500">/mo</span>}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-600 flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-slate-400" />
                {property.bedrooms || '—'} beds
              </span>
              <span className="text-sm text-slate-600 flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-slate-400" />
                {property.bathrooms || '—'} baths
              </span>
              <span className="text-sm text-slate-600 flex items-center gap-1.5">
                <Square className="w-4 h-4 text-slate-400" />
                {property.area_sqft?.toLocaleString() || '—'} sqft
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-3 uppercase tracking-wide">
              {typeLabels[property.property_type]}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}