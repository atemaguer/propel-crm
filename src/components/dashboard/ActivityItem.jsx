import React from 'react';
import { Phone, Mail, Eye, Users, FileText, Handshake, StickyNote } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const typeConfig = {
  call: { icon: Phone, color: 'bg-blue-100 text-blue-600' },
  email: { icon: Mail, color: 'bg-purple-100 text-purple-600' },
  viewing: { icon: Eye, color: 'bg-amber-100 text-amber-600' },
  meeting: { icon: Users, color: 'bg-emerald-100 text-emerald-600' },
  note: { icon: StickyNote, color: 'bg-slate-100 text-slate-600' },
  offer: { icon: FileText, color: 'bg-rose-100 text-rose-600' },
  contract: { icon: Handshake, color: 'bg-indigo-100 text-indigo-600' }
};

export default function ActivityItem({ interaction, client, property }) {
  const config = typeConfig[interaction.type] || typeConfig.note;
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-4 py-3">
      <div className={`p-2 rounded-lg ${config.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900">{interaction.title}</p>
        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
          {client && <span>{client.name}</span>}
          {client && property && <span>•</span>}
          {property && <span>{property.title}</span>}
        </div>
      </div>
      <span className="text-xs text-slate-400 whitespace-nowrap">
        {formatDistanceToNow(new Date(interaction.date || interaction.created_date), { addSuffix: true })}
      </span>
    </div>
  );
}