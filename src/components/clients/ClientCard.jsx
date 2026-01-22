import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const typeColors = {
  buyer: 'bg-blue-100 text-blue-700',
  seller: 'bg-purple-100 text-purple-700',
  both: 'bg-amber-100 text-amber-700'
};

const statusColors = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-600',
  closed: 'bg-rose-100 text-rose-700'
};

export default function ClientCard({ client, index = 0 }) {
  const formatBudget = (min, max) => {
    const format = (n) => {
      if (!n) return null;
      if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
      return `$${n}`;
    };
    const minStr = format(min);
    const maxStr = format(max);
    if (minStr && maxStr) return `${minStr} - ${maxStr}`;
    if (minStr) return `From ${minStr}`;
    if (maxStr) return `Up to ${maxStr}`;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={createPageUrl(`ClientDetails?id=${client.id}`)}>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all duration-300 group cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
              {client.avatar_url ? (
                <img src={client.avatar_url} alt={client.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                  {client.name}
                </h3>
                <div className="flex gap-1.5">
                  <Badge className={typeColors[client.client_type]}>{client.client_type}</Badge>
                  <Badge className={statusColors[client.status]}>{client.status}</Badge>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                {client.email && (
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {client.email}
                  </p>
                )}
                {client.phone && (
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {client.phone}
                  </p>
                )}
              </div>
              {(client.budget_min || client.budget_max) && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    Budget: {formatBudget(client.budget_min, client.budget_max)}
                  </p>
                </div>
              )}
              {client.preferred_locations?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {client.preferred_locations.slice(0, 3).map((loc, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {loc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}