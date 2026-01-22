import React from 'react';
import { motion } from 'framer-motion';
import { Home, User, Calendar, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  partially_paid: 'bg-blue-100 text-blue-700'
};

export default function CommissionCard({ commission, property, client, index = 0 }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Badge className={statusColors[commission.status]}>{commission.status?.replace('_', ' ')}</Badge>
            <Badge variant="outline">{commission.deal_type}</Badge>
          </div>
          <div className="mt-3 space-y-2">
            {property && (
              <p className="font-semibold text-slate-900 flex items-center gap-2">
                <Home className="w-4 h-4 text-slate-400" />
                {property.title}
              </p>
            )}
            {client && (
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                {client.name}
              </p>
            )}
            {commission.closing_date && (
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Closing: {format(new Date(commission.closing_date), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(commission.commission_amount)}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {commission.commission_rate}% of {formatCurrency(commission.deal_value)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}