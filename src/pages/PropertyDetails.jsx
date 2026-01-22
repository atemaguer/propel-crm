import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  ArrowLeft, Edit, Trash2, MapPin, Bed, Bath, Square, DollarSign, 
  Calendar, ExternalLink, User, Home, Plus, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import PropertyForm from '@/components/properties/PropertyForm';

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

export default function PropertyDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('id');
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => base44.entities.Property.list().then(props => props.find(p => p.id === propertyId)),
    enabled: !!propertyId
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['interactions'],
    queryFn: () => base44.entities.Interaction.filter({ property_id: propertyId }, '-created_date'),
    enabled: !!propertyId
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Property.delete(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigate(createPageUrl('Properties'));
    }
  });

  const owner = clients.find(c => c.id === property?.owner_client_id);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading property...</div>
      </div>
    );
  }

  const nextImage = () => {
    if (property.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link to={createPageUrl('Properties')}>
          <Button variant="ghost" className="mb-6 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Properties
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video"
            >
              {property.images && property.images.length > 0 ? (
                <>
                  <img
                    src={property.images[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {property.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImageIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="w-20 h-20 text-slate-300" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className={statusColors[property.status]}>{property.status?.replace('_', ' ')}</Badge>
                <Badge variant="secondary" className="bg-white/90">{property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}</Badge>
              </div>
            </motion.div>

            {/* Property Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-slate-100">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">{property.title}</h1>
                      <p className="text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {property.address}, {property.city} {property.zip_code}
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                      {formatCurrency(property.price)}
                      {property.listing_type === 'rent' && <span className="text-lg font-normal text-slate-500">/mo</span>}
                    </p>
                  </div>

                  <div className="flex gap-6 py-4 border-y border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5 text-slate-400" />
                      <span className="font-medium">{property.bedrooms || '—'}</span>
                      <span className="text-slate-500">Beds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5 text-slate-400" />
                      <span className="font-medium">{property.bathrooms || '—'}</span>
                      <span className="text-slate-500">Baths</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Square className="w-5 h-5 text-slate-400" />
                      <span className="font-medium">{property.area_sqft?.toLocaleString() || '—'}</span>
                      <span className="text-slate-500">sqft</span>
                    </div>
                  </div>

                  {property.description && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                      <p className="text-slate-600 leading-relaxed">{property.description}</p>
                    </div>
                  )}

                  {property.features && property.features.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-slate-900 mb-3">Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {property.features.map((feature, i) => (
                          <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Map */}
            {property.latitude && property.longitude && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-slate-100 overflow-hidden">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-lg">Location</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 mt-4">
                    <div className="h-72">
                      <MapContainer
                        center={[property.latitude, property.longitude]}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[property.latitude, property.longitude]}>
                          <Popup>{property.title}</Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-slate-100">
                <CardContent className="p-4 space-y-3">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={() => setShowEditForm(true)}>
                    <Edit className="w-4 h-4 mr-2" /> Edit Property
                  </Button>
                  <Button variant="outline" className="w-full text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Property
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Owner Info */}
            {owner && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-slate-100">
                  <CardHeader>
                    <CardTitle className="text-lg">Property Owner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link to={createPageUrl(`ClientDetails?id=${owner.id}`)}>
                      <div className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{owner.name}</p>
                          <p className="text-sm text-slate-500">{owner.email}</p>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Commission Info */}
            {property.commission_rate && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="border-slate-100">
                  <CardHeader>
                    <CardTitle className="text-lg">Commission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Rate</span>
                      <span className="font-semibold">{property.commission_rate}%</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-slate-500">Potential</span>
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(property.price * (property.commission_rate / 100))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Contract Info */}
            {property.contract_end_date && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-slate-100">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5" /> Contract
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-500">Ends on</p>
                    <p className="font-semibold text-slate-900">
                      {format(new Date(property.contract_end_date), 'MMMM d, yyyy')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Portal Listings */}
            {property.portal_listings && property.portal_listings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="border-slate-100">
                  <CardHeader>
                    <CardTitle className="text-lg">Portal Listings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {property.portal_listings.map((portal, i) => (
                      <a
                        key={i}
                        href={portal.listing_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{portal.portal_name}</p>
                          {portal.listed_date && (
                            <p className="text-xs text-slate-500">
                              Listed {format(new Date(portal.listed_date), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </a>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {showEditForm && (
        <PropertyForm
          property={property}
          clients={clients}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            setShowEditForm(false);
          }}
          onClose={() => setShowEditForm(false)}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{property.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-rose-600 hover:bg-rose-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}