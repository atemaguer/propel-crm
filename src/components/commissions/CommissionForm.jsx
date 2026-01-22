import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

const DEAL_TYPES = ['sale', 'rental'];
const STATUSES = ['pending', 'paid', 'partially_paid'];

export default function CommissionForm({ commission, properties, clients, onSave, onClose }) {
  const [formData, setFormData] = useState(commission || {
    property_id: '',
    client_id: '',
    deal_type: 'sale',
    deal_value: '',
    commission_rate: 3,
    commission_amount: '',
    status: 'pending',
    closing_date: '',
    payment_date: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-calculate commission amount
  useEffect(() => {
    if (formData.deal_value && formData.commission_rate) {
      const amount = Number(formData.deal_value) * (Number(formData.commission_rate) / 100);
      setFormData(prev => ({ ...prev, commission_amount: amount.toFixed(2) }));
    }
  }, [formData.deal_value, formData.commission_rate]);

  // Auto-fill from selected property
  useEffect(() => {
    if (formData.property_id) {
      const property = properties.find(p => p.id === formData.property_id);
      if (property) {
        setFormData(prev => ({
          ...prev,
          deal_value: property.price || prev.deal_value,
          commission_rate: property.commission_rate || prev.commission_rate,
          deal_type: property.listing_type === 'rent' ? 'rental' : 'sale',
          client_id: property.owner_client_id || prev.client_id
        }));
      }
    }
  }, [formData.property_id, properties]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const dataToSave = {
      ...formData,
      deal_value: Number(formData.deal_value),
      commission_rate: Number(formData.commission_rate),
      commission_amount: Number(formData.commission_amount)
    };

    if (commission?.id) {
      await base44.entities.Commission.update(commission.id, dataToSave);
    } else {
      await base44.entities.Commission.create(dataToSave);
    }
    
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{commission ? 'Edit Commission' : 'Record Commission'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Property</Label>
              <Select value={formData.property_id || ''} onValueChange={(v) => handleChange('property_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  {properties?.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Client</Label>
              <Select value={formData.client_id || ''} onValueChange={(v) => handleChange('client_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients?.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Deal Type</Label>
              <Select value={formData.deal_type} onValueChange={(v) => handleChange('deal_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEAL_TYPES.map(t => (
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
                    <SelectItem key={s} value={s}>{s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Deal Value ($)</Label>
              <Input
                type="number"
                value={formData.deal_value}
                onChange={(e) => handleChange('deal_value', e.target.value)}
                placeholder="500000"
                required
              />
            </div>
            <div>
              <Label>Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.commission_rate}
                onChange={(e) => handleChange('commission_rate', e.target.value)}
                placeholder="3"
              />
            </div>
            <div>
              <Label>Commission ($)</Label>
              <Input
                type="number"
                value={formData.commission_amount}
                onChange={(e) => handleChange('commission_amount', e.target.value)}
                placeholder="15000"
                className="bg-emerald-50 font-semibold text-emerald-700"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Closing Date</Label>
              <Input
                type="date"
                value={formData.closing_date || ''}
                onChange={(e) => handleChange('closing_date', e.target.value)}
              />
            </div>
            <div>
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={formData.payment_date || ''}
                onChange={(e) => handleChange('payment_date', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional details..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {commission ? 'Update' : 'Record'} Commission
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}