import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { Plus, X, Upload, Loader2 } from 'lucide-react';

const PROPERTY_TYPES = ['apartment', 'house', 'condo', 'townhouse', 'land', 'commercial', 'other'];
const LISTING_TYPES = ['sale', 'rent'];
const STATUSES = ['available', 'under_contract', 'sold', 'rented', 'off_market'];

const FEATURE_OPTIONS = [
  'Pool', 'Garage', 'Garden', 'Balcony', 'Fireplace', 'Central AC', 
  'Hardwood Floors', 'Updated Kitchen', 'Smart Home', 'Security System',
  'Gym', 'Parking', 'Elevator', 'Storage', 'Pet Friendly'
];

export default function PropertyForm({ property, onSave, onClose, clients }) {
  const [formData, setFormData] = useState(property || {
    title: '',
    address: '',
    city: '',
    zip_code: '',
    property_type: 'house',
    status: 'available',
    listing_type: 'sale',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area_sqft: '',
    description: '',
    features: [],
    images: [],
    latitude: '',
    longitude: '',
    owner_client_id: '',
    commission_rate: 3,
    portal_listings: []
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    const uploadedUrls = [];
    
    for (const file of files) {
      const result = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(result.file_url);
    }
    
    setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...uploadedUrls] }));
    setUploading(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const toggleFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...(prev.features || []), feature]
    }));
  };

  const addPortalListing = () => {
    setFormData(prev => ({
      ...prev,
      portal_listings: [...(prev.portal_listings || []), { portal_name: '', listing_url: '', listed_date: '' }]
    }));
  };

  const updatePortalListing = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      portal_listings: prev.portal_listings.map((p, i) => i === index ? { ...p, [field]: value } : p)
    }));
  };

  const removePortalListing = (index) => {
    setFormData(prev => ({
      ...prev,
      portal_listings: prev.portal_listings.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const dataToSave = {
      ...formData,
      price: Number(formData.price),
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
      area_sqft: formData.area_sqft ? Number(formData.area_sqft) : null,
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
      commission_rate: formData.commission_rate ? Number(formData.commission_rate) : null
    };

    if (property?.id) {
      await base44.entities.Property.update(property.id, dataToSave);
    } else {
      await base44.entities.Property.create(dataToSave);
    }
    
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{property ? 'Edit Property' : 'Add New Property'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Property Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Luxury Downtown Apartment"
                required
              />
            </div>
            <div className="col-span-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main Street"
                required
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="New York"
              />
            </div>
            <div>
              <Label>ZIP Code</Label>
              <Input
                value={formData.zip_code}
                onChange={(e) => handleChange('zip_code', e.target.value)}
                placeholder="10001"
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Property Type</Label>
              <Select value={formData.property_type} onValueChange={(v) => handleChange('property_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Listing Type</Label>
              <Select value={formData.listing_type} onValueChange={(v) => handleChange('listing_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LISTING_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t === 'sale' ? 'For Sale' : 'For Rent'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price & Specs */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Price ($)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="500000"
                required
              />
            </div>
            <div>
              <Label>Bedrooms</Label>
              <Input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleChange('bedrooms', e.target.value)}
                placeholder="3"
              />
            </div>
            <div>
              <Label>Bathrooms</Label>
              <Input
                type="number"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => handleChange('bathrooms', e.target.value)}
                placeholder="2"
              />
            </div>
            <div>
              <Label>Area (sqft)</Label>
              <Input
                type="number"
                value={formData.area_sqft}
                onChange={(e) => handleChange('area_sqft', e.target.value)}
                placeholder="1500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the property..."
              rows={4}
            />
          </div>

          {/* Features */}
          <div>
            <Label>Features</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {FEATURE_OPTIONS.map(feature => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    formData.features?.includes(feature)
                      ? 'bg-amber-100 text-amber-700 border-amber-300 border'
                      : 'bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <Label>Images</Label>
            <div className="mt-2">
              <div className="flex flex-wrap gap-3">
                {formData.images?.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-24 h-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-amber-400 transition-colors">
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : <Upload className="w-6 h-6 text-slate-400" />}
                </label>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
                placeholder="40.7128"
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
                placeholder="-74.0060"
              />
            </div>
          </div>

          {/* Owner & Commission */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Property Owner</Label>
              <Select value={formData.owner_client_id || ''} onValueChange={(v) => handleChange('owner_client_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                <SelectContent>
                  {clients?.filter(c => c.client_type !== 'buyer').map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Commission Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.commission_rate}
                onChange={(e) => handleChange('commission_rate', e.target.value)}
                placeholder="3"
              />
            </div>
          </div>

          {/* Contract End Date */}
          <div>
            <Label>Contract End Date</Label>
            <Input
              type="date"
              value={formData.contract_end_date || ''}
              onChange={(e) => handleChange('contract_end_date', e.target.value)}
            />
          </div>

          {/* Portal Listings */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Portal Listings</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPortalListing}>
                <Plus className="w-4 h-4 mr-1" /> Add Portal
              </Button>
            </div>
            <div className="space-y-3">
              {formData.portal_listings?.map((portal, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Input
                    placeholder="Portal name (e.g., Zillow)"
                    value={portal.portal_name}
                    onChange={(e) => updatePortalListing(i, 'portal_name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Listing URL"
                    value={portal.listing_url}
                    onChange={(e) => updatePortalListing(i, 'listing_url', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={portal.listed_date}
                    onChange={(e) => updatePortalListing(i, 'listed_date', e.target.value)}
                    className="w-36"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removePortalListing(i)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {property ? 'Update Property' : 'Create Property'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}