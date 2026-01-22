import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plus, Bell, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isPast, isToday, isTomorrow, addDays, isWithinInterval } from 'date-fns';

import ReminderCard from '@/components/dashboard/ReminderCard';
import ReminderForm from '@/components/reminders/ReminderForm';
import StatsCard from '@/components/dashboard/StatsCard';

export default function Reminders() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => base44.entities.Reminder.list('due_date')
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Reminder.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] })
  });

  const filteredReminders = reminders.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  // Group reminders
  const overdueReminders = filteredReminders.filter(r => r.status === 'pending' && isPast(new Date(r.due_date)));
  const todayReminders = filteredReminders.filter(r => r.status === 'pending' && isToday(new Date(r.due_date)));
  const upcomingReminders = filteredReminders.filter(r => {
    const dueDate = new Date(r.due_date);
    return r.status === 'pending' && !isPast(dueDate) && !isToday(dueDate);
  });
  const completedReminders = filteredReminders.filter(r => r.status === 'completed');

  const handleComplete = (reminder) => {
    updateMutation.mutate({ id: reminder.id, data: { status: 'completed' } });
  };

  const handleDismiss = (reminder) => {
    updateMutation.mutate({ id: reminder.id, data: { status: 'dismissed' } });
  };

  // Stats
  const pendingCount = reminders.filter(r => r.status === 'pending').length;
  const overdueCount = reminders.filter(r => r.status === 'pending' && isPast(new Date(r.due_date))).length;
  const todayCount = reminders.filter(r => r.status === 'pending' && isToday(new Date(r.due_date))).length;
  const thisWeekCount = reminders.filter(r => {
    const dueDate = new Date(r.due_date);
    return r.status === 'pending' && isWithinInterval(dueDate, { start: new Date(), end: addDays(new Date(), 7) });
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reminders</h1>
            <p className="text-slate-500 mt-1">Stay on top of your tasks and follow-ups</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800">
            <Plus className="w-4 h-4 mr-2" /> New Reminder
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatsCard
            title="Total Pending"
            value={pendingCount}
            icon={Bell}
            accentColor="bg-blue-500"
          />
          <StatsCard
            title="Overdue"
            value={overdueCount}
            icon={AlertTriangle}
            accentColor="bg-rose-500"
          />
          <StatsCard
            title="Due Today"
            value={todayCount}
            icon={Clock}
            accentColor="bg-amber-500"
          />
          <StatsCard
            title="This Week"
            value={thisWeekCount}
            icon={Calendar}
            accentColor="bg-emerald-500"
          />
        </div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Reminders List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />
            ))}
          </div>
        ) : statusFilter === 'pending' ? (
          <div className="space-y-8">
            {/* Overdue */}
            {overdueReminders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-rose-600 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Overdue ({overdueReminders.length})
                </h3>
                <div className="space-y-3">
                  {overdueReminders.map(reminder => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      clients={clients}
                      properties={properties}
                      onComplete={handleComplete}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Today */}
            {todayReminders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-amber-600 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Due Today ({todayReminders.length})
                </h3>
                <div className="space-y-3">
                  {todayReminders.map(reminder => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      clients={clients}
                      properties={properties}
                      onComplete={handleComplete}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcomingReminders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Upcoming ({upcomingReminders.length})
                </h3>
                <div className="space-y-3">
                  {upcomingReminders.map(reminder => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      clients={clients}
                      properties={properties}
                      onComplete={handleComplete}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </div>
              </div>
            )}

            {overdueReminders.length === 0 && todayReminders.length === 0 && upcomingReminders.length === 0 && (
              <EmptyState onAdd={() => setShowForm(true)} />
            )}
          </div>
        ) : filteredReminders.length > 0 ? (
          <div className="space-y-3">
            {filteredReminders.map(reminder => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                clients={clients}
                properties={properties}
                onComplete={handleComplete}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        ) : (
          <EmptyState onAdd={() => setShowForm(true)} />
        )}
      </div>

      {showForm && (
        <ReminderForm
          clients={clients}
          properties={properties}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20"
    >
      <Bell className="w-16 h-16 mx-auto text-slate-200 mb-4" />
      <h3 className="text-xl font-semibold text-slate-600 mb-2">No reminders</h3>
      <p className="text-slate-400 mb-6">Create reminders to stay organized</p>
      <Button onClick={onAdd} className="bg-slate-900 hover:bg-slate-800">
        <Plus className="w-4 h-4 mr-2" /> Create Your First Reminder
      </Button>
    </motion.div>
  );
}