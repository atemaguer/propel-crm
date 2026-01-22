import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

const INTERACTION_TYPES = [
  { value: 'call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'viewing', label: 'Property Viewing' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note', label: 'Note' },
  { value: 'offer', label: 'Offer' },
  { value: 'contract', label: 'Contract' }
];

const OUTCOMES = [
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
  { value: 'pending', label: 'Pending' }
];

export default function InteractionForm({ interaction, clientId, properties, onSave, onClose }) {
  const [formData, setFormData] = useState(interaction || {
    client_id: clientId,
    property_id: '',
    type: 'note',
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 16),
    outcome: 'pending'
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    if (interaction?.id) {
      await base44.entities.Interaction.update(interaction.id, formData);
    } else {
      await base44.entities.Interaction.create(formData);
    }
    
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{interaction ? 'Edit Interaction' : 'Log Interaction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INTERACTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Outcome</Label>
              <Select value={formData.outcome} onValueChange={(v) => handleChange('outcome', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OUTCOMES.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Brief summary of the interaction"
              required
            />
          </div>

          <div>
            <Label>Date & Time</Label>
            <Input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
          </div>

          <div>
            <Label>Related Property (optional)</Label>
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
            <Label>Notes</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Details about the interaction..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {interaction ? 'Update' : 'Save'} Interaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}