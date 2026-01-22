import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { X, Loader2, Plus } from 'lucide-react';

const CLIENT_TYPES = ['buyer', 'seller', 'both'];
const STATUSES = ['active', 'inactive', 'closed'];
const SOURCES = ['referral', 'website', 'portal', 'social_media', 'cold_call', 'other'];
const PROPERTY_TYPES = ['Apartment', 'House', 'Condo', 'Townhouse', 'Land', 'Commercial'];

export default function ClientForm({ client, onSave, onClose }) {
  const [formData, setFormData] = useState(client || {
    name: '',
    email: '',
    phone: '',
    client_type: 'buyer',
    status: 'active',
    budget_min: '',
    budget_max: '',
    preferred_locations: [],
    preferred_property_types: [],
    notes: '',
    source: ''
  });
  const [saving, setSaving] = useState(false);
  const [newLocation, setNewLocation] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      setFormData(prev => ({
        ...prev,
        preferred_locations: [...(prev.preferred_locations || []), newLocation.trim()]
      }));
      setNewLocation('');
    }
  };

  const removeLocation = (index) => {
    setFormData(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.filter((_, i) => i !== index)
    }));
  };

  const togglePropertyType = (type) => {
    setFormData(prev => ({
      ...prev,
      preferred_property_types: prev.preferred_property_types?.includes(type)
        ? prev.preferred_property_types.filter(t => t !== type)
        : [...(prev.preferred_property_types || []), type]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const dataToSave = {
      ...formData,
      budget_min: formData.budget_min ? Number(formData.budget_min) : null,
      budget_max: formData.budget_max ? Number(formData.budget_max) : null
    };

    if (client?.id) {
      await base44.entities.Client.update(client.id, dataToSave);
    } else {
      await base44.entities.Client.create(dataToSave);
    }
    
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{client ? 'Edit Client' : 'Add New Client'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Basic Info */}
          <div>
            <Label>Full Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Smith"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Type & Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Client Type</Label>
              <Select value={formData.client_type} onValueChange={(v) => handleChange('client_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CLIENT_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
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
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Source</Label>
              <Select value={formData.source || ''} onValueChange={(v) => handleChange('source', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {SOURCES.map(s => (
                    <SelectItem key={s} value={s}>{s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Budget */}
          {(formData.client_type === 'buyer' || formData.client_type === 'both') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Budget ($)</Label>
                <Input
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => handleChange('budget_min', e.target.value)}
                  placeholder="200000"
                />
              </div>
              <div>
                <Label>Max Budget ($)</Label>
                <Input
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => handleChange('budget_max', e.target.value)}
                  placeholder="500000"
                />
              </div>
            </div>
          )}

          {/* Preferred Locations */}
          <div>
            <Label>Preferred Locations</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Add a location..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
              />
              <Button type="button" variant="outline" onClick={addLocation}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.preferred_locations?.map((loc, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-sm flex items-center gap-1">
                  {loc}
                  <button type="button" onClick={() => removeLocation(i)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Property Types */}
          <div>
            <Label>Preferred Property Types</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {PROPERTY_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => togglePropertyType(type)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    formData.preferred_property_types?.includes(type)
                      ? 'bg-amber-100 text-amber-700 border-amber-300 border'
                      : 'bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes about this client..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {client ? 'Update Client' : 'Create Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}