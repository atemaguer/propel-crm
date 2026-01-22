import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Home, User, Check, X } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const typeIcons = {
  contract_renewal: Calendar,
  viewing: Home,
  follow_up: User,
  payment: Bell,
  custom: Bell
};

const priorityColors = {
  high: 'bg-rose-100 text-rose-700 border-rose-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

export default function ReminderCard({ reminder, onComplete, onDismiss, clients, properties }) {
  const Icon = typeIcons[reminder.reminder_type] || Bell;
  const dueDate = new Date(reminder.due_date);
  const isOverdue = isPast(dueDate) && reminder.status === 'pending';
  
  const getDateLabel = () => {
    if (isToday(dueDate)) return 'Today';
    if (isTomorrow(dueDate)) return 'Tomorrow';
    return format(dueDate, 'MMM d, yyyy');
  };

  const client = clients?.find(c => c.id === reminder.client_id);
  const property = properties?.find(p => p.id === reminder.property_id);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-white rounded-xl p-4 border ${isOverdue ? 'border-rose-200 bg-rose-50/50' : 'border-slate-100'} hover:shadow-sm transition-all`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-lg ${isOverdue ? 'bg-rose-100' : 'bg-slate-100'}`}>
          <Icon className={`w-5 h-5 ${isOverdue ? 'text-rose-600' : 'text-slate-600'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-slate-900 truncate">{reminder.title}</h4>
              <p className="text-sm text-slate-500 mt-0.5">{reminder.description}</p>
            </div>
            <Badge variant="outline" className={priorityColors[reminder.priority]}>
              {reminder.priority}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-medium' : ''}`}>
              <Calendar className="w-4 h-4" />
              {getDateLabel()} at {format(dueDate, 'h:mm a')}
            </span>
            {client && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {client.name}
              </span>
            )}
            {property && (
              <span className="flex items-center gap-1">
                <Home className="w-4 h-4" />
                {property.title}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => onComplete(reminder)} className="h-8 w-8 text-emerald-600 hover:bg-emerald-50">
            <Check className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDismiss(reminder)} className="h-8 w-8 text-slate-400 hover:bg-slate-50">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}